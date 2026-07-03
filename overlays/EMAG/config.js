people = [
    "*BaBa MG* *BaBa Body* BaBaLegs",
]
scavs = [
    "*BusCannon* *School Bus Body* BaBaProp",
    "*Flamer* *School Bus Body* BaBaProp",
    "*BusCannon* *Fire Engine Body* BaBaProp",
    "*Flamer* *Fire Engine Body* BaBaProp",
    "*Jeep MG* *Jeep Body* BaBaProp",
    "*BabaRocket* *Rocket Jeep Body* BaBaProp",
    "*Buggy MG* *Buggy Body* BaBaProp",
    "*BabaRocket* *Rocket Buggy Body* BaBaProp",
    "*Trike MG* *Trike Body* BaBaProp",
]
wheels = [
    "Machinegun Viper Wheels",
    "Flamer Viper Wheels",
    "Light Cannon Viper Wheels",
]
vipers = [
    "Flamer Viper Half-tracks",
    "Twin Machinegun Viper Half-tracks",
    "Light Cannon Viper Half-tracks",
    "Mini-Rocket Pod Viper Half-tracks",
]
cobras = [
    "Heavy Machinegun Cobra Half-tracks",
    "Light Cannon Cobra Half-tracks",
    "Mini-Rocket Pod Cobra Half-tracks",
    "Medium Cannon Cobra Wheels",
]
mra = [
    "Mini-Rocket Array Scorpion Wheels",
    "Mini-Rocket Array Cobra Wheels",
]
bugs = [
    "Flamer Bug Hover",
    "Light Cannon Bug Hover",
]
scorps = [
    "Inferno Scorpion Hover",
    "Medium Cannon Scorpion Hover",
]
mantis = [
    "Plasmite Flamer Mantis Hover",
    "Heavy Cannon Mantis Hover",
]
pythons = [
    "Mini-Rocket Pod Python Half-tracks",
    "Medium Cannon Python Half-tracks",
    "Lancer Python Half-tracks",
    "Assault Gun Python Half-tracks",
    "Inferno Python Half-tracks",
]
panthers = [
    "Lancer Panther Half-tracks",
    "Assault Gun Panther Half-tracks",
    "Inferno Panther Half-tracks",
    "Assault Cannon Panther Half-tracks",
    "Tank Killer Panther Half-tracks",
]
hra = [
    "Heavy Rocket Array Panther Wheels",
]
tigers = [
    "Needle Gun Tiger Half-tracks",
    "Flashlight Tiger Half-tracks",
    "Scourge Missile Tiger Half-tracks",
]
nexus = [
    "Pulse Laser Retribution Half-tracks",
    "Rail Gun Retribution Half-tracks",
    "Scourge Missile Retribution Half-tracks",
]
seraph = [
    "Seraph Missile Array Retaliation Wheels",
    "Seraph Missile Array Retribution Wheels",
]
cybsT0 = [
    "Machinegunner Cyborg Light Body Cyborg Propulsion",
    "Cyborg Flamer Cyborg Light Body Cyborg Propulsion",
    "Heavy Gunner Cyborg Light Body Cyborg Propulsion",
]
cybsT1 = [
    "Cyborg Lancer Cyborg Light Body Cyborg Propulsion",
    "*Cyborg Thermite Weapon* Cyborg Light Body Cyborg Propulsion",
    "*CyborgRotMG* Cyborg Light Body Cyborg Propulsion",
]
cybsT2 = [
    "Super Heavy-Gunner Cyborg Heavy Body Cyborg Propulsion",
    "Super HVC Cyborg Cyborg Heavy Body Cyborg Propulsion",
    "Super Auto-Cannon Cyborg Cyborg Heavy Body Cyborg Propulsion",
    "Super Tank-Killer Cyborg Cyborg Heavy Body Cyborg Propulsion",
]
cybsT3 = [
    "*Cyb-Wpn-Rail1* Cyborg Light Body Cyborg Propulsion",
    "*Cyb-Wpn-Laser* Cyborg Light Body Cyborg Propulsion",
    "*Cyb-Wpn-Atmiss* Cyborg Light Body Cyborg Propulsion",
]
cybsT4 = [
    "Super Scourge Cyborg Cyborg Heavy Body Cyborg Propulsion",
    "Super Pulse Laser Cyborg Cyborg Heavy Body Cyborg Propulsion",
    "Super Rail-Gunner Cyborg Heavy Body Cyborg Propulsion",
]
vengeanceH = [
    "Hyper Velocity Cannon Vengeance Hover",
]
vengeanceT = [
    "Hyper Velocity Cannon Vengeance Tracks",
]
wyvernH = [
    "Twin Assault Cannon Wyvern Hover",
]
wyvernT = [
    "Twin Assault Cannon Wyvern Tracks",
]
dragonH = [
    "Seraph Missile Array Seraph Missile Array Dragon Hover",
    "Gauss Cannon Gauss Cannon Dragon Hover",
]
dragonT = [
    "Seraph Missile Array Seraph Missile Array Dragon Tracks",
    "Gauss Cannon Gauss Cannon Dragon Tracks",
]

setResearchDelay(360)

wait(240), round(1), spawn(2*15,bugs), spawn(2*8,cobras), spawn(2*2,mra), spawn(2*25,wheels), spawn(2*10,vipers)
wait(25), round(2), spawn(2*15,bugs), spawn(2*8,cobras), spawn(2*2,mra), spawn(2*25,wheels), spawn(2*10,vipers)
wait(25), round(3), spawn(2*15,bugs), spawn(2*20,cobras), spawn(2*5,mra), spawn(2*25,wheels), spawn(2*10,vipers)
wait(50), round(4), spawn(2*15,bugs), spawn(2*8,cobras), spawn(2*2,mra), spawn(2*25,wheels), spawn(2*10,vipers)
wait(55), round(5), spawn(2*15,bugs), spawn(2*30,cobras), spawn(2*11,mra), spawn(2*25,wheels), spawn(2*10,vipers)
wait(60), round(6), spawn(2*15,bugs), spawn(2*8,cobras), spawn(2*2,mra), spawn(2*25,wheels), spawn(2*10,vipers)
wait(63), round(7), spawn(2*15,bugs), spawn(2*33,cobras), spawn(2*20,mra), spawn(2*25,wheels), spawn(2*10,vipers)
wait(65), round(8), spawn(2*15,bugs), spawn(2*33,cobras), spawn(2*50,mra), spawn(2*25,wheels), spawn(2*10,vipers)
wait(68), round(9), spawn(2*20,bugs), spawn(2*33,scavs), spawn(2*1,mra), spawn(2*15,cobras)
wait(90), round(10), spawn(2*12,cybsT0), spawn(2*6,mra), spawn(2*20,cobras), spawn(2*10,wheels), spawn(2*3,vengeanceH), spawn(2*3,vengeanceT)

wait(67), round(11), spawn(2*35,bugs), spawn(2*5,scorps), spawn(2*5,pythons), spawn(2*10,mra)
wait(67), round(12), spawn(2*10,cybsT1), spawn(2*15,pythons), spawn(2*12,mra), spawn(2*15,scorps)
wait(67), round(13), spawn(2*30,scorps), spawn(2*2,vengeanceT), spawn(2*25,pythons), spawn(2*15,bugs), spawn(2*6,mra), spawn(2*6,hra)
wait(67), round(14), spawn(2*30,pythons), spawn(2*10,panthers), spawn(2*30,cybsT1), spawn(2*8,hra)
wait(67), round(15), spawn(2*100,bugs), spawn(2*35,scorps), spawn(2*10,mantis), spawn(2*5,vengeanceH)
wait(67), round(16), spawn(2*3,vengeanceT), spawn(2*5,scorps), spawn(2*15,mantis), spawn(2*6,vengeanceH), spawn(2*12,hra), spawn(2*10,pythons), spawn(2*30,panthers)
wait(67), round(17), spawn(2*3,vengeanceT), spawn(2*15,cybsT2), spawn(2*20,mantis), spawn(2*40,panthers), spawn(2*10,hra)
wait(67), round(18), spawn(2*10,vengeanceH), spawn(2*25,mantis), spawn(2*60,panthers), spawn(2*16,hra)
wait(67), round(19), spawn(2*35,mantis), spawn(2*20,panthers), spawn(2*18,hra), spawn(2*45,cybsT2)
wait(67), round(20), spawn(2*25,mantis), spawn(2*30,wyvernH), spawn(2*15,wyvernT), spawn(2*4,vengeanceT), spawn(2*20,hra), spawn(2*20,panthers)

wait(67), round(21), spawn(2*6,vengeanceT), spawn(2*15,tigers), spawn(2*6,seraph), spawn(2*30,mantis)
wait(67), round(22), spawn(2*8,vengeanceH), spawn(2*45,mantis), spawn(2*25,tigers), spawn(2*8,seraph)
wait(67), round(23), spawn(2*20,cybsT3), spawn(2*15,mantis), spawn(2*5,wyvernH), spawn(2*5,wyvernT), spawn(2*10,vengeanceT), spawn(2*30,tigers)
wait(67), round(24), spawn(2*10,seraph), spawn(2*10,wyvernH), spawn(2*60,tigers), spawn(2*10,nexus)
wait(67), round(25), spawn(2*10,wyvernT), spawn(2*15,vengeanceT), spawn(2*25,nexus), spawn(2*20,tigers), spawn(2*60,cybsT3)
wait(67), round(26), spawn(2*12,seraph), spawn(2*20,wyvernH), spawn(2*45,nexus), spawn(2*25,tigers)
wait(67), round(27), spawn(2*15,vengeanceH), spawn(2*60,wyvernH), spawn(2*20,nexus), spawn(2*14,seraph)
wait(67), round(28), spawn(2*10,wyvernT), spawn(2*30,cybsT4), spawn(2*60,nexus), spawn(2*16,seraph)
wait(65), round(29), spawn(2*20,wyvernT), spawn(2*18,seraph), spawn(2*40,nexus)
wait(65), round(30), spawn(2*10,dragonH), spawn(2*15,dragonT), spawn(2*5,dragonH), spawn(2*90,cybsT4)

wait(65), round(31), spawn(2*20,dragonH), spawn(2*5,dragonT), spawn(2*80,cybsT4)
wait(65), round(32), spawn(2*22,dragonH), spawn(2*30,dragonT), spawn(2*70,cybsT4)
wait(65), round(33), spawn(2*23,dragonH), spawn(2*25,dragonT), spawn(2*60,cybsT4)
wait(65), round(34), spawn(2*12,dragonH), spawn(2*20,dragonT), spawn(2*50,cybsT4)
wait(65), round(35), spawn(2*25,dragonH), spawn(2*15,dragonT), spawn(2*40,cybsT4)
wait(65), round(36), spawn(2*33,dragonH), spawn(2*10,dragonT), spawn(2*30,cybsT4)
wait(65), round(37), spawn(2*32,dragonH), spawn(2*5,dragonT), spawn(2*20,cybsT4)
wait(65), round(38), spawn(2*26,dragonH), spawn(2*10,cybsT4)
wait(65), round(39), spawn(2*12,dragonH)
wait(65), round(40), spawn(2*22,dragonH)

wait(65), round(41), spawn(4*50,dragonH)
wait(65), round(42), spawn(4*60,dragonH)
wait(65), round(43), spawn(4*70,dragonH)
wait(65), round(44), spawn(4*80,dragonH)
wait(65), round(45), spawn(4*90,dragonH)
wait(65), round(46), spawn(4*100,dragonH)
wait(65), round(47), spawn(4*110,dragonH)
wait(65), round(48), spawn(4*120,dragonH)
wait(65), round(49), spawn(4*11,dragonH)
wait(65), round(50), spawn(4*11,dragonH)

wait(65), round(51), spawn(4*65,dragonH)
wait(65), round(52), spawn(4*67,dragonH)
wait(65), round(53), spawn(4*120,dragonH)
wait(65), round(54), spawn(4*120,dragonH)
wait(65), round(55), spawn(4*100,dragonH)
wait(65), round(56), spawn(4*50,dragonH)
wait(65), round(57), spawn(4*45,dragonH)
wait(65), round(58), spawn(4*67,dragonH)
wait(65), round(59), spawn(4*85,dragonH)
wait(65), round(60), spawn(4*200,dragonH)
