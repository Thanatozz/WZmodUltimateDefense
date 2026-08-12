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
	"WaveDefenseDropPod.js":   "droppod",
};

// The same list again, by the name each of those scripts gives its slot in the
// lobby. It is here because scriptName is not to be relied on: a client that
// joins a game does not get it, and the host does - so the host would see a Wave
// Defense slot where the client saw an ordinary AI, and the two would generate
// different games from the first tick. The slot's name IS carried to everyone
// (the game's own sync log prints it identically on both ends), so it is what
// this actually resolves on, with scriptName kept as a second opinion.
//
// A new mode needs its entry in both tables, and the name has to match the
// "name" field of the matching .json exactly.
const WAVE_NAMES = {
	"Wave Defense - Base":     "base",
	"Wave Defense - Surround": "surround",
	"Wave Defense - Random":   "random",
	"Wave Defense - Center":   "center",
	"Wave Defense - Drop Pod": "droppod",
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
		if (waveModeOf(player) !== null)
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
	return waveModeOf(player) || "base";
}

/**
 * Which wave mode a slot runs, or null if it is not a wave slot at all.
 *
 * Guarded against a player number with nothing behind it, which is not a
 * hypothetical: the scavenger slot sits outside playerData, and the fallback in
 * getWavePlayers() hands it straight to here. That threw, the exception took
 * down the whole of eventStartLevel on the client, and the mod then did nothing
 * at all on that machine - which looked exactly like a desync, because it was
 * one.
 *
 * @param {number} player
 * @returns {string|null}
 */
function waveModeOf(player)
{
	const data = playerData[player];
	if (data === undefined)
	{
		return null;
	}

	// A trailing "_2" is the game keeping two slots apart, the way it turns a
	// second "Jugador" into "Jugador_2". Two Wave Defense slots in one game is a
	// supported setup, so the suffix comes off before the name is looked up.
	const name = String(data.name).replace(/_\d+$/, "");
	if (WAVE_NAMES.hasOwnProperty(name))
	{
		return WAVE_NAMES[name];
	}

	if (WAVE_SCRIPTS.hasOwnProperty(data.scriptName))
	{
		return WAVE_SCRIPTS[data.scriptName];
	}

	return null;
}
