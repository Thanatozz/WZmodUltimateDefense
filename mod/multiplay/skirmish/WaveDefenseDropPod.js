//
// Drop Pod spawn mode: the whole round drops on one spot away from the defenders,
// with a beacon warning first.
//
// Whether it actually behaves that way is up to config.js. setDropPodEnabled(false)
// makes a slot picked here fall back to Base instead, because the lobby's AI list
// is built from these .json files before any script runs - a script cannot add or
// remove an entry from it.
//
// Tune it with setDropPodDistance(), setDropPodBurst() and setDropPodWarning().
// The behaviour lives in WaveDefense.js.
//

include("/multiplay/skirmish/WaveDefense.js");
