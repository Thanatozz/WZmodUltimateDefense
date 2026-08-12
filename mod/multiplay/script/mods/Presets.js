//
// Presets: a whole configuration in one JSON file, sent as the differences.
//
// The point is playing with someone you do not know. Warzone refuses to let
// people with different copies of a mod play together, so the host cannot hand
// out an edited build - and nobody would install one from a stranger anyway.
//
//     !ud play blitz
//
// Only the host reads the file. What goes out over chat is not the file, and not
// its name, but the settings in it that differ from what everyone already has:
//
//     !ud set waves.rounds 15
//     !ud set waves.budgetGrowth 1.55
//     !ud set spawnRate 8
//
// A preset that changes three things sends three lines. One identical to the
// default sends none. And every player can read what was changed rather than
// having to trust it - which matters when the host can rewrite the rules.
//
// It all runs inside the settings window, before the round reader has started,
// so rebuilding the round list is safe.
//

//
// Every path includeJSON() is given is measured from multiplay/script/rules -
// the folder of the script that starts the chain, not the folder this file sits
// in. A leading slash makes no difference; it is relative either way.
//
// That took four attempts to pin down, so for the record:
//
//   asked for                                 looked in
//   presets/x.json                            rules/presets/x.json
//   /presets/x.json                           rules/presets/x.json
//   multiplay/script/mods/presets/x.json      rules/multiplay/script/mods/...
//
// Hence the files live in rules/presets/ inside the mod. And since Warzone
// mounts the configuration directory ahead of the mod, the same lookup finds
// <Warzone config>/multiplay/script/rules/presets/ first - which is how someone
// adds a preset of their own without repacking anything.
//
// A shorter path was tried - "../../presets/", which would have landed in
// <Warzone config>/multiplay/presets/ - and the engine refuses it. PHYSFS does
// not resolve ".." at all, so the long path is the only one there is.
const PRESET_DIRS = ["presets/"];

/**
 * Every setting a preset may carry, and how to put it into effect.
 *
 * Keyed by the name used both in a preset file and in "!ud set". A setting that
 * is not in here does not travel, so anything added to configAPI.js has to be
 * added here too.
 */
const SETTINGS = {
	"spawnRate":         { apply: setSpawnRate },
	"spawnRadius":       { apply: setSpawnRadius },
	"dropPods":          { apply: setDropPodEnabled },
	"dropPodDistance":   { apply: setDropPodDistance },
	"dropPodBurst":      { apply: setDropPodBurst },
	"dropPodWarning":    { apply: setDropPodWarning },
	"vtolsDisabled":     { apply: setVTOLsDisabled },

	"noBuildRadius":     { apply: setNoBuildRadius },
	"campRadius":        { apply: setCampRadius },
	"campTries":         { apply: setCampTries },

	"hqGraceUntilRound": { apply: setHQGraceUntilRound },
	"grantHQToAI":       { apply: setGrantHQToAI },
	"eliminateOnHQLoss": { apply: setEliminateOnHQLoss },
	"hqBlastRadius":     { apply: setHQBlastRadius },
	"hqBlastStep":       { apply: setHQBlastStep },
	"hqBlastWeapon":     { apply: setHQBlastWeapon },

	"bossCrates":        { apply: setBossCrates },
	"researchDelay":     { apply: setResearchDelay },

	"budgetVariance":    { apply: setBudgetVariance },
	"waveScale":         { apply: setWaveScale },
	"waveSplit":         { apply: setWaveSplit },

	"startTimes.clean":            { group: "startTimes" },
	"startTimes.base":             { group: "startTimes" },
	"startTimes.advanced":         { group: "startTimes" },

	"difficultyTimeBonus.easy":    { group: "timeBonus" },
	"difficultyTimeBonus.medium":  { group: "timeBonus" },
	"difficultyTimeBonus.hard":    { group: "timeBonus" },
	"difficultyTimeBonus.insane":  { group: "timeBonus" },

	"difficultyScale.easy":        { group: "difficultyScale" },
	"difficultyScale.medium":      { group: "difficultyScale" },
	"difficultyScale.hard":        { group: "difficultyScale" },
	"difficultyScale.insane":      { group: "difficultyScale" },

	"waves.rounds":        { waves: true },
	"waves.budgetStart":   { waves: true },
	"waves.budgetGrowth":  { waves: true },
	"waves.waitNormal":    { waves: true },
	"waves.waitBreather":  { waves: true },
	"waves.breatherEvery": { waves: true },
	"waves.roundsPerTier": { waves: true },
	"waves.tierSpread":    { waves: true },

	// The settings that generateWaves() wants as one object are held here a piece
	// at a time. Everything that travels between clients is a single number, and
	// keeping the parts separate is what makes that possible - applySetting()
	// puts each one back into its parent object as it arrives.
	"waves.composition.light":  { waves: true, parent: "waves.composition", part: "light" },
	"waves.composition.medium": { waves: true, parent: "waves.composition", part: "medium" },
	"waves.composition.heavy":  { waves: true, parent: "waves.composition", part: "heavy" },

	"waves.special.chance":     { waves: true, parent: "waves.special", part: "chance" },

	"waves.swarm.chance":       { waves: true, parent: "waves.swarm", part: "chance" },
	"waves.swarm.tierShift":    { waves: true, parent: "waves.swarm", part: "tierShift" },

	"waves.boss.every":        { waves: true, parent: "waves.boss", part: "every" },
	"waves.boss.countStart":   { waves: true, parent: "waves.boss", part: "countStart" },
	"waves.boss.countDecline": { waves: true, parent: "waves.boss", part: "countDecline" },
	"waves.boss.chassis":      { waves: true, parent: "waves.boss", part: "chassis", chassis: true },
};

/**
 * Read a preset without applying it, so its contents can be compared first.
 *
 * @param {string} name - a file in the presets folder, without the extension
 * @returns {object|null}
 */
function loadPresetData(name)
{
	// Only letters, digits and dashes: the name arrives over chat, and it is
	// about to be turned into a file path.
	if (typeof name !== "string" || !/^[a-z0-9_-]+$/.test(name))
	{
		return null;
	}

	const file = name + ".json";

	for (const dir of PRESET_DIRS)
	{
		const data = includeJSON(dir + file, true);
		if (data)
		{
			return data;
		}
	}

	return null;
}

/**
 * Try every plausible location for a file and report which one worked.
 *
 * Prints scriptPath, which is what the whole question turned on: the engine
 * measures a relative path from the folder of the script that started the chain
 * (multiplay/script/rules), not from the file asking. Kept for the next time
 * something cannot be found.
 *
 * Every miss prints an engine error that cannot be suppressed, so this is a
 * deliberate diagnostic, not something to run on a whim.
 *
 * @param {string} filename
 */
function probePaths(filename)
{
	// The one fact that settles it: what the engine thinks this script's folder
	// is. Everything else has been guesswork against that unknown.
	console("Wave Defense: scriptPath = " + (typeof scriptPath !== "undefined" ? scriptPath : "undefined"));
	console("Wave Defense: scriptName = " + (typeof scriptName !== "undefined" ? scriptName : "undefined"));

	const candidates = [
		PRESET_DIRS[0] + filename,
		"/" + filename,
		filename,
		"presets/" + filename,
	];

	console("Wave Defense: probing for " + filename + " - misses print an error, that is expected");

	let found = 0;
	for (const path of candidates)
	{
		if (includeJSON(path, true))
		{
			console("  FOUND at: " + path);
			found++;
		}
	}

	if (found === 0)
	{
		console("  not reachable from a script by any of those paths");
	}
}

/**
 * Flatten a settings object into the keys SETTINGS uses.
 *
 * One level of nesting is expanded - startTimes.clean and so on - while a value
 * the table names outright, like waves.boss, is kept whole.
 *
 * @param {object} data
 * @returns {object} key -> value
 */
function flattenSettings(data)
{
	const flat = {};

	for (const key of Object.keys(data))
	{
		if (SETTINGS[key] !== undefined)
		{
			flat[key] = data[key];
			continue;
		}

		const value = data[key];
		if (value === null || typeof value !== "object" || Array.isArray(value))
		{
			continue; // not a setting this mod knows
		}

		for (const inner of Object.keys(value))
		{
			const path = key + "." + inner;
			if (SETTINGS[path] !== undefined)
			{
				flat[path] = value[inner];
				continue;
			}

			// One more level, for waves.boss.*
			const nested = value[inner];
			if (nested !== null && typeof nested === "object" && !Array.isArray(nested))
			{
				for (const deep of Object.keys(nested))
				{
					const deepPath = path + "." + deep;
					if (SETTINGS[deepPath] !== undefined)
					{
						flat[deepPath] = nested[deep];
					}
				}
			}
		}
	}

	return flat;
}

/**
 * Put one setting into effect and remember it.
 *
 * @param {string} key - as used in a preset and in "!ud set"
 * @param {*} value
 * @returns {boolean} whether the key was recognised
 */
function applySetting(key, value)
{
	const setting = SETTINGS[key];
	if (setting === undefined)
	{
		return false;
	}

	// Settings that live inside an object go back into it, since that is the shape
	// generateWaves() wants them in
	if (setting.parent)
	{
		const group = liveSettings[setting.parent] || {};
		group[setting.part] = setting.chassis && typeof value === "string"
			? decodeChassis(value)
			: value;
		liveSettings[setting.parent] = group;
		rebuildWaves();
		return true;
	}

	liveSettings[key] = value;

	if (setting.apply)
	{
		setting.apply(value);
	}
	else if (setting.group === "startTimes")
	{
		// The grouped ones go in together or not at all, so rebuild the group
		// from whatever is currently in force.
		setStartTimes(live("startTimes.clean"), live("startTimes.base"),
			live("startTimes.advanced"));
	}
	else if (setting.group === "timeBonus")
	{
		setDifficultyTimeBonus(live("difficultyTimeBonus.easy"),
			live("difficultyTimeBonus.medium"), live("difficultyTimeBonus.hard"),
			live("difficultyTimeBonus.insane"));
	}
	else if (setting.group === "difficultyScale")
	{
		setDifficultyScale(live("difficultyScale.easy"), live("difficultyScale.medium"),
			live("difficultyScale.hard"), live("difficultyScale.insane"));
	}
	else if (setting.waves)
	{
		// Rebuilt from scratch each time. A few settings arrive one after another
		// and thirty rounds are cheap to lay out, so there is nothing to gain by
		// working out which parts of the curve actually moved.
		rebuildWaves();
	}

	return true;
}

function live(key)
{
	return liveSettings[key];
}

/**
 * Apply a whole settings object at once. This is how config.js sets the
 * defaults, and it is what fills in the values a preset is later compared to.
 *
 * @param {object} data
 */
function applySettings(data)
{
	if (!data)
	{
		return;
	}

	const flat = flattenSettings(data);
	for (const key of Object.keys(flat))
	{
		applySetting(key, flat[key]);
	}

	// config.js is the only thing that ever calls this, and it calls it once, so
	// what stands afterwards is the build's defaults. Keeping a copy is what lets
	// an export say only what was changed rather than restate the whole game.
	if (defaultSettings === null)
	{
		defaultSettings = {};
		for (const key of Object.keys(SETTINGS))
		{
			defaultSettings[key] = currentValue(key);
		}
	}
}

/**
 * The settings that differ from what this build starts with.
 *
 * @returns {object} key -> value, in the shape exportSettings() wants
 */
function changedSettings()
{
	const changed = {};
	if (defaultSettings === null)
	{
		return changed;
	}

	for (const key of Object.keys(SETTINGS))
	{
		const value = currentValue(key);
		if (value !== undefined && !sameSetting(value, defaultSettings[key]))
		{
			changed[key] = value;
		}
	}

	return changed;
}

/**
 * Rebuild the round list from whatever wave settings are in force.
 *
 * generateWaves() takes functions, which JSON cannot carry, so the settings
 * describe the same curves as numbers and this turns them back into functions.
 */
function rebuildWaves()
{
	// Replacing the list, not adding to it: these settings define a whole game.
	actions = [];
	totalRounds = 0;
	index = 0;

	const budgetStart = live("waves.budgetStart");
	const budgetGrowth = live("waves.budgetGrowth");
	const waitNormal = live("waves.waitNormal");
	const waitBreather = live("waves.waitBreather");
	const breatherEvery = live("waves.breatherEvery");
	const roundsPerTier = live("waves.roundsPerTier");
	const boss = live("waves.boss") || {};

	generateWaves({
		rounds: live("waves.rounds"),
		budget: round => Math.round(budgetStart * Math.pow(budgetGrowth, round - 1)),
		waitTime: round =>
		{
			if (round === 1)
			{
				return startTime();
			}
			return round % breatherEvery === 0 ? waitBreather : waitNormal;
		},
		tier: round => Math.min(TOP_TIER, Math.floor((round - 1) / roundsPerTier)),
		tierSpread: live("waves.tierSpread"),
		composition: live("waves.composition"),
		special: live("waves.special"),
		swarm: live("waves.swarm"),
		boss: {
			every: boss.every,
			count: round => boss.countStart - round / boss.countDecline,
			chassis: boss.chassis,
		},
	});

	// The veterancy curve is derived from the round count, which just changed
	ranks = calculateRanks(totalRounds);
}

/**
 * Load a preset, apply what it changes, and tell everyone else about it.
 *
 * Only the differences travel. A preset matching what is already in force sends
 * nothing: the default game has no business restating itself in twenty lines of
 * chat.
 *
 * @param {string} name
 * @returns {boolean} whether the preset was found
 */
function playPreset(name)
{
	const data = loadPresetData(name);
	if (!data)
	{
		return false;
	}

	const flat = flattenSettings(data);
	const diff = {};
	let changed = 0;

	// Only the differences travel. A preset mostly agrees with the defaults, and
	// there is no sense in sending back what every client already has in its own
	// copy of config.js.
	for (const key of Object.keys(flat))
	{
		if (sameSetting(flat[key], currentValue(key)))
		{
			continue;
		}

		diff[key] = flat[key];
		changed++;
	}

	if (changed === 0)
	{
		console("Wave Defense: '" + name + "' matches the current settings, nothing sent");
		return true;
	}

	// Sent, not applied. Everyone applies on the commit, this machine included,
	// so no client is a step ahead of the others - and a preset that only took
	// effect on the host would be a desync rather than a configuration.
	const sent = sendSettings(diff);

	console("Wave Defense: playing '" + name + "', " + sent + " settings sent");
	return true;
}

////////////////////////////////////////////////////////////////////////////////
//                                                                            //
// Import / export strings                                                    //
//                                                                            //
// One line that carries a whole configuration, the way a build string does in //
// other games:                                                               //
//                                                                            //
//     !ud load 7=240~m=300~n=180~0=8~e=8~t=15~u=600~v=1.55                   //
//                                                                            //
// This is for people, not for the network - "!ud export" prints one, and you  //
// can put it in a message, a forum post or a text file and somebody else can  //
// play your configuration without installing anything. Getting it to the      //
// other players in the game is a separate job, done over the sync channel     //
// above.                                                                     //
//                                                                            //
// Keys travel as their index in SETTINGS, in base 36, which is what keeps a   //
// whole preset down to a line or two. That means a code is only valid for     //
// builds with the same settings list - a mismatch is caught on the way in and //
// refused rather than half-applied.                                          //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

const EXPORT_SEPARATOR = "~";
const EXPORT_ASSIGN = "=";

/**
 * @returns {string[]} the settings keys, in the fixed order the indices mean
 */
function settingKeys()
{
	return Object.keys(SETTINGS);
}

/**
 * Pack a set of settings into one string.
 *
 * @param {object} flat - key -> value, as flattenSettings() produces
 * @returns {string}
 */
function exportSettings(flat)
{
	const keys = settingKeys();
	const parts = [];

	for (const key of Object.keys(flat))
	{
		const index = keys.indexOf(key);
		if (index < 0)
		{
			continue;
		}

		const setting = SETTINGS[key];
		const value = setting.chassis ? encodeChassis(flat[key]) : flat[key];

		parts.push(index.toString(36) + EXPORT_ASSIGN + JSON.stringify(value));
	}

	return parts.join(EXPORT_SEPARATOR);
}

/**
 * Read a string made by exportSettings() back into settings.
 *
 * Nothing is applied here. The caller sends the result over the sync channel like
 * any other configuration, so the person typing the code is not a step ahead of
 * everybody else.
 *
 * @param {string} text
 * @returns {object|null} key -> value, or null if the code could not be read
 */
function importSettings(text)
{
	if (typeof text !== "string" || text === "")
	{
		return null;
	}

	const keys = settingKeys();
	const flat = {};

	// Read it all before returning anything: half a configuration is worse than
	// none, because the others would be playing the whole of it.
	for (const part of text.split(EXPORT_SEPARATOR))
	{
		const split = part.indexOf(EXPORT_ASSIGN);
		if (split < 0)
		{
			return null;
		}

		const key = keys[parseInt(part.substring(0, split), 36)];
		if (key === undefined)
		{
			return null;
		}

		let value = null;
		try
		{
			value = JSON.parse(part.substring(split + 1));
		}
		catch (error)
		{
			return null;
		}

		flat[key] = SETTINGS[key].chassis && typeof value === "string"
			? decodeChassis(value)
			: value;
	}

	return flat;
}

/**
 * A setting's value written out for a player to read.
 *
 * @param {string} key
 * @param {*} value - as it arrived, so chassis is still in its compact form
 * @returns {string}
 */
function describeValue(key, value)
{
	if (SETTINGS[key] !== undefined && SETTINGS[key].chassis)
	{
		// "5:Viper|10:Python|..." reads better than the array of objects
		return Array.isArray(value) ? encodeChassis(value) : String(value);
	}

	return JSON.stringify(value);
}

////////////////////////////////////////////////////////////////////////////////
//                                                                            //
// Sending a configuration to the other players                               //
//                                                                            //
// Chat was the obvious channel and it does not work. A client shows the       //
// message on screen but its rules script never receives eventChat: the game's //
// own logs show chatcmd_eventStartLevel running on a joining client and       //
// chatcmd_eventChat never running, in any game. So nothing the host typed     //
// ever reached anybody.                                                      //
//                                                                            //
// syncRequest() is the channel meant for this, and its documentation says     //
// exactly what we need: "sent over the network to all clients and executed    //
// simultaneously". Executed simultaneously matters as much as delivered -     //
// applying a setting three ticks apart is itself a desync, since both         //
// machines generate the rounds from it.                                      //
//                                                                            //
// It carries integers, not text, so a configuration travels as numbers: one   //
// request per setting, then a commit that puts the whole lot into effect at   //
// once. Half a configuration is worse than none, because the others would be  //
// playing the whole of it.                                                   //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

const SYNC_BEGIN = 9001;     // start of a batch, x = how many settings to expect
const SYNC_COMMIT = 9002;    // end of a batch, apply it
const SYNC_CHASSIS = 9100;   // + step index, one per boss chassis step
const SYNC_CHASSIS_MAX = 16; // how many steps a boss curve may have
const SYNC_SETTING = 9200;   // + the setting's index in SETTINGS

/**
 * Send a configuration to everyone, including ourselves.
 *
 * @param {object} flat - key -> value, as flattenSettings() produces
 * @returns {number} how many settings went out
 */
function sendSettings(flat)
{
	const keys = settingKeys();
	const rows = [];
	let count = 0;

	for (const key of Object.keys(flat))
	{
		const index = keys.indexOf(key);
		if (index < 0)
		{
			continue;
		}

		if (SETTINGS[key].chassis)
		{
			if (chassisRows(flat[key], rows))
			{
				count++;
			}
			continue;
		}

		const parts = splitNumber(flat[key]);
		if (parts === null)
		{
			// Anything that is not a number or a yes/no cannot travel this way.
			// Saying so beats the others quietly playing something else.
			console("Wave Defense: '" + key + "' cannot be sent to the other players, skipped");
			continue;
		}

		rows.push([SYNC_SETTING + index, parts[0], parts[1]]);
		count++;
	}

	syncRequest(SYNC_BEGIN, count, 0);
	for (const row of rows)
	{
		syncRequest(row[0], row[1], row[2]);
	}
	syncRequest(SYNC_COMMIT, count, 0);

	return count;
}

/**
 * Turn a boss curve into one row per body.
 *
 * A step can name several bodies ("Tiger" or "Leopard"), so each gets its own
 * row and the receiving side collects them back into the step.
 *
 * @param {object[]} chassis - [{untilRound, bodies}]
 * @param {number[][]} rows - appended to
 * @returns {boolean} whether anything was added
 */
function chassisRows(chassis, rows)
{
	if (!Array.isArray(chassis))
	{
		return false;
	}

	// Bodies travel as their position in the game's own body list, which is built
	// from the same data files on every machine and so is the same list everywhere
	const bodies = Object.keys(Stats.Body);
	let added = false;

	for (let step = 0; step < chassis.length && step < SYNC_CHASSIS_MAX; step++)
	{
		for (const body of chassis[step].bodies)
		{
			const index = bodies.indexOf(body);
			if (index < 0)
			{
				console("Wave Defense: no such body '" + body + "', left out of the boss curve");
				continue;
			}

			rows.push([SYNC_CHASSIS + step, chassis[step].untilRound, index]);
			added = true;
		}
	}

	return added;
}

/**
 * A value as two small integers, because syncRequest carries coordinates and a
 * coordinate is not the place to put 600000.
 *
 * @param {number|boolean} value
 * @returns {number[]|null} [whole, thousandths], or null if it cannot travel
 */
function splitNumber(value)
{
	if (typeof value === "boolean")
	{
		return [value ? 1 : 0, 0];
	}

	if (typeof value !== "number" || !isFinite(value) || value < 0)
	{
		return null;
	}

	const whole = Math.floor(value);
	return [whole, Math.round((value - whole) * 1000)];
}

/**
 * Put one back together, using the build's own default to tell a yes/no from a
 * number - the sender and the receiver have the same config.js, so the same
 * setting has the same kind of value on both.
 *
 * @param {string} key
 * @param {number} whole
 * @param {number} thousandths
 */
function joinNumber(key, whole, thousandths)
{
	if (typeof defaultSettings[key] === "boolean")
	{
		return whole !== 0;
	}

	// Rounded back to three decimals rather than left as the sum: 1 + 140/1000 is
	// 1.1400000000000001 in binary floating point, and a growth rate that reads
	// differently on each screen is a bug report waiting to happen.
	return Math.round((whole + thousandths / 1000) * 1000) / 1000;
}

/**
 * Take one request off the wire.
 *
 * Nothing is applied until the commit arrives, so every client changes on the
 * same tick rather than drifting apart over the length of the transfer.
 *
 * @returns {boolean} whether this request was ours
 */
function receiveSync(request, x, y)
{
	if (request === SYNC_BEGIN)
	{
		// A fresh batch clears whatever an interrupted one left behind
		syncPending = {};
		syncChassis = [];
		return true;
	}

	if (request === SYNC_COMMIT)
	{
		commitSync(x);
		return true;
	}

	if (request >= SYNC_CHASSIS && request < SYNC_CHASSIS + SYNC_CHASSIS_MAX)
	{
		const step = request - SYNC_CHASSIS;
		const body = Object.keys(Stats.Body)[y];
		if (body === undefined)
		{
			return true;
		}

		if (syncChassis[step] === undefined)
		{
			syncChassis[step] = { untilRound: x, bodies: [] };
		}
		syncChassis[step].bodies.push(body);
		return true;
	}

	if (request >= SYNC_SETTING)
	{
		const key = settingKeys()[request - SYNC_SETTING];
		if (key === undefined)
		{
			// A setting this build does not have. Worth saying: this client is
			// about to play by a rule the host is not.
			console("Wave Defense: WARNING - the host sent a setting this version does not know");
			return true;
		}

		syncPending[key] = joinNumber(key, x, y);
		return true;
	}

	// Anything else is read out raw. A request that arrives as something other
	// than what was sent falls through to here, and being able to see the numbers
	// that actually came off the wire is the difference between measuring this
	// channel and guessing at it.
	console("Wave Defense: sync in - req=" + request + " x=" + x + " y=" + y);
	return false;
}

/**
 * Send a ladder of requests with known values, to find out what this channel
 * really carries.
 *
 * The parameters are documented as coordinates, and nothing says how big a
 * number survives the trip or what happens to a request id out of range. Each
 * line below is printed on every screen exactly as it arrives, so comparing what
 * went out with what came back answers both questions at once.
 *
 * The ids are deliberately ones the receiver does not recognise, so that every
 * one of them prints instead of being quietly acted upon.
 */
function probeSync()
{
	console("Wave Defense: sync out - req=7 x=1 y=2");
	syncRequest(7, 1, 2);

	console("Wave Defense: sync out - req=70 x=90 y=900");
	syncRequest(70, 90, 900);

	console("Wave Defense: sync out - req=700 x=9000 y=90000");
	syncRequest(700, 9000, 90000);

	console("Wave Defense: sync out - req=7000 x=32000 y=65536");
	syncRequest(7000, 32000, 65536);

	console("Wave Defense: sync out - req=8000 x=250 y=-5");
	syncRequest(8000, 250, -5);
}

/**
 * Apply everything that arrived, and say what it was.
 *
 * @param {number} expected - how many settings the sender said it sent
 */
function commitSync(expected)
{
	const chassis = syncChassis.filter(step => step !== undefined);
	if (chassis.length > 0)
	{
		syncPending["waves.boss.chassis"] = chassis;
	}

	const keys = Object.keys(syncPending);
	if (keys.length === 0)
	{
		return;
	}

	if (keys.length !== expected)
	{
		console("Wave Defense: WARNING - " + expected + " settings were sent but "
			+ keys.length + " arrived");
	}

	// Read out on every screen. Somebody who joined a game has no way of knowing
	// the rules were changed out from under the defaults, and "why is round one
	// three times the size" is not a good way to find out.
	console("Wave Defense: " + keys.length + " settings from the host");

	for (const key of keys)
	{
		applySetting(key, syncPending[key]);
		console("  " + key + " = " + describeValue(key, syncPending[key]));
	}

	syncPending = {};
	syncChassis = [];
}

/**
 * What a key is currently set to, reaching into the boss object for its parts.
 */
function currentValue(key)
{
	const setting = SETTINGS[key];
	if (setting && setting.parent)
	{
		const group = liveSettings[setting.parent] || {};
		return group[setting.part];
	}
	return liveSettings[key];
}

/**
 * The boss chassis curve, short enough to fit in a chat message.
 *
 * [{untilRound:5,bodies:["Viper"]}, ...] becomes "5:Viper|10:Python|15:Tiger,Leopard"
 * - about a quarter the length, and something a player can actually read as it
 * goes past.
 *
 * @param {object[]} chassis
 * @returns {string}
 */
function encodeChassis(chassis)
{
	if (!Array.isArray(chassis))
	{
		return "";
	}
	return chassis.map(step => step.untilRound + ":" + step.bodies.join(",")).join("|");
}

/**
 * @param {string|object[]} value - the compact form, or the array as written in a file
 * @returns {object[]}
 */
function decodeChassis(value)
{
	if (Array.isArray(value))
	{
		return value;
	}
	if (typeof value !== "string" || value === "")
	{
		return [];
	}

	const steps = [];
	for (const part of value.split("|"))
	{
		const halves = part.split(":");
		if (halves.length !== 2)
		{
			continue;
		}
		steps.push({ untilRound: Number(halves[0]), bodies: halves[1].split(",") });
	}
	return steps;
}

/**
 * Objects and arrays are compared by their JSON, which is enough here: they come
 * from files written the same way and none of them are large.
 */
function sameSetting(a, b)
{
	if (a === b)
	{
		return true;
	}
	if (a === null || b === null || typeof a !== "object" || typeof b !== "object")
	{
		return false;
	}
	return JSON.stringify(a) === JSON.stringify(b);
}
