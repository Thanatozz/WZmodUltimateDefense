//
// The slot allowed to set the rules. Player 1 in the lobby is index 0.
//
const CONFIG_PLAYER = 0;

//
// Player 1's own settings, read from the Warzone configuration directory.
//
// Looked for in multiplay/script/rules, like everything includeJSON() is asked
// for, so the file goes in <Warzone config>/multiplay/script/rules/.
//
// Deliberately outside the .wz: everyone installs the same published mod, and
// only the person hosting keeps a file of preferences.
//
const EXTERNAL_CONFIG = "ultimatedefense.json";


//
// Per-game settings, chosen by the first player.
//
// config.js is baked into the .wz, and Warzone will not let people with
// different copies of a mod play together, so those settings are the same for
// everyone by construction - but they cannot be changed for one game without
// handing out a new build, and handing an edited build to somebody you just met
// is not going to happen.
//
// Chat is where the host types the command, and nothing more. It was the
// transport too, and it does not work: a joining client shows the message on
// screen but its rules script never receives eventChat. The settings themselves
// travel over syncRequest (see Presets.js), which reaches every client and is
// applied on the same tick by all of them.
//
// So the only machine that reads a preset file is the host's. Everyone else is
// sent the numbers, which is what lets the host play a configuration nobody else
// has installed.
//

namespace("chatcmd_");

function chatcmd_eventStartLevel()
{
	if (!chatCommands)
	{
		return;
	}

	if (isSpectator(-1) || selectedPlayer !== CONFIG_PLAYER)
	{
		return;
	}

	if (externalSettingsEnabled)
	{
		loadExternalSettings();
	}

	// One client sends, everyone receives. Give the game a moment to settle
	// first, or the messages arrive before anyone can read them.
	queue("broadcastSettings", 2 * 1000);
}

/**
 * Read player 1's own settings file, if they keep one.
 *
 * This is the way around config.js being sealed inside the .wz. A file sitting
 * in the Warzone configuration directory is not part of the mod, so editing it
 * does not change the mod's fingerprint and does not stop anyone playing
 * together - and only player 1's copy is ever read, with the values going out
 * over chat, so every client still ends up agreeing.
 *
 * Optional by design: no file means the values compiled into config.js stand.
 *
 *   {
 *     "preset": "longdefense",
 *     "waveScale": 1.5,
 *     "crates": true,
 *     "droppods": false
 *   }
 *
 * Only these four fields, and deliberately so: this file is read on one machine,
 * and anything it changes has to reach the others or the two will compute
 * different rounds and the game comes apart. Each of these has a chat command to
 * travel in. Everything else belongs in a preset, which every client loads from
 * its own copy of the mod.
 */
function loadExternalSettings()
{
	// quiet is passed, but it does not stop the file loader below it printing
	// "Failed to find file" on screen when the file is absent - which is why
	// this whole path is off unless someone asks for it.
	const settings = includeJSON(EXTERNAL_CONFIG, true);
	if (!settings)
	{
		return;
	}

	// Nothing is applied here. Everything goes out over chat a moment later and
	// comes back through the same handler every other client uses, so player 1
	// is not a special case and cannot end up a step ahead.
	if (typeof settings.preset === "string")
	{
		externalPreset = settings.preset;
	}
	if (typeof settings.waveScale === "number" && settings.waveScale > 0)
	{
		externalWaves = settings.waveScale;
	}
	if (typeof settings.crates === "boolean")
	{
		externalCrates = settings.crates;
	}
	if (typeof settings.droppods === "boolean")
	{
		externalDropPods = settings.droppods;
	}

	console("Wave Defense: loaded settings from " + EXTERNAL_CONFIG);
}

/**
 * Say out loud what this game is being played under.
 *
 * Only player 1's client runs this, and it sends its own config.js values - so
 * where a build has been edited, everyone else hears about it rather than
 * guessing from what turns up in round one.
 */
function broadcastSettings()
{
	// The preset goes first: it replaces the whole configuration, so anything
	// sent after it is meant to override what the preset chose.
	if (externalPreset !== null && !playPreset(externalPreset))
	{
		console("No preset called '" + externalPreset + "', keeping the default");
	}

	// Only what the settings file actually asked for. Restating the values from
	// config.js would tell every client something it already has, and every
	// setting applied is a change of state that has to land the same way
	// everywhere - so the ones that change nothing are pure risk.
	const overrides = {};
	if (externalWaves !== null)
	{
		overrides["waveScale"] = externalWaves;
	}
	if (externalCrates !== null)
	{
		overrides["bossCrates"] = externalCrates;
	}
	if (externalDropPods !== null)
	{
		overrides["dropPods"] = externalDropPods;
	}

	if (Object.keys(overrides).length > 0)
	{
		sendSettings(overrides);
	}

	// Not wrapped in _(): a sentence split around a number cannot be translated
	console("Settings are open for " + configWindowSeconds + " seconds");
}

function chatcmd_eventChat(from, to, message)
{
	if (!chatCommands || typeof message !== "string")
	{
		return;
	}

	const words = message.trim().toLowerCase().split(/\s+/);
	if (words[0] !== "!ud")
	{
		return;
	}

	// A configuration going past. Every reason for refusing one is said out loud:
	// a client that quietly drops it carries on playing by rules the host is not,
	// and the only symptom is a game that comes apart several minutes later.
	const settings = words[1] === "load" || words[1] === "play";

	// Only the first player sets the rules. A script is never told which client
	// is the host, so the first slot is the nearest thing to an agreed authority.
	if (from !== CONFIG_PLAYER)
	{
		if (settings)
		{
			console("Wave Defense: settings from " + playerData[from].name
				+ " ignored - only player 1 sets the rules");
		}
		return;
	}

	// Locked once the window closes: two clients applying a change a tick apart
	// would compute different waves from then on and desync the game.
	if (gameTime > configWindowSeconds * 1000)
	{
		if (settings)
		{
			console("Wave Defense: settings arrived after the window closed, ignored");
		}
		else if (from === selectedPlayer)
		{
			console(_("Too late - settings are locked once the game is under way"));
		}
		return;
	}

	applyChatCommand(from, words[1], words[2], message);
}

/**
 * @param {number} from - who sent it, for the announcement
 * @param {string} setting
 * @param {string} value - lowercased, fine for on/off and numbers
 * @param {string} message - the line as typed, for values that carry JSON
 */
function applyChatCommand(from, setting, value, message)
{
	if (setting === "probe")
	{
		// "!ud probe sync" answers the question the whole design rests on: does a
		// syncRequest reach the other players? If the line comes up on every
		// screen it does, and if it only comes up on this one it does not.
		if (value === "sync")
		{
			if (from === selectedPlayer)
			{
				probeSync();
			}
			return;
		}

		probePaths(value ? value + ".json" : EXTERNAL_CONFIG);
		return;
	}

	if (setting === "play")
	{
		// Only the sender loads the file. Everyone else is sent its contents, so
		// the host can play a preset nobody else has - which is the whole point:
		// handing out an edited build to people you just met is not going to
		// happen. A preset that will not load leaves the default in place.
		if (from !== selectedPlayer)
		{
			return;
		}

		if (!playPreset(value))
		{
			console("No preset called '" + value + "', keeping the default");
		}
		return;
	}

	if (setting === "load")
	{
		// A configuration somebody exported and pasted in. Only the person who
		// typed it reads it; from there it goes out over the sync channel like a
		// preset, so everyone applies it on the same tick.
		if (from === selectedPlayer)
		{
			applyImportString(message);
		}
		return;
	}

	if (setting === "export")
	{
		if (from === selectedPlayer)
		{
			announceExport();
		}
		return;
	}

	// The shorthands below are one-setting configurations. They go out over the
	// sync channel like everything else rather than being applied here: this
	// handler only ever runs on the machine that typed the command, so applying
	// directly would change the rules for one player and nobody else - which is
	// not a setting, it is a desync.
	if (from !== selectedPlayer)
	{
		return;
	}

	if (setting === "scale")
	{
		const scale = Number(value);
		if (!(scale > 0))
		{
			return;
		}
		sendSettings({ "waveScale": scale });
		return;
	}

	if (setting === "crates")
	{
		sendSettings({ "bossCrates": isOn(value) });
		return;
	}

	if (setting === "droppods")
	{
		sendSettings({ "dropPods": isOn(value) });
		return;
	}

	console("!ud play <preset> | load <code> | export | scale <number>");
	console("    | crates on/off | droppods on/off | probe sync");
}

/**
 * Read a pasted configuration code and send it to everyone.
 *
 * Read from the raw message rather than the lowercased words: the code carries
 * body names like "Viper", and lowercasing it would break the boss curve.
 *
 * @param {string} message - the whole "!ud load <code>" line
 */
function applyImportString(message)
{
	const parts = message.trim().split(/\s+/);
	if (parts.length < 3)
	{
		return;
	}

	const flat = importSettings(message.substring(message.indexOf(parts[2])));
	if (flat === null)
	{
		// Codes carry setting numbers, so one written by a different version of
		// the mod means something else here. Refuse the lot rather than apply the
		// half of it that happens to line up.
		console("Wave Defense: could not read that code - it may be from a different"
			+ " version of the mod");
		return;
	}

	sendSettings(flat);
}

/**
 * Print the settings in force as one string, for sharing outside the game.
 *
 * The same code "!ud load" takes, so it can be pasted into a chat message, kept
 * in a text file, or handed to somebody who wants to play the same rules without
 * being handed an edited build of the mod.
 */
function announceExport()
{
	const code = exportSettings(changedSettings());
	if (code === "")
	{
		console("Wave Defense: playing the default settings, nothing to export");
		return;
	}

	console("Wave Defense: !ud load " + code);
}

/**
 * A configuration arriving from another player.
 *
 * This is the receiving end of the whole design, and the reason it is not
 * eventChat: a joining client shows chat on screen but its rules script is never
 * given the event - the game's own script logs have chatcmd_eventStartLevel
 * running on a client and chatcmd_eventChat never running, in any game. Nothing
 * the host typed ever arrived. syncRequest is delivered to every client and, just
 * as importantly, executed on the same tick on all of them.
 */
function chatcmd_eventSyncRequest(request, x, y, obj, obj2)
{
	receiveSync(request, x, y);
}

/**
 * Say something out loud to everybody.
 *
 * Chat is still how the host talks to the other players - it just is not how
 * settings travel any more.
 *
 * @param {string} message
 */
function sendLine(message)
{
	chat(ALL_PLAYERS, message);
}

function isOn(value)
{
	return value === "on" || value === "1" || value === "true" || value === "yes";
}
