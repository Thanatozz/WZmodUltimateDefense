// These variables are automatically recreated upon save-load
// No save-load persistence required
let actions = [];
let totalRounds = 0;
let researchDelayMs = 0;
let powerRewardFunction = defaultPowerRewardFunction();
let waveSplit = false;
let budgetVariance = 0;
let templateCache = {}; // catalogue design string -> parsed template
let hqGraceUntilRound = 1; // 0 disables the grace period entirely
let grantHQToAI = true;    // AIs cannot read the warning, so they get one anyway
let noBuildRadius = 5;     // tiles around a spawn point where defences are refused
// Odds that a round turns out to be one flavour or the other, set by generateWaves
let monoChance = 0;
let swarmChance = 0;
let swarmTierShift = 1;
let eliminateOnHQLoss = true; // an AI that loses its HQ is cleared off the map
let hqBlastRadius = 6;     // tiles a dying HQ clears of units, everyone's, 0 to disable
let hqBlastStepMs = 150;   // pause between rings of the shockwave
let hqBlastWeapon = null;  // weapon fired along each ring for show, null for none
let bossCrates = true;     // a dead boss leaves one of its components as salvage
// Same shape as the base game's AI power modifiers in rules/setup/powermodifier.js
let difficultyScale = { easy: 0.7, medium: 1.0, hard: 1.5, insane: 2.0 };

// These variables are NOT automatically recreated upon save-load
// Use `var` to persist through save-loads
var ranks;
var index = 0;
var hqGraceOver = false;
// Rolled once per round in processRound, so every part of a round agrees on
// what kind of round it is. Rolling per action would give the light, medium and
// heavy shares of one round three different answers.
var roundFlavour = "normal"; // "normal", "mono" or "swarm"
var roundFamily = null;      // which weapon family a mono round settled on
var nextDueAt = null;        // gameTime the reader is next expected to run, for the watchdog
var crateContents = {};      // feature id -> the component that crate holds
var crateDroppedThisRound = false;
var blastRings = [];         // shockwave rings still to go off, from dying HQs
var wavePlayers = getWavePlayers();
// The one used where a single player is needed: the rules script only commands
// units directly in the hack mode, which never has more than one wave player.
var wavePlayer = wavePlayers[0];
// getWavePlayers() only falls back to scavengerPlayer when it ran out of
// options, so this still identifies the no-enemy-slot case.
var IS_HACK = scavengers == 0 && wavePlayers.length == 1
	&& wavePlayer == scavengerPlayer; // HACK WARNING TODO


namespace("td_");

function td_eventStartLevel()
{
	// Do this after totalRounds is determined
	ranks = calculateRanks(totalRounds);

	for (const player of wavePlayers)
	{
		clearWavePlayer(player);
		Spawner.modes[player] = waveSpawnMode(player);
	}
	allyHorde(hordePlayers());
	unallyDefenders(hordePlayers(), waveDefenders());
	unifyHordeColour(wavePlayers);
	disableVTOL();
	Spawner.players = wavePlayers;

	// A grace period of 0 means the old rule: no HQ, no game, from the first tick
	if (hqGraceUntilRound <= 0)
	{
		hqGraceOver = true;
	}

	printWaveSetup();
	hqGraceReminder();

	// Start the config reader
	next();

	setTimer("updateResearch", 10 * 1000);
	setTimer("watchdog", 5 * 1000);

	if (IS_HACK) // HACK WARNING TODO
	{
		setTimer("updateOrders", 1000);
	}
}

function td_eventDestroyed(object)
{
	if (object.type === FEATURE)
	{
		return;
	}

	// Reward the defenders with power upon destroying a wave unit.
	// Only defenders: an AI allied with the horde is not helping.
	if (wavePlayers.includes(object.player))
	{
		for (const player of waveDefenders())
		{
			addPower(player, powerRewardFunction(object.cost));
		}

		dropBossCrate(object);
	}
}


////////////////////////////////////////////////////////////////////////////////
//                                                                            //
// Boss salvage                                                               //
//                                                                            //
// A dead boss leaves a crate holding one of its own parts. Pick it up with    //
// any unit and that component becomes buildable - the reward for killing the  //
// thing is the thing itself.                                                  //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

/**
 * @param {object} object - the wave unit that was destroyed
 */
function dropBossCrate(object)
{
	const component = Spawner.bossDrops[object.id];
	if (!bossCrates || component === undefined)
	{
		return;
	}

	delete Spawner.bossDrops[object.id];

	// One crate a round. An early boss round fields ten of them, and ten crates
	// is not a reward, it is litter - and addFeature refuses a tile that already
	// holds one, which is where they would all land.
	if (crateDroppedThisRound)
	{
		return;
	}
	crateDroppedThisRound = true;

	hackNetOff();
	const crate = addFeature("Crate", object.x, object.y);
	hackNetOn();

	if (crate)
	{
		crateContents[crate.id] = component;
		console(_("The boss dropped salvage"));
	}
}

namespace("salvage_");

function salvage_eventPickup(feature, droid)
{
	const component = crateContents[feature.id];
	if (component === undefined)
	{
		return;
	}

	delete crateContents[feature.id];

	makeComponentAvailable(component, droid.player);

	if (droid.player === selectedPlayer)
	{
		console(_("Salvaged: ") + component);
	}
}

/**
 * Say out loud who is attacking and who is defending.
 *
 * A wrong answer here is invisible during play but decides who can win, so it is
 * worth a few lines in the console at the start of every game.
 */
function printWaveSetup()
{
	const describe = player =>
	{
		if (player >= maxPlayers)
		{
			return "scavengers";
		}
		return playerData[player].name + " (" + player + ")";
	};

	const describeAttacker = player =>
	{
		return describe(player) + " " + Spawner.modes[player] + " x" + playerScale(player);
	};

	console("Wave Defense: attackers = " + wavePlayers.map(describeAttacker).join(", "));
	console("Wave Defense: defenders = " + waveDefenders().map(describe).join(", "));

	if (waveDefenders().length === 0)
	{
		console("Wave Defense: WARNING - nobody is defending, the game cannot be won");
	}
}

function updateResearch()
{
	const timeMs = currentResearchTime() - researchDelayMs;
	for (const player of wavePlayers)
	{
		giveResearch(player, timeMs);
	}
}

function defaultPowerRewardFunction()
{
	if (powerType === 0) // Low
	{
		return power => Math.ceil((9*power)**0.51);
	}
	else if (powerType === 1) // Medium
	{
		return power => Math.ceil((9*power)**0.56);
	}
	else // High
	{
		return power => Math.ceil((9*power)**0.60);
	}
}


////////////////////////////////////////////////////////////////////////////////
//                                                                            //
// Command Center rules                                                       //
//                                                                            //
// Losing the HQ loses the game, and it cannot be rebuilt - but only once the  //
// waves have started. Until then there is a grace period, so a player who     //
// starts without an HQ can put one up, and a player who wants theirs          //
// somewhere else can demolish it and move it.                                 //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

/**
 * Ends the grace period once the given round begins.
 *
 * Called from processRound(). Idempotent, so a save-load mid-game cannot hand
 * anyone a second chance to build.
 *
 * @param {number} round - the round that is starting
 */
function checkHQGrace(round)
{
	if (hqGraceOver || round < hqGraceUntilRound)
	{
		return;
	}


	hqGraceOver = true;

	for (const player of waveDefenders())
	{
		if (enumStruct(player, HQ).length > 0)
		{
			continue;
		}

		// A human was told to build one and chose not to. An AI was never told.
		if (grantHQToAI && playerData[player].isAI && grantHQ(player))
		{
			console(playerData[player].name + " was given a Command Center");
			continue;
		}

		console(playerData[player].name + " has no Command Center and is out");
	}
}

function hqGraceReminder()
{
	if (hqGraceUntilRound <= 0 || isSpectator(-1))
	{
		return;
	}

	if (enumStruct(selectedPlayer, HQ).length === 0)
	{
		console(_("Build a Command Center before the first wave, or you are out"));
	}
}


////////////////////////////////////////////////////////////////////////////////
//                                                                            //
// No building on top of the spawn points                                     //
//                                                                            //
// Ringing a spawn point with defences turns the game into a shooting gallery: //
// the waves die the instant they appear, without ever getting to walk. A      //
// defence put up inside the zone is refused and refunded rather than          //
// destroyed, so it reads as "you cannot build here", not as an attack.        //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

namespace("nospawncamp_");

function nospawncamp_eventStructureBuilt(structure, droid)
{
	if (noBuildRadius <= 0 || !blocksSpawn(structure))
	{
		return;
	}

	// The horde may build wherever it likes; this is a rule for the defenders
	if (!waveDefenders().includes(structure.player))
	{
		return;
	}

	if (!inSpawnZone(structure.x, structure.y))
	{
		return;
	}

	addPower(structure.player, structure.cost);
	removeObject(structure); // no effects: a refusal, not an explosion

	if (structure.player === selectedPlayer)
	{
		console(_("Too close to a wave spawn point - refunded"));
	}
}

/**
 * Only the things people actually camp with. A factory near a spawn point is
 * someone's base being awkwardly placed; a row of towers is not.
 */
function blocksSpawn(structure)
{
	return structure.stattype === DEFENSE
		|| structure.stattype === WALL
		|| structure.stattype === GATE;
}

function inSpawnZone(x, y)
{
	const limit = noBuildRadius * noBuildRadius;

	for (const player of Spawner.players)
	{
		const locations = Spawner.locations[player];
		if (!locations)
		{
			continue;
		}

		for (const [spawnX, spawnY] of locations)
		{
			const dx = spawnX - x;
			const dy = spawnY - y;
			if (dx * dx + dy * dy <= limit)
			{
				return true;
			}
		}
	}

	return false;
}


namespace("disableRebuildHQ_");

// Do not allow the player to rebuild their HQ after it is destroyed.
// (For save-load safety, the structure limit can't be 0 while the player has HQ)

function disableRebuildHQ_eventDestroyed(object)
{
	if (object.type === STRUCTURE && object.stattype === HQ && hqGraceOver)
	{
		setStructureLimits("A0CommandCentre", 0, object.player);
		hqBlast(object.x, object.y);
		eliminateIfHQLost(object.player);
	}
}

/**
 * A dying Command Center takes everything around it with it.
 *
 * Everything, not just the owner's: the wave that just broke through dies in the
 * blast as well. Without that, a horde rolls out of one ruined base straight
 * into the next one with its numbers intact, and a team falls like dominoes off
 * a single lost HQ.
 *
 * It goes off as a shockwave rather than all at once - one tile, then two, out
 * to the full radius - so it reads as something travelling outwards instead of
 * a ring of units vanishing together.
 *
 * @param {number} x - tile coordinate
 * @param {number} y - tile coordinate
 */
function hqBlast(x, y)
{
	if (hqBlastRadius <= 0)
	{
		return;
	}

	const idle = blastRings.length === 0;

	for (let radius = 1; radius <= hqBlastRadius; radius++)
	{
		blastRings.push({ x: x, y: y, radius: radius });
	}

	// Two HQs can fall at once; only one chain of steps should be running.
	if (idle)
	{
		hqBlastStep();
	}
}

/**
 * Set off the next ring of a shockwave.
 *
 * Each ring simply clears everything inside its radius: whatever was closer in
 * went up with an earlier ring and is already gone, so there is no need to work
 * out which band a unit falls in.
 */
function hqBlastStep()
{
	const ring = blastRings.shift();
	if (ring === undefined)
	{
		return;
	}

	// The units blow up with their own destruction effects, which is most of the
	// look. A ring that catches nothing shows nothing, so an optional weapon can
	// be fired along it to make the wave visible over empty ground.
	fireBlastRing(ring);

	hackNetOff();
	// seen = false, or clients would disagree about who was in range
	for (const object of enumRange(ring.x, ring.y, ring.radius, ALL_PLAYERS, false))
	{
		if (object.type === DROID)
		{
			removeObject(object, true); // with effects: this one is an explosion
		}
	}
	hackNetOn();

	if (blastRings.length > 0)
	{
		queue("hqBlastStep", hqBlastStepMs);
	}
}

/**
 * Fire the blast weapon at four points around a ring, for the look of it.
 *
 * Off unless a weapon is set, because a real weapon does real damage: anything
 * still standing near the dead HQ, including a neighbour's buildings, takes it.
 * The units are already removed outright, so this is purely what it looks like.
 *
 * @param {object} ring
 */
function fireBlastRing(ring)
{
	if (hqBlastWeapon === null)
	{
		return;
	}

	const points = [
		[ring.x + ring.radius, ring.y],
		[ring.x - ring.radius, ring.y],
		[ring.x, ring.y + ring.radius],
		[ring.x, ring.y - ring.radius],
	];

	for (const [x, y] of points)
	{
		fireWeaponAtLoc(hqBlastWeapon, x, y);
	}
}

/**
 * Losing the Command Center is meant to put a player out. For a human that is
 * visible: they get the defeat message and become a spectator when the game
 * resolves. An AI just carried on with its whole base, because nothing was
 * removing it - so the rule only really applied to people.
 *
 * @param {number} player
 */
function eliminateIfHQLost(player)
{
	if (!eliminateOnHQLoss || enumStruct(player, HQ).length > 0)
	{
		return;
	}

	if (!waveDefenders().includes(player))
	{
		return;
	}

	console(playerData[player].name + " has lost their Command Center");

	// Humans are left alone: endconditions.js already turns them into a
	// spectator, and pulling an army out from under someone mid-game reads as a
	// crash rather than a rule.
	if (playerData[player].isHuman)
	{
		return;
	}

	hackNetOff();
	enumStruct(player).forEach(structure => removeObject(structure, true));
	enumDroid(player).forEach(droid => removeObject(droid, true));
	hackNetOn();
}

function disableRebuildHQ_eventStructureDemolish(structure, droid) {
	if (structure.stattype === HQ && hqGraceOver)
	{
		setStructureLimits("A0CommandCentre", 0, structure.player);
	}
}
