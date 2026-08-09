# Ultimate Defense
- Protect your command center!
- Pick a **Wave Defense** AI in the lobby - it sends the waves
- Its lobby difficulty sets how big they are (Easy 0.7x to Insane 2x like normal AI difficulty)
- Rounds are generated
- Works on any map, with any number of players and other AIs

A fork of [WZmodTowerDefense](https://github.com/aco4/WZmodTowerDefense).

## Wave Defense AIs
Pick one per slot. You can use several at once and different types - they ally with each other and
with the map's scavengers automatically.

| AI | Waves arrive |
| --- | --- |
| **Base** | Around that slot's start position |
| **Surround** | From every edge of the map |
| **Random** | From one random edge, re-rolled each round |
| **Center** | From the middle of the map |

![Waves Settings](https://raw.githubusercontent.com/Thanatozz/WZmodUltimateDefense/ultimate-defense/waves.png)

**Meteor** drops a whole round on one spot, with a beacon warning. Off by
default; rename `multiplay/skirmish/WaveDefenseMeteor.json.disabled` to `.json`.

## Rounds
Each round has a power budget and a tier window, and its units are drawn at run
time from 213 designs classified by cost, weight, chassis and weapon family.

- Tiers rise with the round, floor included, so late rounds cannot field junk
- Split by weight: 50% light, 35% medium, 15% heavy
- **Boss rounds** every 5th round
- **One-weapon rounds** and **swarms** happen on a chance

Losing your command center puts you out, and it cannot be rebuilt - but not
until the first wave, so you can build one or move it. Walls and defences built
on a spawn point of waves for base and center waves are refunded and removed, and the waves avoid tiles that
defenders are parked on.

## Download
1. Start Warzone 2100. Click **Options**
2. Click "Open Configuration Directory"
4. Download the latest release `.wz`. Put in `📁mods/<version>/multiplay/` or `📁mods/<version>/autoload/`
5. (for multiplay install) Launch with `--mod_mp=WZmodUltimateDefense.wz`

## Configuration
Edit `📄config.js`. To make the whole game harder or easier, change one line:

```js
budget: round => Math.round(350 * Math.pow(1.24, round - 1)),
```

Raise `350` for a harder start, raise `1.24` for a steeper climb. The rest of
`generateWaves()` sets the tier curve, the weight split, and how often boss,
one-weapon and swarm rounds come up.

Tips:
- `setBudgetVariance(0.15)` controls how much a round may drift from its budget
- `setSpawnRate(5)` and `setSpawnRadius(8)` control how fast and how wide units arrive
- `setNoBuildRadius(5)` and `setCampRadius(4)` control the anti-camping rules
- Read `multiplay/script/mods/configAPI.js` for the full list of settings

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
