//
// The wave attacker AI.
//
// This player does not build anything. The rules script spawns its units and
// hands out its research; all this script does is send them at the defenders.
//
// Putting one of the Wave Defense AIs in a slot is also how the rules script
// learns which players run the waves and which spawn mode each one uses, via
// playerData[player].scriptName. See WAVE_SCRIPTS in WaveDefenseCommon.js.
//
// Several wave slots can share a game: the rules script allies them with each
// other and with the scavengers, so the horde never fights itself.
//

include("/multiplay/skirmish/WaveDefenseCommon.js");

function waveMe()
{
	return me;
}

function waveRandom(n)
{
	// syncRandom(), not Math.random(): AI scripts run on every client, and two
	// clients picking different targets would desync the game.
	return syncRandom(n);
}

function hordePlayers()
{
	const horde = waveScriptPlayers();

	// The scavengers are allied with the waves by the rules script.
	if (scavengers !== 0 && !horde.includes(scavengerPlayer))
	{
		horde.push(scavengerPlayer);
	}

	// A fallback slot (any AI, no Wave Defense script) would not be listed, but
	// this script only runs when it IS the wave AI, so make sure we are in.
	if (!horde.includes(me))
	{
		horde.push(me);
	}

	return horde;
}

function eventStartLevel()
{
	setTimer("waveUpdateOrders", 1000);
}
