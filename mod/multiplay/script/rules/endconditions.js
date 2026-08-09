namespace("conditions_");

function conditions_eventGameInit() {
    queue("checkGameOver", 3*1000);
}

function checkGameOver() {
    // Call different functions depending on alliancesType
    const getAliveOrDead = isFFA() ? getAliveOrDeadPlayers : getAliveOrDeadTeams;
    const finalize       = isFFA() ? finalizePlayer        : finalizeTeam;

    // Check game over
    const { alive, dead } = getAliveOrDead();
    if (isGameOver(alive, dead)) {
        alive.forEach(x => finalize(x, true));
        dead.forEach(x => finalize(x, false));
        if (isSpectator(-1)) {
            gameOverMessage(false);
        }
    } else {
        queue("checkGameOver", 3*1000); // Check 3 seconds later
    }
}

// Only defenders can win or lose here. The wave player has no HQ by design, so
// counting it would make it a permanent loser and skew the team bookkeeping.
function getAliveOrDeadPlayers() {
    const alive = [];
    const dead = [];
    for (const player of waveDefenders()) {
        if (isAlive(player)) {
            alive.push(player);
        } else {
            dead.push(player);
        }
    }
    return { alive, dead };
}

function getAliveOrDeadTeams() {
    const defenders = waveDefenders();

    const alive = [];
    for (const player of defenders) {
        const team = playerData[player].team;
        if (!alive.includes(team) && isAlive(player)) {
            alive.push(team);
        }
    }

    const dead = [];
    for (const player of defenders) {
        const team = playerData[player].team;
        if (!alive.includes(team) && !dead.includes(team)) {
            dead.push(team);
        }
    }

    return { alive, dead };
}

/**
 * @param {number} player
 * @param {boolean} win
 */
function finalizePlayer(player, win) {
    if (player === selectedPlayer) {
        gameOverMessage(win);
    }
    if (!win && !isSpectator(player) && playerData[player].isHuman) {
        // should come after gameOverMessage() to ensure the proper gameOverMessage is displayed
        transformPlayerToSpectator(player);
    }
}

/**
 * @param {number} team
 * @param {boolean} win
 */
function finalizeTeam(team, win) {
    for (const player of waveDefenders()) {
        if (playerData[player].team == team) {
            finalizePlayer(player, win);
        }
    }
}

function isFFA() {
    return alliancesType == NO_ALLIANCES || alliancesType == ALLIANCES;
}

////////////////////////////////////////////////////////////////////////////////
//                                                                            //
// Write custom end condition logic below                                     //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

// Before the first wave, nobody is out for lacking an HQ: that window is what
// lets a player build their first one, or demolish theirs and move it.
function isAlive(player) {
    return !hqGraceOver || enumStruct(player, HQ).length > 0;
}

function isGameOver(alive, dead) {
    return alive.length <= 0
        || (index >= actions.length && Spawner.queue.length == 0 && hordeIsWipedOut());
}

function hordeIsWipedOut() {
    return wavePlayers.every(player => countDroid(DROID_ANY, player) == 0);
}
