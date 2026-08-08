//
// The wave attacker AI.
//
// This player does not build anything. The rules script spawns its units and
// hands out its research; all this script does is send them at the defenders.
//
// Putting this AI in a slot is also how the rules script identifies which player
// should run the waves, via playerData[player].scriptName.
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

function eventStartLevel()
{
	setTimer("waveUpdateOrders", 1000);
}
