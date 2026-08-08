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

setResearchDelay(720)

wait(360), round(1), spawn(10*15,people), spawn(10*5,scavs), spawn(10*15,people)
wait(200), round(2), spawn(10*30,people), spawn(10*15,scavs), spawn(10*30,people)
wait(200), round(3), spawn(10*30,scavs), spawn(10*40,people), spawn(10*5,wheels)
wait(200), round(4), spawn(10*2,vipers), spawn(10*10,people), spawn(10*10,wheels), spawn(10*5,scavs), spawn(10*10,people)
wait(220), round(5), spawn(10*15,scavs), spawn(10*4,vipers), spawn(10*10,wheels)
wait(240), round(6), spawn(10*10,bugs), spawn(10*2,cobras), spawn(10*8,vipers), spawn(10*50,people)
wait(250), round(7), spawn(10*4,cybsT0), spawn(10*10,vipers), spawn(10*10,wheels), spawn(10*4,cobras)
wait(260), round(8), spawn(10*15,bugs), spawn(10*8,cobras), spawn(10*2,mra), spawn(10*25,wheels), spawn(10*10,vipers)
wait(270), round(9), spawn(10*20,bugs), spawn(10*30,scavs), spawn(10*4,mra), spawn(10*15,cobras)
wait(360), round(10), spawn(10*12,cybsT0), spawn(10*6,mra), spawn(10*20,cobras), spawn(10*10,wheels), spawn(10*3,vengeanceH), spawn(10*3,vengeanceT)

wait(320), round(11), spawn(10*35,bugs), spawn(10*5,scorps), spawn(10*5,pythons), spawn(10*10,mra)
wait(280), round(12), spawn(10*10,cybsT1), spawn(10*15,pythons), spawn(10*12,mra), spawn(10*15,scorps)
wait(280), round(13), spawn(10*30,scorps), spawn(10*2,vengeanceT), spawn(10*25,pythons), spawn(10*15,bugs), spawn(10*6,mra), spawn(10*6,hra)
wait(280), round(14), spawn(10*30,pythons), spawn(10*10,panthers), spawn(10*30,cybsT1), spawn(10*8,hra)
wait(280), round(15), spawn(10*100,bugs), spawn(10*35,scorps), spawn(10*10,mantis), spawn(10*5,vengeanceH)
wait(280), round(16), spawn(10*3,vengeanceT), spawn(10*5,scorps), spawn(10*15,mantis), spawn(10*6,vengeanceH), spawn(10*12,hra), spawn(10*10,pythons), spawn(10*30,panthers)
wait(280), round(17), spawn(10*3,vengeanceT), spawn(10*15,cybsT2), spawn(10*20,mantis), spawn(10*40,panthers), spawn(10*10,hra)
wait(280), round(18), spawn(10*10,vengeanceH), spawn(10*25,mantis), spawn(10*60,panthers), spawn(10*16,hra)
wait(280), round(19), spawn(10*35,mantis), spawn(10*20,panthers), spawn(10*18,hra), spawn(10*45,cybsT2)
wait(400), round(20), spawn(10*25,mantis), spawn(10*30,wyvernH), spawn(10*15,wyvernT), spawn(10*4,vengeanceT), spawn(10*20,hra), spawn(10*20,panthers)

wait(340), round(21), spawn(10*6,vengeanceT), spawn(10*15,tigers), spawn(10*6,seraph), spawn(10*30,mantis)
wait(280), round(22), spawn(10*8,vengeanceH), spawn(10*45,mantis), spawn(10*25,tigers), spawn(10*8,seraph)
wait(280), round(23), spawn(10*20,cybsT3), spawn(10*15,mantis), spawn(10*5,wyvernH), spawn(10*5,wyvernT), spawn(10*10,vengeanceT), spawn(10*30,tigers)
wait(280), round(24), spawn(10*10,seraph), spawn(10*10,wyvernH), spawn(10*60,tigers), spawn(10*10,nexus)
wait(280), round(25), spawn(10*10,wyvernT), spawn(10*15,vengeanceT), spawn(10*25,nexus), spawn(10*20,tigers), spawn(10*60,cybsT3)
wait(280), round(26), spawn(10*12,seraph), spawn(10*20,wyvernH), spawn(10*45,nexus), spawn(10*25,tigers)
wait(280), round(27), spawn(10*15,vengeanceH), spawn(10*60,wyvernH), spawn(10*20,nexus), spawn(10*14,seraph)
wait(280), round(28), spawn(10*10,wyvernT), spawn(10*30,cybsT4), spawn(10*60,nexus), spawn(10*16,seraph)
wait(280), round(29), spawn(10*20,wyvernT), spawn(10*18,seraph), spawn(10*40,nexus)
wait(540), round(30), spawn(10*60,dragonH), spawn(10*40,dragonT), spawn(10*20,dragonH), spawn(10*90,cybsT4)
