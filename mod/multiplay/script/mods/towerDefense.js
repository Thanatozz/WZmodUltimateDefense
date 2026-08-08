// These variables are automatically recreated upon save-load
// No save-load persistence required
let actions = [];
let totalRounds = 0;
let researchDelayMs = 0;
let powerRewardFunction = defaultPowerRewardFunction();

// These variables are NOT automatically recreated upon save-load
// Use `var` to persist through save-loads
var ranks;
var index = 0;
var wavePlayer = getWavePlayer();
// getWavePlayer() only ever returns scavengerPlayer when it ran out of options,
// so this still identifies the no-enemy-slot case.
var IS_HACK = scavengers == 0 && wavePlayer == scavengerPlayer; // HACK WARNING TODO


namespace("td_");

function td_eventStartLevel()
{
	// Do this after totalRounds is determined
	ranks = calculateRanks(totalRounds);

	clearWavePlayer(wavePlayer);
	disableVTOL();
	Spawner.player = wavePlayer;

	// Start the config reader
	next();

	setTimer("updateResearch", 10 * 1000);

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

	// Reward players with power upon destroying a scavenger
	if (object.player == wavePlayer)
	{
		for (let player = 0; player < maxPlayers; player++)
		{
			if (player !== wavePlayer)
			{
				addPower(player, powerRewardFunction(object.cost));
			}
		}
	}
}

function updateResearch()
{
	const timeMs = currentResearchTime() - researchDelayMs;
	giveResearch(wavePlayer, timeMs);
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


// Do not allow the player to rebuild their HQ after it is destroyed.
// (For save-load safety, the structure limit can't be 0 while the player has HQ)

namespace("disableRebuildHQ_");

function disableRebuildHQ_eventDestroyed(object)
{
	if (object.type === STRUCTURE && object.stattype === HQ) // NOTE Do we need to check if enumStruct(object.player, HQ).length == 0?
	{
		setStructureLimits("A0CommandCentre", 0, object.player);
	}
}

function disableRebuildHQ_eventStructureDemolish(structure, droid) {
	if (structure.stattype === HQ)
	{
		setStructureLimits("A0CommandCentre", 0, structure.player);
	}
}
