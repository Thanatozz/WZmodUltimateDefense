//
// Wave attacker targeting, driven from the rules script.
//
// Only used in the "hack" mode, where no dedicated enemy slot exists and the
// rules script has to command the units itself. See getWavePlayer().
//

include("multiplay/skirmish/WaveDefenseCommon.js");

function waveMe()
{
	return wavePlayer;
}

function waveRandom(n)
{
	return syncRandom(n);
}

function updateOrders()
{
	waveUpdateOrders();
}
