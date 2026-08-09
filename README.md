# Ultimate Defense

Hold your Command Center against thirty rounds of an enemy that gets better
every time. A fork of [WZmodTowerDefense](https://github.com/aco4/WZmodTowerDefense)
that rebuilds the wave system: rounds are generated rather than scripted, the
attacker is a proper AI you pick in the lobby, and the whole thing works in a
game with other AIs and other players.

- Lose your Command Center and you are out. It cannot be rebuilt.
- Killing a wave unit pays you power. The Low/Medium/High power setting decides
  how much.
- VTOL factories are disabled.
- Works on any map, with any number of players.

## Picking the enemy

The attacker is an AI you put in a slot, like any other. Which one you pick
decides where its units come from:

| AI | Where the waves arrive |
| --- | --- |
| **Wave Defense - Base** | Around that slot's own start position |
| **Wave Defense - Surround** | From every edge of the map |
| **Wave Defense - Random** | From one random edge, re-rolled each round |
| **Wave Defense - Center** | From the middle of the map |

A fifth mode, **Meteor**, drops the whole round on one random spot away from the
defenders, with a beacon warning first. It is off by default because a bad
landing is brutally unfair - rename
`multiplay/skirmish/WaveDefenseMeteor.json.disabled` to `.json` to try it.

The **difficulty you set on that slot** scales its waves: Easy 0.7x, Medium 1x,
Hard 1.5x, Insane 2x - the same numbers the base game uses for AI power.

You can field **several wave slots at once**, in different modes and at
different difficulties. They are allied with each other and with the map's
scavengers automatically, take the colour of the first one, and each sends waves
scaled by its own difficulty.

Everyone else - humans and ordinary AIs alike - defends.

## How a round is built

Nothing is written out unit by unit. Each round gets a power budget and a tier
window, and the units are picked at run time from a catalogue of **213 designs**
generated from the game's own data, each tagged with cost, weight, chassis,
weapon family and tier.

- **Tiers rise with the round**, floor included, so a late round physically
  cannot spend its budget on machinegun Vipers however cheap they are.
- **Rounds are composed by weight**: 50% light, 35% medium, 15% heavy by default.
  Round one arrives as people and trikes, buggies and jeeps, buses and fire
  engines; round twenty-five reads the same way in Vengeances and Dragons.
- **Boss rounds** every fifth round bring veterans of a chassis that climbs with
  the game - Viper, Python, Tiger, Vengeance, Wyvern, Dragon - many early, few
  late.
- **One-weapon rounds** happen on a chance, not a schedule: an all-flamer wave,
  an all-cannon wave, announced so you can counter it.
- **Swarms** happen on a chance too: the previous tier of hardware in roughly
  double the numbers.

Two games never field the same horde.

## Fair play rules

- **Grace period.** Nobody is out for lacking a Command Center until the first
  wave, so you can build one, or demolish yours and move it. An AI that has not
  built one by then is given one rather than knocked out - it had no way to know
  it was on a clock.
- **No building on spawn points.** Walls, gates and defences put up within 5
  tiles of a spawn point are refunded and removed. Ringing a spawn with towers
  turns the game into a shooting gallery.
- **Camping with units does not work either.** The horde picks a different tile
  when defenders are parked on one. Nothing is destroyed and nobody is warned;
  it simply stops paying off.

## Install

1. Start Warzone 2100, click **Options**, then **Open Configuration Directory**
2. Download [`📦4p-td1_v3.wz`](https://maps.wz2100.net/#/map/4p/td1_v3/) and put
   it in `📁maps/`
3. Download the latest release `.wz` and put it in `📁mods/<version>/multiplay/`
4. Launch the game with `--mod_mp=WZmodUltimateDefense.wz`

The mod goes in `multiplay/`, not `autoload/`, so ordinary games are untouched -
make a shortcut with that argument and use it only when you want to play Tower
Defense. Warzone 4.7 has no in-game mod menu, and `--mod_mp` will not accept a
plain folder, so it has to be the archive.

## Recommended game settings

![Recommended Settings](https://raw.githubusercontent.com/aco4/WZmodTowerDefense/master/recommended_settings.png)

## Configuration

Everything lives in `📄config.js`. To make the whole game harder or easier,
change one line:

```js
budget: round => Math.round(350 * Math.pow(1.24, round - 1)),
```

Raise `350` for a harder start, raise `1.24` for a steeper climb.

The rest of `generateWaves()` sets the tier curve, the weight split, and how
often boss, one-weapon and swarm rounds come up. Standalone settings worth
knowing:

| Setting | Does |
| --- | --- |
| `setBudgetVariance(0.15)` | how far a round may drift from its budget |
| `setSpawnRate(5)` | units released per tick |
| `setSpawnRadius(8)` | how wide the Base and Center spawn areas are |
| `setNoBuildRadius(5)` | no-build zone around spawn points, 0 to disable |
| `setCampRadius(4)` | how close units have to be to count as camping |
| `setWaveSplit(false)` | whether several wave slots split a round or each send it |
| `setHQGraceUntilRound(1)` | how long you have to build a Command Center |
| `setDifficultyScale(...)` | what the lobby difficulties are worth |

`multiplay/script/mods/configAPI.js` documents all of them.

## Builds

`overlays/` holds alternate balances, each built as its own `.wz`:

- **Classic** - the original hand-written 30 rounds
- **EMAG** - 60-round balance for 4 players
- **Slow10x** - long rounds, ten times the units

## Development

`mod/` is the mod. Package it into a loadable `.wz` with:

```powershell
.\pack.ps1              # the base mod
.\pack.ps1 -Overlay Classic
.\pack.ps1 -Run         # package and launch
```

`tools/generate-catalogue.py` rebuilds `catalogue.js` from `base.wz` and
`mp.wz`. Re-run it when Warzone updates. Every design it emits is checked
against the same parser the mod uses, so a design that would not resolve in game
is dropped there rather than silently spawning nothing.

## License

SPDX-License-Identifier: GPL-2.0-or-later

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License along
with this program; if not, see https://www.gnu.org/licenses/.
