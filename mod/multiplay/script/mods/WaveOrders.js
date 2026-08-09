//
// Binds the shared wave logic in WaveDefenseCommon.js to the rules script.
//
// Two things use it:
//   - waveDefenders(), needed in every mode to know who the waves target
//   - updateOrders(), only started in the "hack" mode, where no dedicated enemy
//     slot exists and the rules script has to command the units itself
//

function waveMe()
{
	return wavePlayer;
}

function waveRandom(n)
{
	return syncRandom(n);
}

/**
 * The rules script knows the fully resolved list, including the fallback modes
 * where no Wave Defense AI is in a slot at all.
 */
function hordePlayers()
{
	const horde = wavePlayers.slice();

	if (scavengers !== 0 && !horde.includes(scavengerPlayer))
	{
		horde.push(scavengerPlayer);
	}

	return horde;
}

function updateOrders()
{
	waveUpdateOrders();
}
