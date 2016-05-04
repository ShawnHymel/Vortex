/**
 * Vortex
 * Author: Shawn Hymel
 * Date: April 17, 2016
 *
 * License: MIT (see LICENSE.md)
 */
 
var game = new Phaser.Game(500, 500, Phaser.CANVAS);

// Game object to hold parameters
var Vortex = {
    debug: false,               // Show debug info on screen (virtual gamepad)
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
    maxPoints: 999900,          // Maximum points a player can earn (good luck!)
    firstGliderSpawn: 2000,     // Tims (ms) to spawn first Glider
    firstButterflySpawn: 10000, // Time (ms) to spawn first Butterfly
    initialSpawnRate: 2000,     // Time (ms) to continually spawn enemies
    spawnDelayDecrement: 20,    // Time (ms) decrease between enemy spawns
    minSpawnRate: 300           // Minimum time (ms) between spawns
};

////////////////////////////////////////////////////////////////////////////////
// Flyer class
////////////////////////////////////////////////////////////////////////////////

// Add the Flyer class constructor to the game state's prototype
var Flyer = function(game, key, onDeathHandler, context) {
    
    // Set default parameters
    if (context === undefined) {
        context = null;
    }
    
    // Flyer inherits from Sprite
    Phaser.Sprite.call(this, game, 0, 0, key);
    
    // Set members
    this.owner = context;
    this.onDeathHandler = onDeathHandler;
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.exists = false;
    this.scaleSpeed = 0;
    
    // Flyer position should always be referenced from center of sprite
    this.anchor.set(0.5);
};

// Inherit properties from Sprite class
Flyer.prototype = Object.create(Phaser.Sprite.prototype);
Flyer.prototype.constructor = Flyer

// Fire method
Flyer.prototype.fire = function(source, speed) {
    
    // Set properties
    this.pivot.x = source.pivot.x;
    this.pivot.y = source.pivot.y;
    this.angle = source.angle;
    this.speed = speed;
    this.scale.x = source.scale.x;
    this.scale.y = source.scale.y;
    
    // Revive sprite
    this.reset(source.x, source.y);
};

// Update method
Flyer.prototype.update = function() {
    
    // Update scaling (movement into/out of vortex)
    this.scale.x += this.speed;
    this.scale.y += this.speed;

    // Kill sprite if it reaches either edge of the Vortex
    if ((this.scale.x <= 0.25) || (this.scale.x > 1)) {
        if ((this.alive) && (this.onDeathHandler !== null)) {
            this.onDeathHandler(this.owner);
        }
        this.kill();
    }
};

////////////////////////////////////////////////////////////////////////////////
// Main Game State
////////////////////////////////////////////////////////////////////////////////

// Constructor
var PhaserGame = function(game) {
    
    // State members
    this.debug = false;
    this.center = Vortex.center;
    this.player = null;
    this.nextFire = 0;
    this.score = 0;
};

// Prototype
PhaserGame.prototype = {
    
    preload: function() {
        
        // Load the gamepad spritesheet. Note that the width must equal height
        // of the sprite.
        this.load.spritesheet('gamepad', 
            'img/gamepad/gamepad_spritesheet.png', 100, 100);
        this.load.spritesheet('vortex', 'img/the_vortex.png', 300, 300, 2);
        this.load.image('ship', 'img/player.png');
        this.load.image('bullet', 'img/bullet.png');
        this.load.image('glider', 'img/glider.png');
        this.load.image('butterfly', 'img/butterfly.png');
        this.load.image('enemy_bullet', 'img/enemy_bullet.png');
    },
    
    create: function() {
        
        // Round to nearest pixel to prevent anti-aliasing in CANVAS
        game.renderer.roundPixels = true;
        
        // Scale so everything fits on the screen
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.scale.pageAlignHorizontally = true;
		this.scale.pageAlignVertically = true;
        
        // Begin the physics!
        game.physics.startSystem(Phaser.Physics.ARCADE);
        
        // Add background
        this.vortex = this.add.sprite(this.center.x, this.center.y, 'vortex');
        this.vortex.anchor.set(0.5);
        this.vortex.frame = 0;
        
        // Add the hero
        this.player = this.add.sprite(250, 200, 'ship');
        game.physics.arcade.enable(this.player);
        this.player.scale.setTo(1, 1);
        this.player.anchor.set(0.5);
        this.player.pivot.x = -1 * Vortex.playerDistance;
        this.player.angle = 90;  

        // Create our group of bullets
        this.bullets = game.add.group();
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
        for (var i = 0; i < Vortex.maxBullets; i++) {
            this.bullets.add(new Flyer(game, 'bullet', null, this), true);
        }
        this.bullets.setAll('alive', false);

        // Create our group of glider enemies
        this.gliders = game.add.group();
        this.gliders.enableBody = true;
        this.gliders.physicsBodyType = Phaser.Physics.ARCADE;
        for (var i = 0; i < Vortex.maxGliders; i++) {
            this.gliders.add(new Flyer(game, 'glider', this.loseLife, this), 
                                                                        true);
        }
        
        // Set the group of enemies as an entity that pivots around center
        this.gliders.setAll('x', this.center.x);
        this.gliders.setAll('y', this.center.y);
        this.gliders.setAll('pivot.x', -150);
        this.gliders.setAll('angle', 0);
        this.gliders.setAll('alive', false);
        this.gliders.nextSpawn = Vortex.initialSpawnRate;
        
        // Create our group of butterfly enemies
        this.butterflies = game.add.group();
        this.butterflies.enableBody = true;
        this.butterflies.physicsBodyType = Phaser.Physics.ARCADE;
        for (var i = 0; i < Vortex.maxGliders; i++) {
            this.butterflies.add(new Flyer(game, 'butterfly', this.loseLife, 
                                                                this), true);
        }
        
        // Set the group of enemies as an entity that pivots around center
        this.butterflies.setAll('x', this.center.x);
        this.butterflies.setAll('y', this.center.y);
        this.butterflies.setAll('pivot.x', -150);
        this.butterflies.setAll('angle', 0);
        this.butterflies.setAll('alive', false);
        this.butterflies.nextSpawn = Vortex.initialSpawnRate;
        
        // Create our group of enemy bullets
        this.enemyBullets = game.add.group();
        this.enemyBullets.enableBody = true;
        this.enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
        for (var i = 0; i < Vortex.maxEnemyBullets; i++) {
            this.enemyBullets.add(new Flyer(game, 'enemy_bullet', null, this), 
                                                                        true);
        }
        this.enemyBullets.setAll('alive', false);
        
        // Add life sprites to the top of the screen
        this.lives = Vortex.lives;
        this.lifeSprites = game.add.group();
        for (var i = 0; i < this.lives; i++) {
            this.lifeSprites.create(10 + (25 * i), 40, 'ship');
            var child = this.lifeSprites.getChildAt(i);
            child.anchor.set(1, 1);
            child.angle = 180;
        }
        
        // Style for text
        this.style = {font: '24px Helvetica',
                     fill: '#ffffff',
                     align: 'left'};
        this.scoreStyle = {font: '24px Courier',
                           fill: '#ffffff',
                           align: 'right'};
                     
        // Add lives and points text
        this.add.text(10, 10, 'Lives', this.style);
        this.add.text(450, 10, 'Score', this.style).anchor.set(1, 0);
        this.scoreText = this.add.text(450, 35, '0', this.scoreStyle);
        this.scoreText.anchor.set(1, 0);
        
        // Only add the virtual gamepad if not on desktop
        if (!Phaser.Device.desktop) {
            this.gamepad = this.game.plugins.add(Phaser.Plugin.VirtualGamepad);
            this.joystick = this.gamepad.addJoystick(100, 420, 1.2, 'gamepad');
            this.button = this.gamepad.addButton(400, 420, 1.0, 'gamepad');
        }
        
        // Debug text
        if (Vortex.debug && !Phaser.Device.desktop) {
            var dStyle = {font: '14px Arial', 
                         fill: '#ffffff', 
                         align: 'left', 
                         stroke: '#000000'};
            this.directionText = this.add.text(20, 20, '', dStyle);
            this.rectangularText = this.add.text(140, 20, '', dStyle);
            this.polarText = this.add.text(260, 20, '', dStyle);
            this.pushText = this.add.text(380, 20, '', dStyle);
        }
        
        // Set a timer to fire off the first glider
        var that = this;
        setTimeout( function() {
            that.fireEnemy(that.gliders, Vortex.gliderSpeed);
        }, Vortex.firstGliderSpawn);
        
        // Set a timer to fire off the first butterfly
        setTimeout( function() {
            that.fireEnemy(that.butterflies, Vortex.butterflySpeed);
        }, Vortex.firstButterflySpawn);
        
        // Set a timer to have a random butterfly shoot
        setTimeout( function() {
            that.enemyShoot(that.butterflies, 
                            that.enemyBullets, 
                            Vortex.enemyBulletSpeed);
        }, 1000);
    },
    
    update: function() {
        
        // Show virtual gamepad debugging text
        if (Vortex.debug && !Phaser.Device.desktop) {
            this.updateDebugText();
        }
        
        // Update score text
        this.scoreText.text = this.score;
        
        // Read mouse pointer if on desktop and virtual gamepad if not
        if (Phaser.Device.desktop) {
            if (this.input.activePointer.isMouse) {
                var mousePoint = new Phaser.Point(this.input.mousePointer.x,
                                                  this.input.mousePointer.y);
                this.player.rotation = Phaser.Point.angle(mousePoint, 
                                                                this.center);
            }
        } else {
            if (this.joystick.properties.distance !== 0) {
                this.player.angle = this.joystick.properties.angle;
            };
        }
        
        // Fire lasers!
        if (Phaser.Device.desktop) {
            if (game.input.activePointer.leftButton.isDown) {
                this.fireWeapon();
            }
        } else {
            if (this.button.isDown) {
                this.fireWeapon();
            }
        }
        
        // Collision detection
        game.physics.arcade.overlap(this.bullets, this.gliders,
            function(bullet, enemy) {
                this.enemyHitHandler(bullet, enemy, Vortex.gliderPoints, this);
            }, null, this);
        game.physics.arcade.overlap(this.bullets, this.butterflies,
            function(bullet, enemy) {
                this.enemyHitHandler(bullet, enemy, Vortex.butterflyPoints, 
                                                                        this);
            }, null, this);
        game.physics.arcade.overlap(this.bullets,
                                    this.enemyBullets,
                                    this.bulletHitHandler,
                                    null,
                                    this);
        game.physics.arcade.overlap(this.player,
                                    this.enemyBullets,
                                    this.playerHitHandler,
                                    null,
                                    this);
    },
    
    fireWeapon: function() {
        
        // Shoot bullets at fire rate if we have some available
        if ((this.bullets.countDead() > 0) && 
            (game.time.time > this.nextFire)) {
            var bullet = this.bullets.getFirstDead();
            bullet.scale.setTo(1);
            bullet.fire(this.player, Vortex.bulletSpeed);
            
            // Set the next time we can fire a bullet
            this.nextFire = game.time.time + Vortex.fireRate;
        }
    },
    
    fireEnemy: function(enemies, speed) {
        
        // If we haven't reached max enemies, fire in random direction
        if (enemies.countDead() > 0) {
            var enemy = enemies.getFirstDead();
            enemy.angle = game.rnd.angle();
            enemy.scale.setTo(0.25);
            enemy.fire(enemy, speed);
        }
        
        // Decrement spawn rate down to a certain level
        enemies.nextSpawn = Phaser.Math.max((enemies.nextSpawn - 
            Vortex.spawnDelayDecrement), Vortex.minSpawnRate);
        
        // Set another timer to fire off the next enemy
        var that = this;
        setTimeout( function() {
            that.fireEnemy(enemies, speed);
        }, enemies.nextSpawn);
    },
    
    enemyShoot: function(enemies, bullets, speed) {
        
        // If there's an enemy on screen and bullets available, fire!
        if ((enemies.countLiving() > 0) && (bullets.countDead() > 0)) {
            
            // Create a list of all the enemies that are on screen
            var indArray = [];
            enemies.forEachAlive( function(child) {
                indArray.push(enemies.getChildIndex(child));
            }, this);
            
            // Choose one of those enemies at random
            var ind = game.rnd.between(0, indArray.length - 1);
            var enemy = enemies.getChildAt(indArray[ind]);
            
            // Have that random enemy shoot a bullet
            var bullet = bullets.getFirstDead();
            bullet.angle = enemy.angle;
            bullet.scale.setTo(enemy.scale);
            bullet.fire(enemy, speed);
        }
        
        // Set another timer to shoot again
        var that = this;
        setTimeout( function() {
            that.enemyShoot(enemies, bullets, speed);
        }, 2000);
    },
    
    enemyHitHandler: function(bullet, enemy, points, context) {
        
        // When a bullet hits an enemy, kill them both
        bullet.kill();
        enemy.kill();
        
        // Update score
        context.score = Phaser.Math.min(context.score + points, 
                                                        Vortex.maxPoints);
    },
    
    bulletHitHandler: function(bullet, enemyBullet) {
        
        // This is what it's like when bullets collide
        bullet.kill();
        enemyBullet.kill();
    },
    
    playerHitHandler: function(player, enemyBullet) {
        
        // The player gets hit
        enemyBullet.kill();
        
        this.loseLife(this);
    },
    
    loseLife: function(owner) {
        
        // Flash the Vortex
        owner.vortex.frame = 1;
        setTimeout( function() {
            owner.vortex.frame = 0;
        }, 150);
        
        if (owner.lives === 0) {
            owner.lives = 0;
            owner.score = 0;
            game.state.start('Game');
            return;
        };
        
        // Remove life from sprites
        if (owner.lives > 0) {
            owner.lifeSprites.getChildAt(owner.lives - 1).kill();
        }
        
        // Decrement lives
        owner.lives--;
    },
 
    updateDebugText: function() {
        this.directionText.setText("Direction:\n up: " + 
            this.joystick.properties.up + "\n down: " + 
            this.joystick.properties.down + "\n left: " + 
            this.joystick.properties.left + "\n right: " + 
            this.joystick.properties.right);
        this.rectangularText.setText("Rectangular:\n x: " + 
            this.joystick.properties.x + "\n y: " + this.joystick.properties.y);
        this.polarText.setText("Polar:\n distance: " + 
            this.joystick.properties.distance + "\n angle: " +
            (Math.round(this.joystick.properties.angle * 100) / 100) + 
            "\n rotation: " + 
            (Math.round(this.joystick.properties.rotation * 100) / 100));
        this.pushText.setText("Joystick: " + this.joystick.properties.inUse + 
            "\nButton: " + this.button.isDown);
    }
};

////////////////////////////////////////////////////////////////////////////////
// Add Game State
////////////////////////////////////////////////////////////////////////////////
game.state.add('Game', PhaserGame);
game.state.start('Game');