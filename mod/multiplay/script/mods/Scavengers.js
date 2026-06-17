var targets = [];

function updateOrders()
{
	if (targets.length === 0)
	{
		return;
	}

	// Check if targets exist
	for (const target of targets)
	{
		const obj = getObject(target.x, target.y);
		if (!obj)
		{
			getNewTargets();
			updateOrders();
			return;
		}
	}

	for (const droid of enumDroid(scavengerPlayer))
	{
		if (droid.order !== DORDER_ATTACK)
		{
			const target = targets[Math.floor(syncRandom(targets.length))];
			orderDroidObj(droid, DORDER_ATTACK, target);
		}
	}
}

function getNewTargets()
{
	targets = [];
	for (let player = 0; player < maxPlayers; player++)
	{
		if (player === scavengerPlayer)
		{
			continue;
		}
		targets = targets.concat(enumStruct(player, HQ));
	}
}
