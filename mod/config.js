//
// Ultimate Defense - everything you can change is in this file.
//
// Rounds are generated, not written out one by one. Each round gets a power
// budget and a tier window, and the designs are picked at run time out of
// catalogue.js - every armed, non-VTOL unit the game ships, classified by cost,
// weight, chassis and weapon family.
//
// The block below is plain data, and a preset in presets/ has exactly the same
// shape. That is what lets the host play a preset the other players do not have:
// the two are compared and only the differences are sent to everybody, as plain
// numbers over the game's own synchronised channel. A preset identical to this
// one sends nothing.
//
// multiplay/script/mods/configAPI.js documents each setting in full.
//

applySettings({

	////////////////////////////////////////////////////////////////////////////
	// THE ROUNDS
	////////////////////////////////////////////////////////////////////////////

	waves: {
		rounds: 30,

		// The difficulty dial. Each round is worth budgetStart * growth^(n-1),
		// so raise the first for a harder start and the second for a steeper
		// climb.
		budgetStart: 350,
		budgetGrowth: 1.24,

		// Seconds of build time between rounds. Round 1 is not from here - it
		// comes from startTimes below, which reads the lobby's base setting.
		waitNormal: 150,
		waitBreather: 240,
		breatherEvery: 10,

		// A tier every this many rounds, 0 (scavengers) to 5 (Dragons). The
		// floor rises with the top, which is what stops a late round buying
		// machinegun Vipers.
		roundsPerTier: 5,

		// How far below the top tier a round still reaches. 1 keeps the previous
		// generation around as chaff; 0 makes each tier a hard cut.
		tierSpread: 1,

		// How a round's budget splits by weight class. Without this the budget
		// always chases the cheapest design and round one becomes 150 identical
		// scavengers. Weight is comparable across scavengers, cyborgs and tanks,
		// so round 1 comes out as people and trikes, buggies and jeeps, buses
		// and fire engines - and round 25 reads the same way in Dragons.
		composition: { light: 0.50, medium: 0.35, heavy: 0.15 },

		// Odds a round arrives as one weapon family only - a flamer wave, a
		// cannon wave - so it can be countered on purpose. A chance rather than
		// a fixed interval, so no two games agree on which rounds those are.
		special: { chance: 0.25 },

		// Odds of a swarm: the tier below in far greater numbers. It needs no
		// extra budget, since a tier down costs roughly half.
		swarm: { chance: 0.20, tierShift: 1 },

		// Boss rounds. A boss is a chassis, not a price: cost ranges overlap far
		// too much to say "Tiger at 15, Wyvern at 25" with a number.
		//
		// The count falls as the game goes on - countStart minus the round over
		// countDecline. One Viper at round 5 dies to a guard tower and decides
		// nothing, while three Dragons at round 30 are plenty.
		boss: {
			every: 5,
			countStart: 12,
			countDecline: 3,
			chassis: [
				{ untilRound:  5, bodies: ["Viper"] },
				{ untilRound: 10, bodies: ["Python"] },
				{ untilRound: 15, bodies: ["Tiger", "Leopard"] },
				{ untilRound: 20, bodies: ["Vengeance"] },
				{ untilRound: 25, bodies: ["Wyvern"] },
				{ untilRound: 99, bodies: ["Dragon"] },
			],
		},
	},

	// How far a round may drift from its stated budget, as a fraction.
	budgetVariance: 0.15,

	// A multiplier on every round's budget, on top of everything above. Kept
	// apart from the waves block on purpose: that describes how rounds are
	// built, this scales what they are worth.
	waveScale: 1.0,

	// With several Wave Defense slots: false means each sends the whole round,
	// true means they divide it. Either way each slot's own lobby difficulty
	// still scales its share.
	waveSplit: false,

	// What the lobby difficulties are worth. Same shape the base game uses for
	// AI power. Each wave slot uses its own, so an Easy bot and an Insane one in
	// the same game each send their own amount.
	difficultyScale: { easy: 0.7, medium: 1.0, hard: 1.5, insane: 2.0 },


	////////////////////////////////////////////////////////////////////////////
	// TIME BEFORE THE FIRST WAVE
	////////////////////////////////////////////////////////////////////////////

	// Seconds, by the lobby's base setting. How long you need depends on what
	// you were given: starting with nothing means a truck, a derrick, a
	// generator and a factory before the first tower even begins, which on a
	// small map is not something two minutes buys.
	startTimes: { clean: 360, base: 240, advanced: 120 },

	// Extra seconds from the wave slots' difficulty. A harder setting sends a
	// bigger first wave, so it also buys more time to meet it. With several wave
	// slots the hardest one decides.
	difficultyTimeBonus: { easy: 0, medium: 0, hard: 30, insane: 60 },


	////////////////////////////////////////////////////////////////////////////
	// HOW UNITS ARRIVE
	////////////////////////////////////////////////////////////////////////////

	// Units released per tick. One at a time let defenders pick a round apart as
	// it appeared rather than face a wave.
	spawnRate: 5,

	// How wide the Base and Center spawn areas are, in tiles. A wide area
	// matters as much as a fast rate: units all appearing on the same few tiles
	// are killed as they arrive however quickly they come.
	spawnRadius: 8,

	// Whether the Drop Pod mode is allowed. Its entry always shows in the lobby
	// - Warzone builds that list from files before any script runs - but with
	// this off a slot picked as Drop Pod plays as Base instead.
	dropPods: false,
	dropPodDistance: 20,
	dropPodBurst: 25,
	dropPodWarning: 10,

	// VTOL factories locked to zero. This applies to the defenders too, not just
	// the horde - it is a ground game by design. Turning it off lets people
	// build VTOLs, but the waves still cannot: flying designs are filtered out
	// of the catalogue when it is generated.
	vtolsDisabled: true,


	////////////////////////////////////////////////////////////////////////////
	// ANTI-CAMPING
	////////////////////////////////////////////////////////////////////////////

	// How close to a spawn point a defender may put walls, gates and defences,
	// in tiles. Anything built inside is refunded and removed. 0 disables it.
	//
	// Note what this means per mode: with Base it is a bubble around the enemy
	// start, but with Surround it is a ring around the entire edge of the map.
	noBuildRadius: 5,

	// How close a defender's units have to be for a spawn tile to count as
	// camped, and how many tiles to try before coming in anyway. Nothing is
	// destroyed and nobody is warned: parking an army there stops working.
	campRadius: 4,
	campTries: 6,


	////////////////////////////////////////////////////////////////////////////
	// THE COMMAND CENTER
	////////////////////////////////////////////////////////////////////////////

	// Until which round a player may be without one. The grace period is what
	// lets you start with nothing and build one, or move an existing one.
	// 0 removes it: no HQ, no game, from the first tick.
	hqGraceUntilRound: 1,

	// Whether an AI that reaches the end of the grace period without one is
	// given a Command Center rather than knocked out. It had no way to know it
	// was on a clock, unlike a human, who was told in the console.
	grantHQToAI: true,

	// Whether an AI defender that loses its Command Center is cleared off the
	// map. Without this the rule only really applies to humans: an AI keeps its
	// whole base and army after its HQ goes down, because nothing removes it.
	eliminateOnHQLoss: true,

	// A dying Command Center clears units within this radius - everyone's, so
	// the wave that broke through dies in the blast too. Without that a horde
	// rolls into the next base at full strength and a team falls like dominoes.
	// The blast travels outwards a tile at a time, hqBlastStep apart.
	hqBlastRadius: 6,
	hqBlastStep: 150,

	// A weapon fired along each ring, purely for the look of it - without one
	// the blast is only visible where it catches units, since what you see is
	// those units blowing up. It is a real weapon doing real damage to whatever
	// is still standing nearby, a neighbour's buildings included.
	hqBlastWeapon: null,


	////////////////////////////////////////////////////////////////////////////
	// REWARDS AND TECHNOLOGY
	////////////////////////////////////////////////////////////////////////////

	// Whether a dead boss leaves a crate holding one of its own components,
	// which becomes buildable for whoever picks it up. One crate per round.
	bossCrates: true,

	// Seconds to hold the horde's research behind the schedule it would
	// otherwise follow. It gets its upgrades by the clock, not from
	// laboratories, so this decides how far ahead of you its units are.
	researchDelay: 360,
})


////////////////////////////////////////////////////////////////////////////////
// SETTINGS THAT DO NOT TRAVEL
////////////////////////////////////////////////////////////////////////////////

// These decide how settings are exchanged in the first place, or take effect
// before anything could be sent, so they are set here and here only.

// Whether player 1 may load a preset and adjust settings in chat:
//
//   !ud play blitz       load a preset and send what it changes to everyone
//   !ud load <code>      apply a configuration somebody exported
//   !ud export           print the current settings as a code to share
//   !ud scale 1.5        every round 50% bigger
//   !ud crates off       no boss salvage
//   !ud droppods on      allow the Drop Pod mode
//   !ud probe sync       check the settings channel reaches everybody
//
// Chat is where the command is typed and nothing more. The settings themselves
// travel over syncRequest, the game's own synchronised channel, which reaches
// every client and is applied on the same tick by all of them - chat is not, and
// a joining client never receives it in a script at all.
//
// Only the host's machine ever reads a preset file, which is the point: you can
// write your own and play it with people who have only the published mod. The
// code from "!ud export" is for people rather than the network - paste it to a
// friend and they can play your configuration without installing anything.
//
// Only the first slot is listened to - a script is never told which client is
// the host - and every change is announced, so nobody has to guess what they
// are playing under.
setChatCommands(true)

// How long those commands are accepted for, in seconds. The round reader is held
// back for exactly this long - so a preset can rebuild the round list before
// anything has read it - and the countdown is shown on screen so the host can
// see how long is left to choose one.
setConfigWindow(60)

// Whether player 1's client also reads /ultimatedefense.json - a file in the
// Warzone configuration directory, outside the mod - to pick a preset and a few
// overrides without typing them.
//
// Off by default, and only because a missing file prints an error on screen that
// cannot be suppressed. Turn it on if you keep one.
//
//   { "preset": "blitz", "waveScale": 1.5 }
setExternalSettings(false)

// How much power destroying a wave unit pays, from its cost. The default curve
// depends on the lobby power setting and its exponent is below 1, so early junk
// funds you and late heavies barely do - that is the real difficulty curve.
//
//   setPowerRewardFunction(cost => cost * 0.5)   // flat half the cost instead
