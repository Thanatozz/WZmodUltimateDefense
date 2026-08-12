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
	// Math.random(), and it has to be. syncRandom() draws from a sequence shared
	// by every machine in the game, and the manual is explicit about what that
	// means here: "If it is called on just one peer (such as would be the case
	// for AIs, for instance), then game sync will break."
	//
	// An AI script is exactly that one peer. This ran once a second, so the host
	// pulled a number out of the shared sequence every second and nobody else
	// did - the two ends were reading different numbers within a minute. It only
	// became visible when the first wave arrived and there were units to command,
	// which is why the game always came apart at the same moment.
	//
	// Deciding locally is safe because the orders themselves travel: this script
	// runs on one machine, and the move and attack orders it issues go out over
	// the network like any other player's.
	return Math.floor(Math.random() * n);
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
