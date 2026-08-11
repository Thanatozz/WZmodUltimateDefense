/**
 * Delay the scavenger research by some amount of time
 * @param {number} seconds
 */
function setResearchDelay(seconds)
{
	researchDelayMs = seconds * 1000;
}

/**
 * Configure how much power is rewarded by destroying a scavenger
 * @param {function(number): number} f - A function that takes the cost of the scavenger and returns an amount
 */
function setPowerRewardFunction(f)
{
	powerRewardFunction = (power) => Math.ceil(f(power));
}

/**
 * How the units of a round are shared out when several Wave Defense slots are
 * in the game.
 *
 * false (default) - every wave player sends the full round, so two wave slots
 *                   means twice the units
 * true            - the round is divided between the wave players, so the same
 *                   horde arrives from several directions at once
 *
 * Either way each slot's own lobby difficulty still scales its share.
 *
 * @param {boolean} split
 */
function setWaveSplit(split)
{
	waveSplit = split;
}

/**
 * How far from the centre point units may appear, in tiles. Default 8.
 * Applies to the Base and Center spawn modes, and to where a meteor lands.
 *
 * A wide area matters as much as a fast rate: units that all appear on the same
 * few tiles are killed as they arrive, however quickly they come.
 *
 * @param {number} tiles
 */
function setSpawnRadius(tiles)
{
	Spawner.radius = tiles;
}

/**
 * How many units are released per tick. Default 5.
 *
 * The old behaviour was one at a time, which let defenders shoot a round down
 * unit by unit as it appeared instead of facing a wave.
 *
 * @param {number} count
 */
function setSpawnRate(count)
{
	Spawner.rate = count;
}

/**
 * How far a meteor has to keep away from every defender HQ, in tiles.
 *
 * @param {number} tiles
 */
function setMeteorDistance(tiles)
{
	Spawner.meteorMinDistance = tiles;
}

/**
 * How many units a meteor drops per tick. Higher lands the horde faster; too
 * high will stutter the game on the round change.
 *
 * @param {number} count
 */
function setMeteorBurst(count)
{
	Spawner.meteorBurst = count;
}

/**
 * How long a meteor's beacon shows before the horde actually lands, in seconds.
 * Set to 0 for no warning at all.
 *
 * @param {number} seconds
 */
function setMeteorWarning(seconds)
{
	Spawner.meteorWarning = seconds;
}

/**
 * Start a new round
 */
/**
 * @param {number} [tierFloor] - the lowest tier this round may field. Lets the
 *        flavour roll skip a swarm when there is no tier below to drop to.
 */
function round(tierFloor)
{
	actions.push({ type: "round", round: ++totalRounds, tierFloor: tierFloor });
}

/**
 * Set the timer and wait for it to finish
 * @param {number} seconds
 */
function wait(seconds)
{
	actions.push({ type: "wait", seconds });
}

/**
 * @param {number} count - How many units to spawn
 * @param {string[]} templatePool - e.g. [ "Machinegun Viper Wheels", "Flamer Viper Wheels" ]
 */
function spawn(count, templatePool)
{
	actions.push({ type: "spawn", count, templatePool });
}

/**
 * Spawn units until the given amount of power has been spent.
 *
 * Describes a round by what it is worth rather than by how many units it holds,
 * so changing a pool's contents does not silently change the round's strength -
 * ten Vipers and one Dragon are no longer the same instruction.
 *
 * @param {number} power
 * @param {string[]} templatePool
 */
function spawnBudget(power, templatePool)
{
	actions.push({ type: "spawnBudget", power, templatePool });
}

/**
 * How much a budgeted round may drift from its stated power, as a fraction.
 * 0.2 means each round rolls somewhere between 80% and 120%.
 *
 * @param {number} fraction
 */
function setBudgetVariance(fraction)
{
	budgetVariance = fraction;
}

/**
 * Until which round a player may be without a Command Center.
 *
 * The grace period ends when this round begins: anyone still without one is out,
 * and from then on a destroyed HQ cannot be rebuilt. It is what lets a player
 * start with nothing and build one, or move an existing one.
 *
 * 1 (default) - until the first wave. 0 - no grace at all.
 *
 * @param {number} round
 */
function setHQGraceUntilRound(round)
{
	hqGraceUntilRound = round;
}

/**
 * How close to a spawn point a defender may put walls, gates and defences, in
 * tiles. Anything built inside the zone is refunded and removed.
 *
 * Stops the waves being shot to pieces before they can walk. Note what this
 * means per spawn mode: with Base it is a bubble around the enemy start, but
 * with Surround it is a ring around the entire edge of the map.
 *
 * 0 disables the rule.
 *
 * @param {number} tiles
 */
function setNoBuildRadius(tiles)
{
	noBuildRadius = tiles;
}

/**
 * How close a defender's units have to be for a spawn tile to count as camped,
 * in tiles. The horde picks a different tile instead of walking into the guns.
 *
 * Nothing is destroyed and nobody is warned: parking an army on the spawn point
 * simply stops working. 0 disables the check.
 *
 * @param {number} tiles
 */
function setCampRadius(tiles)
{
	Spawner.campRadius = tiles;
}

/**
 * Whether an AI that reaches the end of the grace period without a Command
 * Center is given one instead of being knocked out.
 *
 * On by default. An AI builds to its own schedule and has no way to know it is
 * on a clock, so holding it to the same deadline as a warned human is unfair to
 * whoever is allied with it.
 *
 * @param {boolean} enabled
 */
function setGrantHQToAI(enabled)
{
	grantHQToAI = enabled;
}

/**
 * Whether an AI defender that loses its Command Center is cleared off the map.
 *
 * On by default. Without it the rule only really applied to humans: an AI kept
 * its whole base and army after its HQ went down, because nothing removed it.
 *
 * @param {boolean} enabled
 */
function setEliminateOnHQLoss(enabled)
{
	eliminateOnHQLoss = enabled;
}

/**
 * How far a dying Command Center clears the ground of units, in tiles.
 *
 * It takes everyone's units, not just the owner's, so the wave that broke
 * through dies in the blast too. Without it a horde rolls out of one ruined base
 * into the next at full strength and a team falls like dominoes.
 *
 * 0 disables the blast.
 *
 * @param {number} tiles
 */
function setHQBlastRadius(tiles)
{
	hqBlastRadius = tiles;
}

/**
 * Milliseconds between the rings of that blast.
 *
 * It travels outwards a tile at a time rather than going off at once, so this
 * is how fast the shockwave moves. At radius 6 and 150ms a step it takes just
 * under a second to reach the edge.
 *
 * @param {number} ms
 */
function setHQBlastStep(ms)
{
	hqBlastStepMs = ms;
}

/**
 * A weapon fired along each ring of the blast, for the look of it.
 *
 * Off by default. Without one the shockwave is only visible where it catches
 * units, since what you see is those units blowing up - a ring crossing empty
 * ground shows nothing at all.
 *
 * Be aware this is a real weapon doing real damage to whatever is still
 * standing nearby, a neighbour's buildings included. The units in the blast are
 * already removed outright, so it adds nothing but spectacle and side effects.
 *
 * @param {string|null} weapon
 */
function setHQBlastWeapon(weapon)
{
	hqBlastWeapon = weapon;
}

/**
 * Whether a dead boss leaves a crate holding one of its own components, which
 * becomes buildable for whoever picks it up. One crate per round.
 *
 * @param {boolean} enabled
 */
function setBossCrates(enabled)
{
	bossCrates = enabled;
}

/**
 * How many spawn tiles to try before giving up and coming in anyway.
 *
 * Raise it if defenders can cover enough of a spawn area to make camping work
 * again; every try costs a lookup of what is standing nearby.
 *
 * @param {number} tries
 */
function setCampTries(tries)
{
	Spawner.campTries = tries;
}

/**
 * How much the difficulty picked for a Wave Defense slot in the lobby changes
 * the size of every round. Defaults mirror the base game's AI power modifiers.
 *
 * Applies to both spawn() and spawnBudget(), and each wave slot uses its own
 * setting - an Easy bot and an Insane one in the same game each send their own
 * amount rather than agreeing on one.
 *
 * @param {number} easy
 * @param {number} medium
 * @param {number} hard
 * @param {number} insane
 */
function setDifficultyScale(easy, medium, hard, insane)
{
	difficultyScale = { easy, medium, hard, insane };
}

/**
 * Split a round's budget across the cheap, middling and dear thirds of what it
 * may field, instead of letting the whole budget chase the cheapest thing.
 *
 * Without this a budget always buys the bottom of the pool: round one came out
 * as 158 identical scavengers. With 50/35/15 it comes out as a mass of the
 * cheapest, a body of mid-range units and a few heavies - and the same shape
 * holds at every tier, because the thirds are taken from whatever that round is
 * allowed to field.
 */
function spawnComposed(options, power, floor, top, cap)
{
	const mix = options.composition;

	if (!mix)
	{
		spawnWave({ power: power, tierMin: floor, tierMax: top, maxUnits: cap });
		return;
	}

	const bands = [
		["light", mix.light],
		["medium", mix.medium],
		["heavy", mix.heavy],
	];

	for (const [band, share] of bands)
	{
		if (share > 0)
		{
			spawnWave({
				power: Math.round(power * share),
				tierMin: floor,
				tierMax: top,
				band: band,
				maxUnits: cap ? Math.round(cap * share) : 0,
			});
		}
	}
}

/**
 * How many bosses a round fields.
 *
 * A number applies to every round; a function lets the count fall as the game
 * goes on. Early bosses have to arrive as a squad to matter at all - one Viper
 * dies to a guard tower and decides nothing - while three Dragons at round 30
 * are quite enough.
 *
 * @returns {number}
 */
function bossCountForRound(boss, round)
{
	if (typeof boss.count === "function")
	{
		return Math.max(1, Math.round(boss.count(round)));
	}
	return boss.count !== undefined ? boss.count : 3;
}

/**
 * @param {object[]} chassis - [{ untilRound, bodies: [...] }, ...]
 * @returns {string[]|null} the bodies a boss may use in this round
 */
function chassisForRound(chassis, round)
{
	if (!chassis)
	{
		return null;
	}

	for (const step of chassis)
	{
		if (round <= step.untilRound)
		{
			return step.bodies;
		}
	}

	return chassis[chassis.length - 1].bodies;
}

/**
 * Spend a power budget on designs picked out of the catalogue.
 *
 * Unlike spawnBudget(), the pool is not a hand-written list: it is described by
 * what the units should be, and resolved against catalogue.js at run time.
 *
 * @param {object} spec
 * @param {number} spec.power
 * @param {number} spec.tierMin - lowest catalogue tier allowed, 0-5
 * @param {number} spec.tierMax - highest catalogue tier allowed
 * @param {string[]} [spec.families] - mg, cannon, rocket, missile, flame, energy,
 *        gauss, mortar, howitzer. All of them when omitted.
 * @param {string[]} [spec.classes] - scavenger, cyborg, cyborg_super, tank_light,
 *        tank_medium, tank_heavy. All of them when omitted.
 * @param {string} [spec.mono] - "family" or "design": spend the lot on one kind
 * @param {boolean} [spec.boss] - buy the dearest designs available, at full rank
 */
function spawnWave(spec)
{
	const action = {
		type: "spawnWave",
		power: spec.power,
		tierMin: spec.tierMin,
		tierMax: spec.tierMax,
		families: spec.families || null,
		classes: spec.classes || null,
		maxUnits: spec.maxUnits || 0,
		band: spec.band || null,
		// A boss round is one wave: these buy the bosses first, then the rest of
		// the budget goes on the escort from the same pool.
		bossBodies: spec.bossBodies || null,
		bossCount: spec.bossCount || 0,
	};
	actions.push(action);
}

/**
 * Build a whole game's worth of rounds instead of writing them out by hand.
 *
 * Deliberately deterministic: it lays out rounds, timings, budgets and the tier
 * window each round may draw from. Which designs actually turn up is rolled at
 * run time by spawnWave(), where syncRandom() is safe to call. That keeps two
 * games different without risking a multiplayer desync at script load.
 *
 * The tier window is what makes the game escalate. Its floor rises with the
 * round, so a late round physically cannot spend its budget on machinegun
 * Vipers however cheap they are.
 *
 * @param {object} options
 * @param {number} options.rounds
 * @param {function(number): number} [options.budget] - round -> power to spend
 * @param {function(number): number} [options.waitTime] - round -> seconds before it
 * @param {function(number): number} [options.tier] - round -> top tier, 0-5
 * @param {number} [options.tierSpread] - how many tiers below the top stay in play
 * @param {object} [options.special] - { every, mode } one-flavour rounds
 * @param {object} [options.boss] - { every, share, tierBonus } boss rounds
 */
function generateWaves(options)
{
	const budget = options.budget || (round => Math.round(350 * Math.pow(1.24, round - 1)));
	const waitTime = options.waitTime || (() => 150);
	const tierSpread = options.tierSpread !== undefined ? options.tierSpread : 1;
	const special = options.special || {};
	const swarm = options.swarm || {};
	const boss = options.boss || {};

	// Flavour is rolled per round at run time, in processRound, so two games do
	// not agree on which rounds are the flamer ones.
	monoChance = special.chance || 0;
	swarmChance = swarm.chance || 0;
	swarmTierShift = swarm.tierShift !== undefined ? swarm.tierShift : 1;

	for (let r = 1; r <= options.rounds; r++)
	{
		const top = options.tier
			? options.tier(r)
			: Math.min(TOP_TIER, Math.floor((r - 1) * (TOP_TIER + 1) / options.rounds));
		const floor = Math.max(0, top - tierSpread);

		wait(Math.round(waitTime(r)));
		round(floor);

		const isBoss = boss.every > 0 && r % boss.every === 0;
		const isSpecial = !isBoss && special.every > 0 && r % special.every === 0;

		const cap = options.maxUnits ? options.maxUnits(r) : 0;

		if (isBoss)
		{
			// One wave, not two. The bosses come out of the round's own budget
			// and whatever they leave goes straight into the escort, so a round
			// that only wants three Dragons still spends the other 170,000.
			spawnWave({
				power: budget(r),
				tierMin: floor,
				tierMax: top,
				maxUnits: cap,
				bossBodies: chassisForRound(boss.chassis, r),
				bossCount: bossCountForRound(boss, r),
			});
		}
		else
		{
			spawnComposed(options, budget(r), floor, top, cap);
		}
	}
}
