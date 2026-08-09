class Template
{
	// Costs never change during a game, and a budgeted round asks for them a lot.
	static costCache = {};

	/**
	 * @param {string} body - component name
	 * @param {string} propulsion - component name
	 * @param {string[]} turrets - array of component names
	 * @returns {object}
	 */
	static from(body, propulsion, turrets)
	{
		return { body, propulsion, turrets };
	}

	static spawn(template, player, x, y)
	{
		hackNetOff();
		const droid = addDroid(
			player, x, y,
			Template.toString(template),
			Stats.Body[template.body].Id,
			Stats.Propulsion[template.propulsion].Id,
			"", "",
			...template.turrets.map(turret => Template.getTurret(turret)?.Id)
		);
		hackNetOn();
		return droid;
	}

	static toString(template)
	{
		return template.turrets.join(" ") + " " + template.body + " " + template.propulsion;
	}

	/**
	 * What a template costs to build, without building it.
	 *
	 * Mirrors calcPower() in the game's src/droid.cpp: turret costs are added up,
	 * but the propulsion is a percentage on top of the body rather than a flat
	 * addition - wheels are +25%, tracks +125%.
	 *
	 * makeTemplate() would also give a cost, but it returns null for anything the
	 * player cannot build yet, which is useless for budgeting future rounds.
	 *
	 * @param {object} template
	 * @returns {number} power
	 */
	static cost(template)
	{
		const key = Template.toString(template);
		if (Template.costCache[key] !== undefined)
		{
			return Template.costCache[key];
		}

		const body = Template.buildPower(Stats.Body[template.body]);
		const propulsion = Template.buildPower(Stats.Propulsion[template.propulsion]);

		let cost = Math.floor(body * (100 + propulsion) / 100);
		for (const turret of template.turrets)
		{
			cost += Template.buildPower(Template.getTurret(turret));
		}

		Template.costCache[key] = cost;
		return cost;
	}

	/**
	 * The Stats object capitalises the field names from stats/*.json, but not
	 * every component lists a cost - treat a missing one as free.
	 */
	static buildPower(stat)
	{
		if (!stat)
		{
			return 0;
		}
		return (stat.BuildPower !== undefined ? stat.BuildPower : stat.buildPower) || 0;
	}

	static getTurret(name)
	{
		return Stats.Weapon[name]
			|| Stats.Construct[name]
			|| Stats.Repair[name]
			|| Stats.Sensor[name]
			|| Stats.ECM[name]
			|| null;
	}

	/**
	 * @param {string} str - space-separated string in order: turrets, body, propulsion
	 * @returns {object|null} template or null if invalid
	 */
	static fromString(str)
	{
		const words = str.split(" ");

		// Try all ways to partition the end into body + propulsion
		for (let bodyStart = 1; bodyStart < words.length; bodyStart++) {
			for (let propStart = bodyStart + 1; propStart <= words.length; propStart++) {
				const body = words.slice(bodyStart, propStart).join(" ");
				const propulsion = words.slice(propStart).join(" ");

				if (Stats.Body.hasOwnProperty(body) &&
					Stats.Propulsion.hasOwnProperty(propulsion))
				{
					const weaponSlots = Stats.Body[body].WeaponSlots;
					const turretWords = words.slice(0, bodyStart);

					const turrets = partitionIntoTurrets(turretWords, weaponSlots);

					if (turrets !== null) {
						return Template.from(body, propulsion, turrets);
					}
				}
			}
		}

		return null;

		function partitionIntoTurrets(words, maxTurrets)
		{
			if (words.length === 0)
			{
				return [];
			}
			if (maxTurrets === 0)
			{
				return null; // Still have words but no slots left
			}
			// Try using all remaining words as a single turret
			const turret = words.join(" ");
			if (Stats.Weapon.hasOwnProperty(turret))
			{
				return [turret];
			}
			// Try each possible length for the first turret
			for (let i = 1; i < words.length; i++)
			{
				const firstTurret = words.slice(0, i).join(" ");
				if (Stats.Weapon.hasOwnProperty(firstTurret))
				{
					const rest = partitionIntoTurrets(words.slice(i), maxTurrets - 1);
					if (rest !== null)
					{
						return [firstTurret, ...rest];
					}
				}
			}
			return null;
		}
	}
}
