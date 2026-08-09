function next()
{
	if (index < actions.length)
	{
		const action = actions[index++];
		if (action.type == "round")
		{
			processRound(action);
		}
		else if (action.type == "wait")
		{
			processWait(action);
		}
		else if (action.type == "spawn")
		{
			processSpawn(action);
		}
		else if (action.type == "spawnBudget")
		{
			processSpawnBudget(action);
		}
		else if (action.type == "spawnWave")
		{
			processSpawnWave(action);
		}
	}
}

function processRound(action)
{
	console(" ");
	console(_("Round") + " " + action.round + "/" + totalRounds);
	console(" ");
	Spawner.rank = ranks[action.round];
	Spawner.newRound(); // re-roll the random and meteor spawn points
	checkHQGrace(action.round); // no more free rebuilds once the waves start
	rollRoundFlavour(action.tierFloor);
	playSound("pcv373.ogg"); // "Scavengers detected"
	queue("next");
}

function processWait(action)
{
	if (action.seconds > 10) {
		setMissionTime(action.seconds);
	}
	queue("next", action.seconds * 1000);
}

function processSpawn(action)
{
	const templates = resolvePool(action.templatePool);

	// An unresolvable pool spawns nothing, but must still hand over to the next
	// action or the whole config stalls here.
	if (templates.length > 0)
	{
		queueBatches(player =>
		{
			const count = Math.round(action.count * shareFor(player));
			const batch = [];
			for (let i = 0; i < count; i++)
			{
				batch.push({ template: templates[syncRandom(templates.length)] });
			}
			return batch;
		});
	}

	queue("next");
}

/**
 * Spend a power budget on units instead of counting them out.
 *
 * The pick is random and weighted by nothing but affordability, so the same
 * round plays differently every game while costing the same.
 */
function processSpawnBudget(action)
{
	const templates = resolvePool(action.templatePool);
	if (templates.length === 0)
	{
		queue("next");
		return;
	}

	const costs = templates.map(t => Template.cost(t));

	queueBatches(player =>
	{
		let budget = varyBudget(action.power * shareFor(player));
		const batch = [];

		while (true)
		{
			const affordable = [];
			for (let i = 0; i < templates.length; i++)
			{
				if (costs[i] <= budget)
				{
					affordable.push(i);
				}
			}
			if (affordable.length === 0)
			{
				break;
			}

			const pick = affordable[syncRandom(affordable.length)];
			batch.push({ template: templates[pick] });
			// Never subtract zero: a component with no cost listed would loop forever.
			budget -= Math.max(1, costs[pick]);
		}

		return batch;
	});

	queue("next");
}

/**
 * Decide what kind of round this is, once, before any of its waves resolve.
 *
 * Chance rather than a fixed interval, so a game is not "round 4, 8, 12 are the
 * flamer ones" every time. Boss rounds are not rolled: they stay on their own
 * schedule so the game has a rhythm you can learn.
 */
function rollRoundFlavour()
{
	roundFlavour = "normal";
	roundFamily = null;

	// Roll swarm first: a swarm of one weapon family would be two surprises at
	// once, and the round would read as neither.
	if (canSwarm && swarmChance > 0 && syncRandom(100) < swarmChance * 100)
	{
		roundFlavour = "swarm";
		console(_("Incoming: a swarm"));
		return;
	}

	if (monoChance > 0 && syncRandom(100) < monoChance * 100)
	{
		roundFlavour = "mono";
	}
}

/**
 * Spend a budget on designs described by tier, class and weapon family instead
 * of by a hand-written list. The pool comes from catalogue.js.
 */
function processSpawnWave(action)
{
	// A swarm is the previous generation of hardware in far greater numbers. It
	// needs no extra budget: a tier down costs roughly half, so the same power
	// buys about twice as many by itself.
	if (roundFlavour === "swarm" && !action.bossBodies)
	{
		action = Object.assign({}, action, {
			tierMin: Math.max(0, action.tierMin - swarmTierShift),
			tierMax: Math.max(0, action.tierMax - swarmTierShift),
		});
	}

	let pool = catalogueFor(action);
	if (pool.length === 0)
	{
		queue("next");
		return;
	}

	pool = sizeBand(pool, action.band);

	// Cap first, narrow second. The other way round, a one-family round that
	// landed on a cheap family (flamers, machineguns) blew straight past the cap,
	// because by then there was nothing dear enough left to raise the floor to.
	pool = applyUnitCap(pool, action.power, action.maxUnits);

	if (roundFlavour === "mono" && !action.bossBodies)
	{
		pool = narrowToRoundFamily(pool);
	}

	const bossPool = action.bossBodies ? bossesFor(action) : [];

	queueBatches(player =>
	{
		let budget = varyBudget(action.power * shareFor(player));
		const batch = [];

		budget = buyBosses(batch, bossPool, budget, action.bossCount);
		buyUnits(batch, pool, budget);

		return batch;
	});

	queue("next");
}

/**
 * Buy the round's bosses and return what is left of the budget.
 *
 * Picks the best design it can afford `count` of, rather than the dearest one
 * outright. Taking the dearest turned round five into a single Viper that died
 * to a guard tower and decided nothing: a boss has to be a squad early on,
 * when one unit of anything is not a threat.
 *
 * @param {object[]} batch - appended to
 * @param {object[]} bossPool
 * @param {number} budget
 * @param {number} count - how many bosses this round wants
 * @returns {number} budget left for the escort
 */
function buyBosses(batch, bossPool, budget, count)
{
	if (bossPool.length === 0 || count <= 0)
	{
		return budget;
	}

	const target = budget / count;

	let pick = null;
	for (const entry of bossPool)
	{
		if (entry.c <= target && (pick === null || entry.c > pick.c))
		{
			pick = entry;
		}
	}

	// Nothing cheap enough to field a full squad, so take the cheapest there is
	// and buy as many as the budget stretches to.
	if (pick === null)
	{
		for (const entry of bossPool)
		{
			if (pick === null || entry.c < pick.c)
			{
				pick = entry;
			}
		}
	}

	const template = catalogueTemplate(pick);
	if (!template)
	{
		return budget;
	}

	for (let i = 0; i < count && budget >= pick.c; i++)
	{
		batch.push({ template, rank: maxRank() });
		budget -= Math.max(1, pick.c);
	}

	return budget;
}

/**
 * Spend what is left on the round's ordinary units.
 *
 * @param {object[]} batch - appended to
 * @param {object[]} pool
 * @param {number} budget
 */
function buyUnits(batch, pool, budget)
{
	let available = pool;

	while (true)
	{
		const affordable = available.filter(entry => entry.c <= budget);
		if (affordable.length === 0)
		{
			return;
		}

		const pick = affordable[syncRandom(affordable.length)];
		const template = catalogueTemplate(pick);

		if (!template)
		{
			// Unresolvable design: drop it rather than looping on it forever
			available = available.filter(entry => entry !== pick);
			continue;
		}

		batch.push({ template });
		budget -= Math.max(1, pick.c);
	}
}

/**
 * @returns {object[]} the designs eligible to be this round's boss
 */
function bossesFor(action)
{
	return CATALOGUE.filter(entry => action.bossBodies.includes(entry.b));
}

/**
 * @returns {object[]} catalogue entries matching the action's constraints
 */
function catalogueFor(action)
{
	return CATALOGUE.filter(entry =>
	{
		if (entry.t < action.tierMin || entry.t > action.tierMax)
		{
			return false;
		}
		if (action.families && !action.families.includes(entry.f))
		{
			return false;
		}
		if (action.classes && !action.classes.includes(entry.k))
		{
			return false;
		}
		if (action.bodies && !action.bodies.includes(entry.b))
		{
			return false;
		}
		return true;
	});
}

/**
 * Cut a pool down to one weight class.
 *
 * Uses the catalogue's own size, so "light" means a Viper or a trike rather than
 * whatever happened to be cheapest. Scavenger bodies are classified by hand in
 * the generator, since the game calls all of them light.
 *
 * @param {object[]} pool
 * @param {string} band - "light", "medium" or "heavy"
 */
function sizeBand(pool, band)
{
	if (!band)
	{
		return pool;
	}

	const matching = pool.filter(entry => entry.s === band);
	if (matching.length > 0)
	{
		return matching;
	}

	// Not every tier holds all three weights - there is no light Dragon. Fall
	// back to the matching third by price, so the share still gets spent and the
	// round still reads light to heavy relative to itself.
	return costThird(pool, band);
}

function costThird(pool, band)
{
	if (pool.length < 3)
	{
		return pool;
	}

	const sorted = pool.slice().sort((a, b) => a.c - b.c);
	const third = Math.floor(sorted.length / 3);

	if (band === "light")
	{
		return sorted.slice(0, third);
	}
	if (band === "heavy")
	{
		return sorted.slice(sorted.length - third);
	}
	return sorted.slice(third, sorted.length - third);
}

/**
 * Keep a round from turning into a swarm of the cheapest thing in the pool.
 *
 * Without this, a budget always buys whatever costs least: the first rounds came
 * out as 150+ identical scavengers, which is a framerate problem long before it
 * is a difficulty one. Rather than capping the count and throwing the leftover
 * budget away, raise the floor on what may be bought, so the same power arrives
 * as fewer, better units.
 *
 * @param {object[]} pool
 * @param {number} power - the round's budget
 * @param {number} maxUnits - roughly how many units it should come to
 */
function applyUnitCap(pool, power, maxUnits)
{
	if (!maxUnits || maxUnits <= 0)
	{
		return pool;
	}

	const minCost = power / maxUnits;
	const dear = pool.filter(entry => entry.c >= minCost);
	if (dear.length > 0)
	{
		return dear;
	}

	// The budget outgrew everything in the catalogue. Keep the heaviest end of
	// what there is, so late rounds field Dragons rather than a sea of Vipers.
	let dearest = 0;
	for (const entry of pool)
	{
		dearest = Math.max(dearest, entry.c);
	}
	return pool.filter(entry => entry.c >= dearest * 0.6);
}

/**
 * Cut a pool down to the one weapon family this round settled on.
 *
 * The family is picked on the first wave of the round and remembered, so the
 * light, medium and heavy shares of a mono round all bring the same weapon
 * instead of three different ones.
 *
 * @param {object[]} pool
 */
function narrowToRoundFamily(pool)
{
	if (roundFamily === null)
	{
		const families = [];
		for (const entry of pool)
		{
			if (!families.includes(entry.f))
			{
				families.push(entry.f);
			}
		}

		if (families.length === 0)
		{
			return pool;
		}

		roundFamily = families[syncRandom(families.length)];
		console("Incoming: an all-" + roundFamily + " wave");
	}

	const matching = pool.filter(entry => entry.f === roundFamily);
	return matching.length > 0 ? matching : pool;
}

/**
 * Catalogue designs are parsed once and kept: fromString() brute-forces every
 * way of splitting the name, which is not something to repeat per unit.
 */
function catalogueTemplate(entry)
{
	if (templateCache[entry.d] === undefined)
	{
		templateCache[entry.d] = Template.fromString(entry.d) || null;
	}
	return templateCache[entry.d];
}

function maxRank()
{
	return Stats.Brain["Z NULL BRAIN"].RankThresholds.length - 1;
}

/**
 * Convert the strings in a pool to templates, dropping any the game does not
 * recognise.
 *
 * @param {string[]} pool
 * @returns {object[]}
 */
function resolvePool(pool)
{
	return pool.map(t => Template.fromString(t)).filter(t => !!t);
}

/**
 * Nudge a round's budget up or down so two games never spend exactly the same.
 * Applied here rather than in generateWaves() so the roll happens at run time,
 * where syncRandom is safe to use.
 */
function varyBudget(power)
{
	if (budgetVariance <= 0)
	{
		return Math.round(power);
	}

	const spread = power * budgetVariance;
	// syncRandom is integer-only, so roll over a 0..2000 range and rescale
	const roll = syncRandom(2001) / 1000 - 1; // -1.0 .. +1.0
	return Math.max(1, Math.round(power + spread * roll));
}

/**
 * One wave player's share of a round.
 *
 * Its own lobby difficulty, divided between the wave players when waveSplit is
 * on. So two Medium bots split down the middle, while a Medium and an Insane
 * one send 0.5x and 1.0x of the round respectively.
 *
 * @param {number} player
 * @returns {number} fraction of the round this player sends
 */
function shareFor(player)
{
	const split = waveSplit ? Math.max(1, Spawner.players.length) : 1;
	return playerScale(player) / split;
}

/**
 * Build one batch per wave player and interleave them into the spawn queue.
 *
 * Interleaved, not appended: the spawner drains the queue from the front, so
 * appending would send one bot's whole army before the next bot sent anything.
 *
 * @param {function(number): object[]} buildBatch - player -> that player's units
 */
function queueBatches(buildBatch)
{
	const batches = Spawner.players.map(player => ({ player, units: buildBatch(player) }));

	let longest = 0;
	for (const batch of batches)
	{
		longest = Math.max(longest, batch.units.length);
	}

	for (let i = 0; i < longest; i++)
	{
		for (const batch of batches)
		{
			if (i < batch.units.length)
			{
				const unit = batch.units[i];
				Spawner.queue.push({ template: unit.template, player: batch.player, rank: unit.rank });
			}
		}
	}
}
