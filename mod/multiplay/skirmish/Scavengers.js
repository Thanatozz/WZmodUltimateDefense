var targets = [];

function eventStartLevel()
{
	getNewTargets();
	setTimer("updateOrders", 1000);
}

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

	for (const droid of enumDroid(me))
	{
		if (droid.order !== DORDER_ATTACK)
		{
			const target = targets[Math.floor(Math.random() * targets.length)];
			orderDroidObj(droid, DORDER_ATTACK, target);
		}
	}
}

function getNewTargets()
{
	targets = [];
	for (let player = 0; player < maxPlayers; player++)
	{
		if (player === me)
		{
			continue;
		}
		targets = targets.concat(enumStruct(player, HQ));
	}
}
