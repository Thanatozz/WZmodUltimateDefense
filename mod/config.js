//
// Ultimate Defense - everything you can change is in this file.
//
// Rounds are generated, not written out one by one. Each round gets a power
// budget and a tier window, and the designs are picked at run time out of
// catalogue.js - every armed, non-VTOL unit the game ships, classified by cost,
// weight, chassis and weapon family.
//
// Every setting below is shown at its default, so deleting a line changes
// nothing. multiplay/script/mods/configAPI.js documents each one in full.
//


////////////////////////////////////////////////////////////////////////////////
// THE WAVES
////////////////////////////////////////////////////////////////////////////////

generateWaves({
	rounds: 30,

	// Power to spend on each round. This is the difficulty dial: raise 350 for a
	// harder start, raise 1.24 for a steeper climb.
	budget: round => Math.round(350 * Math.pow(1.24, round - 1)),

	// Seconds of build time before each round. Every tenth round is a breather.
	waitTime: round => round % 10 === 0 ? 240 : (round <= 3 ? 180 : 150),

	// Top tier a round may reach, 0 (scavengers) to 5 (Dragons). The floor rises
	// with it, which is what stops a late round buying machinegun Vipers.
	tier: round => Math.min(TOP_TIER, Math.floor((round - 1) / 5)),

	// How far below the top tier a round still reaches. 1 keeps the previous
	// generation around as chaff; 0 makes each tier a hard cut.
	tierSpread: 1,

	// How a round's budget splits by weight class. Without this the budget always
	// chases the cheapest design and round one becomes 150 identical scavengers.
	// Weight is comparable across scavengers, cyborgs and tanks, so round 1 comes
	// out as people and trikes, buggies and jeeps, buses and fire engines - and
	// round 25 reads the same way in Vengeances and Dragons.
	composition: { light: 0.50, medium: 0.35, heavy: 0.15 },

	// Odds a round arrives as one weapon family only - a flamer wave, a cannon
	// wave - so it can be countered on purpose. A chance rather than a fixed
	// interval, so no two games agree on which rounds those are.
	special: { chance: 0.25 },

	// Odds of a swarm: the tier below in far greater numbers. It needs no extra
	// budget, since a tier down costs roughly half.
	swarm: { chance: 0.20, tierShift: 1 },

	// Boss rounds. A boss is a chassis, not a price: cost ranges overlap far too
	// much to say "Tiger at 15, Wyvern at 25" with a number.
	//
	// count falls as the game goes on. One Viper at round 5 dies to a guard tower
	// and decides nothing, while three Dragons at round 30 are plenty.
	boss: {
		every: 5,
		count: round => 12 - round / 3,
		chassis: [
			{ untilRound:  5, bodies: ["Viper"] },
			{ untilRound: 10, bodies: ["Python"] },
			{ untilRound: 15, bodies: ["Tiger", "Leopard"] },
			{ untilRound: 20, bodies: ["Vengeance"] },
			{ untilRound: 25, bodies: ["Wyvern"] },
			{ untilRound: 99, bodies: ["Dragon"] },
		],
	},
})

// How far a round may drift from its stated budget, as a fraction.
setBudgetVariance(0.15)

// With several Wave Defense slots: false means each one sends the whole round,
// true means they divide it between them. Either way each slot's own lobby
// difficulty still scales its share.
setWaveSplit(false)

// What the lobby difficulties are worth. Same shape the base game uses for AI
// power. Each wave slot uses its own, so an Easy bot and an Insane one in the
// same game each send their own amount.
setDifficultyScale(0.7, 1.0, 1.5, 2.0)


////////////////////////////////////////////////////////////////////////////////
// HOW UNITS ARRIVE
////////////////////////////////////////////////////////////////////////////////

// Units released per tick. One at a time let defenders pick a round apart as it
// appeared rather than face a wave.
setSpawnRate(5)

// How wide the Base and Center spawn areas are, in tiles. A wide area matters as
// much as a fast rate: units all appearing on the same few tiles are killed as
// they arrive however quickly they come.
setSpawnRadius(8)

// Meteor mode only - off unless you enable that AI. In order: how far a meteor
// must land from every HQ, how many units it drops per tick, and how long its
// beacon shows before the horde arrives.
setMeteorDistance(20)
setMeteorBurst(25)
setMeteorWarning(10)


////////////////////////////////////////////////////////////////////////////////
// ANTI-CAMPING
////////////////////////////////////////////////////////////////////////////////

// How close to a spawn point a defender may put walls, gates and defences, in
// tiles. Anything built inside is refunded and removed. 0 disables the rule.
//
// Note what this means per mode: with Base it is a bubble around the enemy
// start, but with Surround it is a ring around the entire edge of the map.
setNoBuildRadius(5)

// How close a defender's units have to be for a spawn tile to count as camped,
// and how many tiles to try before coming in anyway. Nothing is destroyed and
// nobody is warned: parking an army on the spawn point simply stops working.
setCampRadius(4)
setCampTries(6)


////////////////////////////////////////////////////////////////////////////////
// THE COMMAND CENTER
////////////////////////////////////////////////////////////////////////////////

// Until which round a player may be without a Command Center. The grace period
// is what lets you start with nothing and build one, or move an existing one.
// 0 removes it: no HQ, no game, from the first tick.
setHQGraceUntilRound(1)

// Whether an AI that reaches the end of the grace period without one is given a
// Command Center rather than knocked out. It had no way to know it was on a
// clock, unlike a human, who was told in the console.
setGrantHQToAI(true)

// Whether an AI defender that loses its Command Center is cleared off the map.
// Without this the rule only really applies to humans: an AI keeps its whole
// base and army after its HQ goes down, because nothing removes it.
setEliminateOnHQLoss(true)

// A dying Command Center clears the ground of units within this radius - and it
// takes everyone's, so the wave that broke through dies in the blast too.
// Without that a horde rolls into the next base at full strength and a team
// falls like dominoes. 0 disables it.
setHQBlastRadius(6)

// Milliseconds between the rings of that blast. It travels outwards a tile at a
// time, so this is how fast the shockwave moves.
setHQBlastStep(150)

// A weapon fired along each ring, purely for the look of it - without one the
// blast is only visible where it catches units, since what you see is those
// units blowing up.
//
// Off by default because it is a real weapon doing real damage to whatever is
// still standing nearby, a neighbour's buildings included.
//
//   setHQBlastWeapon("Mortar3ROTARYMk1")
setHQBlastWeapon("Mortar3ROTARYMk1")


////////////////////////////////////////////////////////////////////////////////
// REWARDS
////////////////////////////////////////////////////////////////////////////////

// Whether a dead boss leaves a crate holding one of its own components, which
// becomes buildable for whoever picks it up. One crate per round.
setBossCrates(true)

// How much power destroying a wave unit pays, from its cost. The default curve
// depends on the lobby power setting and its exponent is below 1, so early junk
// funds you and late heavies barely do - that is the real difficulty curve.
//
//   setPowerRewardFunction(cost => cost * 0.5)   // flat half the cost instead
//
// Left unset to keep the default.


////////////////////////////////////////////////////////////////////////////////
// THE HORDE'S TECHNOLOGY
////////////////////////////////////////////////////////////////////////////////

// Seconds to hold the horde's research behind the schedule it would otherwise
// follow. It gets its upgrades by the clock, not from laboratories, so this
// decides how far ahead of you its units are.
setResearchDelay(360)
