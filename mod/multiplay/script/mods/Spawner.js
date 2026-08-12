namespace("tdspawner_")

function tdspawner_eventStartLevel()
{
	flush();
}

function flush()
{
	// Back off whenever nothing came out, so a wave player with no usable spawn
	// tiles cannot turn this into a busy loop.
	if (Spawner.spawn() > 0 && Spawner.queue.length > 0)
	{
		queue("flush");
	}
	else
	{
		queue("flush", 2 * 1000);
	}
}

class Spawner
{
	static {
		SaveLoad.persist(this);
	}

	static players = [];   // wave players, in slot order
	static modes = {};     // player -> spawn mode, see WAVE_SCRIPTS
	static locations = {}; // player -> array of [x, y] tiles for the current round
	static queue = [];     // { template, player }
	static rank = 0;

	static readyAt = {};   // player -> gameTime before which it may not spawn
	static bossDrops = {}; // droid id -> the component it leaves as a crate

	// Tunables, see configAPI.js
	static rate = 5;               // units released per tick
	static radius = 8;             // how wide the base/center spawn area is
	static dropPodMinDistance = 20; // tiles a drop pod must keep from every HQ
	static dropPodBurst = 25;       // drop pod units spawned per tick
	static dropPodWarning = 10;     // seconds of warning before a drop pod lands
	static campRadius = 4;         // tiles that count as sitting on a spawn point
	static campTries = 6;          // how many tiles to check before giving up
	static reachable = {};         // "x,y" -> can the horde walk from there to an HQ
	static spiralStart = 0;        // where in the spiral this round begins
	static spiralStep = 0;         // how far along it the round has got

	/**
	 * @returns {number} how many units were actually spawned
	 */
	static spawn()
	{
		if (Spawner.queue.length === 0)
		{
			return 0;
		}

		const player = Spawner.queue[0].player;

		// A drop pod holds off until its warning has run, so the defenders get to
		// see the beacon before the horde lands on it.
		if (Spawner.readyAt[player] > gameTime)
		{
			return 0;
		}

		const locations = Spawner.locationsFor(player);
		if (locations.length === 0)
		{
			// Nowhere to put this unit. Drop it rather than blocking the queue
			// behind it forever.
			Spawner.queue.shift();
			return 0;
		}

		// A drop pod is meant to land as one horde. The rest come in at the normal
		// rate, which is still several at a time - trickling them out one by one
		// lets the defenders pick them off as they appear, which is not a wave.
		const dropPod = Spawner.modes[player] === "droppod";
		const burst = dropPod ? Spawner.dropPodBurst : Spawner.rate;

		// A drop pod lands on a single spot; everything else spreads over its area
		// so a batch does not arrive in one killable pile.
		const shared = dropPod ? Spawner.pickLocation(locations) : null;

		const batch = Spawner.take(player, burst);
		for (const entry of batch)
		{
			const [x, y] = shared !== null ? shared : Spawner.pickLocation(locations);
			const droid = Template.spawn(entry.template, player, x, y);

			// Most units take the round's rank; a boss carries its own.
			const rank = entry.rank !== undefined ? entry.rank : Spawner.rank;
			setDroidExperience(droid, Stats.Brain["Z NULL BRAIN"].RankThresholds[rank]);

			// Remember which of its own parts a boss will leave behind
			if (entry.rank !== undefined && droid)
			{
				Spawner.bossDrops[droid.id] = Spawner.pickComponent(entry.template);
			}
		}

		return batch.length;
	}

	/**
	 * Prefer a spawn tile nobody is parked on.
	 *
	 * Sitting an army on the spawn point is the unit version of ringing it with
	 * towers, and no event fires for it. Rather than punishing it, the horde
	 * just comes in somewhere else - camping becomes pointless instead of
	 * forbidden, and nobody loses units to a rule they did not read.
	 *
	 * @param {number[][]} locations
	 * @returns {number[]} an [x, y] tile
	 */
	static pickLocation(locations)
	{
		const defenders = waveDefenders();

		// No randomness at all here, by design. The tiles are already in spiral
		// order, so walking them in sequence spreads a batch out from the centre
		// on its own - and the whole round only ever rolled one number, back in
		// newRound(), to decide where in the spiral to begin.
		//
		// It used to roll per unit, and roll again for every tile it rejected as
		// camped. syncRandom() is a sequence shared by every machine in the game:
		// a client that rolls a different number of times is reading different
		// numbers from then on, and the horde comes in somewhere else on its
		// screen. That is what was breaking multiplayer.
		const total = locations.length;
		const start = Spawner.spiralStart + Spawner.spiralStep;
		Spawner.spiralStep++;

		const tries = Math.min(Spawner.campTries, total);
		for (let i = 0; i < tries; i++)
		{
			const candidate = locations[(start + i) % total];
			if (!Spawner.isCamped(candidate[0], candidate[1], defenders))
			{
				return candidate;
			}
		}

		// Everything we looked at was covered. Come in anyway: refusing to spawn
		// would stall the round and hand the game to whoever camped hardest.
		return locations[start % total];
	}

	static isCamped(x, y, defenders)
	{
		if (Spawner.campRadius <= 0)
		{
			return false;
		}

		// seen = false. The default only returns what is currently visible, and a
		// rules script that depends on who can see what will desync.
		for (const object of enumRange(x, y, Spawner.campRadius, ALL_PLAYERS, false))
		{
			if (object.type === DROID && defenders.includes(object.player))
			{
				return true;
			}
		}

		return false;
	}

	/**
	 * Pull up to `count` of that player's units off the queue.
	 *
	 * Without splitting, the queue interleaves the wave players, so a drop pod's
	 * burst cannot just read from the front.
	 *
	 * @returns {object[]} queue entries
	 */
	static take(player, count)
	{
		if (count === 1)
		{
			return [Spawner.queue.shift()]; // the caller already checked the front
		}

		const batch = [];
		const rest = [];

		for (const entry of Spawner.queue)
		{
			if (batch.length < count && entry.player === player)
			{
				batch.push(entry);
			}
			else
			{
				rest.push(entry);
			}
		}

		Spawner.queue = rest;
		return batch;
	}

	/**
	 * One of the parts a design is built from, for a boss to drop.
	 *
	 * Its own body, propulsion or one of its guns - so the crate is a piece of
	 * the thing that just killed you, not a random reward.
	 *
	 * @param {object} template
	 * @returns {string} a component name
	 */
	static pickComponent(template)
	{
		const parts = template.turrets.concat([template.body, template.propulsion]);
		return parts[syncRandom(parts.length)];
	}

	/**
	 * An empty array means "already looked, found nothing" - do not rescan, or
	 * a map with no usable tiles would redo the whole search for every unit.
	 */
	static locationsFor(player)
	{
		if (Spawner.locations[player] === undefined)
		{
			Spawner.updateLocations(player);
		}
		return Spawner.locations[player];
	}

	/**
	 * Called from processRound(). Re-rolls the spawn points of the two modes that
	 * are meant to move, and leaves the rest alone.
	 *
	 * It used to rebuild every mode's tiles each round, on the grounds that
	 * reachability changes as HQs are destroyed. That was a desync: the tiles are
	 * chosen with propulsionCanReach(), a pathfinding query answered against the
	 * blocking map as it stands right now, and by the seventh minute two clients
	 * with bases going up around them do not always answer it the same way in the
	 * same tick. Different tiles, same random number - the horde came in somewhere
	 * else on each screen. A spawn area is fixed terrain around a fixed start
	 * position, so working it out once is both safer and cheaper.
	 */
	static newRound()
	{
		// The round's one and only roll for where the horde comes in. Everything
		// after this walks the spiral in order, so the number of syncRandom()
		// calls a round makes is fixed no matter what happens in the game - which
		// is what keeps every machine reading the same numbers.
		//
		// A large prime so that the same list of tiles gives a different-looking
		// starting point each round, whatever its length.
		Spawner.spiralStart = syncRandom(9973);
		Spawner.spiralStep = 0;

		for (const player of Spawner.players)
		{
			const mode = Spawner.modes[player];

			// These two pick a new area every round by design
			if (mode === "random" || mode === "droppod")
			{
				Spawner.updateLocations(player);
			}

			if (mode === "droppod")
			{
				Spawner.warnDropPod(player);
			}
		}
	}

	/**
	 * Mark where the horde is about to land, and hold the drop back until the
	 * defenders have had a chance to react.
	 *
	 * A beacon is the game's own map marker, so it shows up on the minimap and
	 * on the terrain without the mod having to draw anything.
	 */
	static warnDropPod(player)
	{
		const locations = Spawner.locations[player];
		if (!locations || locations.length === 0)
		{
			return;
		}

		// Aim the marker at the middle of the landing zone, not a random tile.
		const sumX = locations.reduce((total, loc) => total + loc[0], 0);
		const sumY = locations.reduce((total, loc) => total + loc[1], 0);
		const x = Math.floor(sumX / locations.length);
		const y = Math.floor(sumY / locations.length);

		for (const defender of waveDefenders())
		{
			addBeacon(x, y, defender);
		}

		Spawner.readyAt[player] = gameTime + Spawner.dropPodWarning * 1000;
	}

	/**
	 * Work out where the given wave player's units come in.
	 */
	static updateLocations(player)
	{
		const mode = Spawner.modes[player] || "base";
		let locations = [];

		if (mode === "surround")
		{
			locations = Spawner.edgeTiles();
		}
		else if (mode === "random")
		{
			locations = Spawner.edgeTiles(syncRandom(4));
		}
		else if (mode === "center")
		{
			const { x, y, x2, y2 } = getScrollLimits();
			locations = Spawner.tilesAround(Math.floor((x + x2) / 2), Math.floor((y + y2) / 2));
		}
		else if (mode === "droppod")
		{
			locations = Spawner.dropPodTiles();
		}
		else if (startPositions[player])
		{
			locations = Spawner.tilesAround(startPositions[player].x, startPositions[player].y);
		}

		// Every mode falls back to the edges: a slot may have no usable start
		// position, and a drop pod may find no spot far enough from the HQs.
		if (locations.length === 0)
		{
			locations = Spawner.edgeTiles();
		}

		Spawner.locations[player] = locations;
	}

	/**
	 * Spawnable tiles around a point, centre first and working outwards.
	 *
	 * The order is the whole point. Units are handed tiles from this list in
	 * sequence, so a batch lands as a block growing out of the middle rather than
	 * scattered over the area - and, more importantly, the list is built the same
	 * way on every machine. Nothing here asks the game a question whose answer can
	 * change between clients: it walks fixed rings around a fixed centre, in a
	 * fixed direction, starting from the same corner every time.
	 *
	 * @param {number} cx - tile coordinate
	 * @param {number} cy - tile coordinate
	 * @returns {number[][]} spawnable tiles within Spawner.radius of the centre
	 */
	static tilesAround(cx, cy)
	{
		const canSpawnAt = Spawner.spawnFilter();
		const result = [];

		if (canSpawnAt(cx, cy))
		{
			result.push([cx, cy]);
		}

		for (let ring = 1; ring <= Spawner.radius; ring++)
		{
			for (const [x, y] of Spawner.ringTiles(cx, cy, ring))
			{
				if (canSpawnAt(x, y))
				{
					result.push([x, y]);
				}
			}
		}

		return result;
	}

	/**
	 * One square ring of tiles, walked clockwise from its top-left corner.
	 *
	 * @param {number} cx - tile coordinate of the centre
	 * @param {number} cy - tile coordinate of the centre
	 * @param {number} ring - how many tiles out from the centre
	 * @returns {number[][]} the ring, in order
	 */
	static ringTiles(cx, cy, ring)
	{
		const tiles = [];
		const x1 = cx - ring;
		const y1 = cy - ring;
		const x2 = cx + ring;
		const y2 = cy + ring;

		for (let x = x1; x < x2; x++)
		{
			tiles.push([x, y1]); // top edge, left to right
		}
		for (let y = y1; y < y2; y++)
		{
			tiles.push([x2, y]); // right edge, top to bottom
		}
		for (let x = x2; x > x1; x--)
		{
			tiles.push([x, y2]); // bottom edge, right to left
		}
		for (let y = y2; y > y1; y--)
		{
			tiles.push([x1, y]); // left edge, bottom to top
		}

		return tiles;
	}

	/**
	 * @param {number} [side] - 0 north, 1 south, 2 west, 3 east. All four if omitted.
	 * @returns {number[][]} spawnable tiles along the map edge
	 */
	static edgeTiles(side)
	{
		const canSpawnAt = Spawner.spawnFilter();
		const { x: x1, y: y1, x2, y2 } = getScrollLimits();
		const result = [];

		const add = (x, y) =>
		{
			if (canSpawnAt(x, y))
			{
				result.push([x, y]);
			}
		};

		if (side === undefined || side === 0) // North
		{
			for (let x = x1 + 1; x < x2 - 1; x++) { add(x, y1 + 1); }
		}
		if (side === undefined || side === 1) // South
		{
			for (let x = x1 + 1; x < x2 - 1; x++) { add(x, y2 - 2); }
		}
		if (side === undefined || side === 2) // West
		{
			for (let y = y1 + 2; y < y2 - 1; y++) { add(x1 + 1, y); }
		}
		if (side === undefined || side === 3) // East
		{
			for (let y = y1 + 2; y < y2 - 1; y++) { add(x2 - 2, y); }
		}

		return result;
	}

	/**
	 * One random spot anywhere on the map, far enough from every defender HQ
	 * that the horde does not land on top of somebody's base.
	 *
	 * @returns {number[][]} the tiles around that spot, or [] if none was found
	 */
	static dropPodTiles()
	{
		const canSpawnAt = Spawner.spawnFilter();
		const hqs = Spawner.defenderHQs();
		const { x: x1, y: y1, x2, y2 } = getScrollLimits();
		const minDistance = Spawner.dropPodMinDistance;

		const farEnough = (x, y) => hqs.every(hq =>
		{
			const dx = hq.x - x;
			const dy = hq.y - y;
			return Math.sqrt(dx * dx + dy * dy) >= minDistance;
		});

		const width = Math.max(1, x2 - x1 - 2);
		const height = Math.max(1, y2 - y1 - 2);
		const tiles = width * height;

		// One roll, then a fixed sweep. This used to roll a fresh pair of
		// coordinates for every attempt, up to two hundred times, so the number of
		// syncRandom() calls depended on how quickly a valid spot turned up - and
		// a machine that rolls a different number of times is reading different
		// numbers from then on. Now the roll only says where to start looking.
		//
		// Stepping by a prime walks the whole map without ever repeating a tile,
		// and lands somewhere different each step rather than crawling along one
		// row - so the first spot it accepts is still spread over the map.
		const start = syncRandom(tiles);
		const stride = 7919;
		const attempts = Math.min(tiles, 200);

		for (let i = 0; i < attempts; i++)
		{
			const index = (start + i * stride) % tiles;
			const x = x1 + 1 + (index % width);
			const y = y1 + 1 + Math.floor(index / width);

			if (canSpawnAt(x, y) && farEnough(x, y))
			{
				return Spawner.tilesAround(x, y);
			}
		}

		return [];
	}

	/**
	 * A tile is usable when the terrain allows it and the waves can actually
	 * walk from there to somebody's HQ.
	 */
	static spawnFilter()
	{
		const hqs = Spawner.defenderHQs();
		return (x, y) =>
		{
			if (terrainType(x, y) === TER_CLIFFFACE || terrainType(x, y) === TER_WATER)
			{
				return false; // terrain never changes, so this needs no cache
			}

			// Asked once per tile per game, and the first answer stands. The query
			// runs against the blocking map as it is right now, so asking again
			// later can give a different answer on one client than on another -
			// and every client has to agree on where the horde comes in.
			const key = x + "," + y;
			if (Spawner.reachable[key] === undefined)
			{
				Spawner.reachable[key] =
					hqs.some(hq => propulsionCanReach("wheeled01", x, y, hq.x, hq.y));
			}

			return Spawner.reachable[key];
		};
	}

	static defenderHQs()
	{
		let result = [];
		for (const player of waveDefenders())
		{
			result = result.concat(enumStruct(player, HQ));
		}
		return result;
	}
}
