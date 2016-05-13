// Global object to keep our states and objects
var Vortex = {

    // Game parameters
    debug: false,               // Show debug info on screen (virtual gamepad)
    debugFPS: false,            // Show FPS on screen
    center: new Phaser.Point(250, 200), // Origin point of the vortex
    lives: 3,                   // Number of extra lives (n + 1 tries)
    playerDistance: 157,        // Distance of player from center of vortex
    bulletSpeed: -0.008,        // How fast player's bullets travel
    enemyBulletSpeed: 0.004,    // How fast enemies' bullets travel
    maxBullets: 5,              // Maximum player bullets on screen at once
    maxEnemyBullets: 5,         // Maximum enemy bullets on screen at once
    fireRate: 100,              // Delay (ms) between player bullets
    maxGliders: 16,             // Maximum Glider enemies on screen at once
    maxButterflies: 16,         // Maximum Butterfly enemies on screen at once
    gliderSpeed: 0.002,         // Speed Gliders move to edge of vortex
    butterflySpeed: 0.001,      // Speed Butterflies move to edge of vortex
    gliderPoints: 100,          // Shooting a Glider earns this many points
    butterflyPoints: 100,       // Shooting a Butterfly earns this many points
    maxPoints: 999999,          // Maximum points a player can earn (good luck!)
    firstGliderSpawn: 2000,     // Tims (ms) to spawn first Glider
    firstButterflySpawn: 10000, // Time (ms) to spawn first Butterfly
    initialSpawnRate: 3000,     // Time (ms) to continually spawn enemies
    difficultyIncRate: 3000,    // Time (ms) between spawn delay decrements
    spawnDelayDecrement: 100,   // Time (ms) decrease between enemy spawns
    minSpawnRate: 300,          // Minimum time (ms) between spawns
    butterflyShootRate: 2000,   // Time (ms) between shots from Butterflies
    
    // Global variables
    music: null,
    soundEnabled: true,
    score: 0,
    highscore: 0
};

// Boot state - loads first
Vortex.Boot = function(game) {};
Vortex.Boot.prototype = {
    
    create: function() {
        
        // Round to nearest pixel to prevent anti-aliasing in CANVAS
        game.renderer.roundPixels = true
        
        // Scale so everything fits on the screen
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.scale.pageAlignHorizontally = true;
		this.scale.pageAlignVertically = true;
        
        // Start the game
        this.state.start('Preloader');
    }
};