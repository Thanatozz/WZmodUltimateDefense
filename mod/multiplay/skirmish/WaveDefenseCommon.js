//
// Shared wave attacker logic.
//
// This file is included from two different script contexts:
//   - multiplay/skirmish/WaveDefense.js, running as the AI of its own player
//   - multiplay/script/mods/init.js, running inside the rules script
//
// The including script must define:
//   waveMe()        - the player number of this wave attacker
//   waveRandom(n)   - a random integer in [0, n)
//   hordePlayers()  - every player on the attacking side
//

// Every AI script that marks a slot as a wave attacker, and the spawn mode the
// rules script uses for that slot. Adding a mode means adding one entry here,
// a one-line .js next to this file, and a matching .json for the lobby list.
const WAVE_SCRIPTS = {
	"WaveDefense.js":         "base",
	"WaveDefenseSurround.js": "surround",
	"WaveDefenseRandom.js":   "random",
	"WaveDefenseCenter.js":   "center",
	"WaveDefenseMeteor.js":   "meteor",
};

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
	for (const player of waveDefenders())
	{
		waveTargets = waveTargets.concat(enumStruct(player, HQ));
	}
}

/**
 * Everyone the waves are sent against: every slot that is not part of the horde
 * and not a spectator.
 *
 * This is the single definition of "defender" for the whole mod. The rules
 * script gets it by including this file from multiplay/script/mods/init.js.
 *
 * Membership is deliberately NOT based on alliances. It used to be, and that
 * quietly broke Locked Teams games: allyHorde() allies the wave players, teams
 * are alliances too, so a wave slot left on a defender's team dragged every one
 * of that player's team mates out of the defender list - taking the humans with
 * it. Horde membership comes from the AI script a slot runs, nothing else.
 *
 * @returns {number[]} player numbers
 */
function waveDefenders()
{
	const horde = hordePlayers();
	const result = [];

	for (let player = 0; player < maxPlayers; player++)
	{
		if (isSpectator(player) || horde.includes(player))
		{
			continue;
		}

		result.push(player);
	}

	return result;
}

/**
 * Slots running one of the wave AI scripts.
 *
 * Both script contexts can read playerData, so this works from the AI as well
 * as from the rules script. It does NOT cover the fallback modes, where no
 * Wave Defense AI is in a slot at all - that is why the rules script overrides
 * hordePlayers() with the fully resolved list.
 *
 * @returns {number[]} player numbers
 */
function waveScriptPlayers()
{
	const result = [];
	for (let player = 0; player < maxPlayers; player++)
	{
		if (WAVE_SCRIPTS.hasOwnProperty(playerData[player].scriptName))
		{
			result.push(player);
		}
	}
	return result;
}

/**
 * @param {number} player
 * @returns {string} the spawn mode for that slot
 */
function waveSpawnMode(player)
{
	return WAVE_SCRIPTS[playerData[player].scriptName] || "base";
}
