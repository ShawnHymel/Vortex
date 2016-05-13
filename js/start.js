/**
 * Vortex
 * Author: Shawn Hymel
 * Date: April 17, 2016
 *
 * License: MIT (see LICENSE.md)
 */

// Add Phaser game to div
var game = new Phaser.Game(500, 500, Phaser.CANVAS);

// Define game states
var states = {
    'Boot': Vortex.Boot,
    'Preloader': Vortex.Preloader,
    'Title': Vortex.Title,
    'Credits': Vortex.Credits,
    'Game': Vortex.Game
};

// Add states
for (var state in states) {
    game.state.add(state, states[state]);
}

// Start Boot state
game.state.start('Boot');