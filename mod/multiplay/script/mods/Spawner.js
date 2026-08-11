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
	static meteorMinDistance = 20; // tiles a meteor must keep from every HQ
	static meteorBurst = 25;       // meteor units spawned per tick
	static meteorWarning = 10;     // seconds of warning before a meteor lands
	static campRadius = 4;         // tiles that count as sitting on a spawn point
	static campTries = 6;          // how many tiles to check before giving up

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

		// A meteor holds off until its warning has run, so the defenders get to
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

		// A meteor is meant to land as one horde. The rest come in at the normal
		// rate, which is still several at a time - trickling them out one by one
		// lets the defenders pick them off as they appear, which is not a wave.
		const meteor = Spawner.modes[player] === "meteor";
		const burst = meteor ? Spawner.meteorBurst : Spawner.rate;

		// A meteor lands on a single spot; everything else spreads over its area
		// so a batch does not arrive in one killable pile.
		const shared = meteor ? Spawner.pickLocation(locations) : null;

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
		let fallback = null;

		for (let attempt = 0; attempt < Spawner.campTries; attempt++)
		{
			const candidate = locations[syncRandom(locations.length)];
			if (fallback === null)
			{
				fallback = candidate;
			}

			if (!Spawner.isCamped(candidate[0], candidate[1], defenders))
			{
				return candidate;
			}
		}

		// Everything we looked at was covered. Come in anyway: refusing to spawn
		// would stall the round and hand the game to whoever camped hardest.
		return fallback;
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
	 * Without splitting, the queue interleaves the wave players, so a meteor's
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
	 * An empty array means "already looked, found nothing" - do not rescan, or
	 * a map with no usable tiles would redo the whole search for every unit.
	 */
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

	static locationsFor(player)
	{
		if (Spawner.locations[player] === undefined)
		{
			Spawner.updateLocations(player);
		}
		return Spawner.locations[player];
	}

	/**
	 * Called from processRound(). Re-rolls the Random and Meteor spawn points,
	 * and refreshes the rest, since reachability changes as HQs are destroyed.
	 */
	static newRound()
	{
		for (const player of Spawner.players)
		{
			Spawner.updateLocations(player);

			if (Spawner.modes[player] === "meteor")
			{
				Spawner.warnMeteor(player);
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
	static warnMeteor(player)
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

		Spawner.readyAt[player] = gameTime + Spawner.meteorWarning * 1000;
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
		else if (mode === "meteor")
		{
			locations = Spawner.meteorTiles();
		}
		else if (startPositions[player])
		{
			locations = Spawner.tilesAround(startPositions[player].x, startPositions[player].y);
		}

		// Every mode falls back to the edges: a slot may have no usable start
		// position, and a meteor may find no spot far enough from the HQs.
		if (locations.length === 0)
		{
			locations = Spawner.edgeTiles();
		}

		Spawner.locations[player] = locations;
	}

	/**
	 * @param {number} cx - tile coordinate
	 * @param {number} cy - tile coordinate
	 * @returns {number[][]} spawnable tiles within Spawner.radius of the centre
	 */
	static tilesAround(cx, cy)
	{
		const canSpawnAt = Spawner.spawnFilter();
		const result = [];
		const r = Spawner.radius;

		for (let x = cx - r; x <= cx + r; x++)
		{
			for (let y = cy - r; y <= cy + r; y++)
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
	static meteorTiles()
	{
		const canSpawnAt = Spawner.spawnFilter();
		const hqs = Spawner.defenderHQs();
		const { x: x1, y: y1, x2, y2 } = getScrollLimits();
		const minDistance = Spawner.meteorMinDistance;

		const farEnough = (x, y) => hqs.every(hq =>
		{
			const dx = hq.x - x;
			const dy = hq.y - y;
			return Math.sqrt(dx * dx + dy * dy) >= minDistance;
		});

		// Sampling beats scanning the whole map: most maps have plenty of valid
		// spots, and a full scan runs every single round.
		for (let attempt = 0; attempt < 200; attempt++)
		{
			const x = x1 + 1 + syncRandom(Math.max(1, x2 - x1 - 2));
			const y = y1 + 1 + syncRandom(Math.max(1, y2 - y1 - 2));

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
			return terrainType(x, y) !== TER_CLIFFFACE
				&& terrainType(x, y) !== TER_WATER
				&& hqs.some(hq => propulsionCanReach("wheeled01", x, y, hq.x, hq.y));
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
