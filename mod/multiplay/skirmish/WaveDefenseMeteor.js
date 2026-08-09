//
// Meteor spawn mode. Off by default: it drops a whole round on one spot, which
// can be brutally unfair if it lands behind somebody's defences.
//
// To enable it, rename WaveDefenseMeteor.json.disabled to WaveDefenseMeteor.json
// and restart the game. Warzone only lists an AI when it finds its .json, so the
// entry stays out of the lobby until then.
//
// Tune it from config.js with setMeteorDistance(), setMeteorBurst() and
// setMeteorWarning(). The behaviour lives in WaveDefense.js.
//

include("/multiplay/skirmish/WaveDefense.js");
