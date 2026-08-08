//
// Shared targeting logic for the wave attacker.
//
// This file is included from two different script contexts:
//   - multiplay/skirmish/WaveDefense.js, running as the AI of its own player
//   - multiplay/script/mods/Scavengers.js, running inside the rules script
//
// The including script must define:
//   waveMe()      - the player number of the wave attacker
//   waveRandom(n) - a random integer in [0, n)
//

// Use `var` so the target list survives save-loads in the rules script context.
var waveTargets = [];

function waveUpdateOrders()
{
	if (!waveTargetsAreValid())
	{
		waveGetNewTargets();
	}

	if (waveTargets.length === 0)
	{
		return;
	}

	for (const droid of enumDroid(waveMe()))
	{
		if (droid.order !== DORDER_ATTACK)
		{
			const target = waveTargets[waveRandom(waveTargets.length)];
			orderDroidObj(droid, DORDER_ATTACK, target);
		}
	}
}

/**
 * A destroyed target leaves a stale object behind, which would make every droid
 * attack nothing. Recheck the tiles instead of trusting the cached list.
 *
 * @returns {boolean}
 */
function waveTargetsAreValid()
{
	if (waveTargets.length === 0)
	{
		return false;
	}

	for (const target of waveTargets)
	{
		if (!getObject(target.x, target.y))
		{
			return false;
		}
	}

	return true;
}

function waveGetNewTargets()
{
	waveTargets = [];
	for (let player = 0; player < maxPlayers; player++)
	{
		if (player === waveMe())
		{
			continue;
		}
		waveTargets = waveTargets.concat(enumStruct(player, HQ));
	}
}
