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

wait(180), round(1), spawn(4*15,bugs), spawn(4*8,cobras), spawn(4*2,mra), spawn(4*25,wheels), spawn(4*10,vipers)
wait(25), round(2), spawn(4*15,bugs), spawn(4*8,cobras), spawn(4*2,mra), spawn(4*25,wheels), spawn(4*10,vipers)
wait(25), round(3), spawn(4*15,bugs), spawn(4*20,cobras), spawn(4*5,mra), spawn(4*25,wheels), spawn(4*10,vipers)
wait(50), round(4), spawn(4*15,bugs), spawn(4*8,cobras), spawn(4*2,mra), spawn(4*25,wheels), spawn(4*10,vipers)
wait(55), round(5), spawn(4*15,bugs), spawn(4*30,cobras), spawn(4*11,mra), spawn(4*25,wheels), spawn(4*10,vipers)
wait(60), round(6), spawn(4*15,bugs), spawn(4*8,cobras), spawn(4*2,mra), spawn(4*25,wheels), spawn(4*10,vipers)
wait(63), round(7), spawn(4*15,bugs), spawn(4*33,cobras), spawn(4*20,mra), spawn(4*25,wheels), spawn(4*10,vipers)
wait(65), round(8), spawn(4*15,bugs), spawn(4*33,cobras), spawn(4*50,mra), spawn(4*25,wheels), spawn(4*10,vipers)
wait(68), round(9), spawn(4*20,bugs), spawn(4*33,scavs), spawn(4*1,mra), spawn(4*15,cobras)
wait(90), round(10), spawn(4*12,cybsT0), spawn(4*6,mra), spawn(4*20,cobras), spawn(4*10,wheels), spawn(4*3,vengeanceH), spawn(4*3,vengeanceT)

wait(120), round(11), spawn(4*35,bugs), spawn(4*5,scorps), spawn(4*5,pythons), spawn(4*10,mra)
wait(120), round(12), spawn(4*10,cybsT1), spawn(4*15,pythons), spawn(4*12,mra), spawn(4*15,scorps)
wait(120), round(13), spawn(4*30,scorps), spawn(4*2,vengeanceT), spawn(4*25,pythons), spawn(4*15,bugs), spawn(4*6,mra), spawn(4*6,hra)
wait(120), round(14), spawn(4*30,pythons), spawn(4*10,panthers), spawn(4*30,cybsT1), spawn(4*8,hra)
wait(120), round(15), spawn(4*100,bugs), spawn(4*35,scorps), spawn(4*10,mantis), spawn(4*5,vengeanceH)
wait(120), round(16), spawn(4*3,vengeanceT), spawn(4*5,scorps), spawn(4*15,mantis), spawn(4*6,vengeanceH), spawn(4*12,hra), spawn(4*10,pythons), spawn(4*30,panthers)
wait(120), round(17), spawn(4*3,vengeanceT), spawn(4*15,cybsT2), spawn(4*20,mantis), spawn(4*40,panthers), spawn(4*10,hra)
wait(120), round(18), spawn(4*10,vengeanceH), spawn(4*25,mantis), spawn(4*60,panthers), spawn(4*16,hra)
wait(120), round(19), spawn(4*35,mantis), spawn(4*20,panthers), spawn(4*18,hra), spawn(4*45,cybsT2)
wait(120), round(20), spawn(4*25,mantis), spawn(4*30,wyvernH), spawn(4*15,wyvernT), spawn(4*4,vengeanceT), spawn(4*20,hra), spawn(4*20,panthers)

wait(120), round(21), spawn(4*6,vengeanceT), spawn(4*15,tigers), spawn(4*6,seraph), spawn(4*30,mantis)
wait(120), round(22), spawn(4*8,vengeanceH), spawn(4*45,mantis), spawn(4*25,tigers), spawn(4*8,seraph)
wait(120), round(23), spawn(4*20,cybsT3), spawn(4*15,mantis), spawn(4*5,wyvernH), spawn(4*5,wyvernT), spawn(4*10,vengeanceT), spawn(4*30,tigers)
wait(120), round(24), spawn(4*10,seraph), spawn(4*10,wyvernH), spawn(4*60,tigers), spawn(4*10,nexus)
wait(120), round(25), spawn(4*10,wyvernT), spawn(4*15,vengeanceT), spawn(4*25,nexus), spawn(4*20,tigers), spawn(4*60,cybsT3)
wait(120), round(26), spawn(4*12,seraph), spawn(4*20,wyvernH), spawn(4*45,nexus), spawn(4*25,tigers)
wait(120), round(27), spawn(4*15,vengeanceH), spawn(4*60,wyvernH), spawn(4*20,nexus), spawn(4*14,seraph)
wait(120), round(28), spawn(4*10,wyvernT), spawn(4*30,cybsT4), spawn(4*60,nexus), spawn(4*16,seraph)
wait(65), round(29), spawn(4*20,wyvernT), spawn(4*18,seraph), spawn(4*40,nexus)
wait(65), round(30), spawn(4*60,dragonH), spawn(4*40,dragonT), spawn(4*20,dragonH), spawn(4*90,cybsT4)

wait(65), round(31), spawn(4*100,dragonH), spawn(4*35,dragonT), spawn(4*80,cybsT4)
wait(65), round(32), spawn(4*120,dragonH), spawn(4*30,dragonT), spawn(4*70,cybsT4)
wait(65), round(33), spawn(4*140,dragonH), spawn(4*25,dragonT), spawn(4*60,cybsT4)
wait(65), round(34), spawn(4*160,dragonH), spawn(4*20,dragonT), spawn(4*50,cybsT4)
wait(65), round(35), spawn(4*180,dragonH), spawn(4*15,dragonT), spawn(4*40,cybsT4)
wait(65), round(36), spawn(4*200,dragonH), spawn(4*10,dragonT), spawn(4*30,cybsT4)
wait(65), round(37), spawn(4*220,dragonH), spawn(4*5,dragonT), spawn(4*20,cybsT4)
wait(65), round(38), spawn(4*240,dragonH), spawn(4*10,cybsT4)
wait(65), round(39), spawn(4*260,dragonH)
wait(65), round(40), spawn(4*390,dragonH)

wait(65), round(41), spawn(4*300,dragonH)
wait(65), round(42), spawn(4*320,dragonH)
wait(65), round(43), spawn(4*340,dragonH)
wait(65), round(44), spawn(4*360,dragonH)
wait(65), round(45), spawn(4*380,dragonH)
wait(65), round(46), spawn(4*400,dragonH)
wait(65), round(47), spawn(4*320,dragonH)
wait(65), round(48), spawn(4*340,dragonH)
wait(65), round(49), spawn(4*360,dragonH)
wait(65), round(50), spawn(4*540,dragonH)

wait(65), round(51), spawn(4*400,dragonH)
wait(65), round(52), spawn(4*420,dragonH)
wait(65), round(53), spawn(4*440,dragonH)
wait(65), round(54), spawn(4*460,dragonH)
wait(65), round(55), spawn(4*480,dragonH)
wait(65), round(56), spawn(4*400,dragonH)
wait(65), round(57), spawn(4*420,dragonH)
wait(65), round(58), spawn(4*440,dragonH)
wait(65), round(59), spawn(4*460,dragonH)
wait(65), round(60), spawn(4*690,dragonH)
