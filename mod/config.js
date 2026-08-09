//
// Wave Defense configuration.
//
// Rounds are generated, not written out one by one. Each round gets a power
// budget and a tier window, and the designs are picked at run time out of
// catalogue.js - every armed, non-VTOL unit the game ships, classified by cost,
// class, chassis and weapon family.
//
// The tier window is what makes the game escalate: its floor rises with the
// round, so a late round cannot spend its budget on machinegun Vipers however
// cheap they are.
//
// Read multiplay/script/mods/configAPI.js for everything that can be set here.
// The old hand-written 30 rounds are still available as the "Classic" overlay.
//

setResearchDelay(360)
setBudgetVariance(0.15)

generateWaves({
	rounds: 30,

	// Power to spend on each round.
	budget: round => Math.round(350 * Math.pow(1.24, round - 1)),

	// Seconds of build time before each round. Every tenth round is a breather.
	waitTime: round => round % 10 === 0 ? 240 : (round <= 3 ? 180 : 150),

	// Top tier a round may reach, 0 (scavengers) to 5 (Dragons).
	tier: round => Math.min(TOP_TIER, Math.floor((round - 1) / 5)),

	// How far below the top tier a round still reaches. 1 keeps the previous
	// generation around as chaff; 0 would make each tier a hard cut.
	tierSpread: 1,

	// How a normal round's budget is split by weight class. Without this the
	// budget always chases the cheapest design and a round becomes 150 identical
	// scavengers.
	//
	// Weight is the catalogue's own, comparable across scavengers, cyborgs and
	// tanks: round 1 comes out as people and trikes, buggies and jeeps, buses
	// and fire engines. Where a tier has no unit of a given weight - there is no
	// light Dragon - that share falls back to the matching third by price.
	composition: { light: 0.50, medium: 0.35, heavy: 0.15 },

	// Odds that a round turns out to be one weapon family only - a flamer wave,
	// a cannon wave - so it can be countered on purpose. A chance rather than a
	// fixed interval, so no two games agree on which rounds those are.
	special: { chance: 0.25 },

	// Odds of a swarm: the previous tier of hardware in far greater numbers.
	// It needs no extra budget - a tier down costs roughly half, so the same
	// power buys about twice as many by itself.
	swarm: { chance: 0.20, tierShift: 1 },

	// Every fifth round fields bosses at full veterancy, paid for out of the
	// round's own budget - whatever they leave goes to the escort.
	//
	// A boss is a chassis, not a price: cost ranges overlap far too much to say
	// "Tiger at 15, Wyvern at 25" with a number, since a Wyvern costs 343-593
	// and a Vengeance 380-600.
	//
	// count falls as the game goes on. One Viper at round 5 died to a guard
	// tower and decided nothing, while three Dragons at round 30 are plenty.
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
