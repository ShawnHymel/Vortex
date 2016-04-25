/**
 * Vortex
 * Author: Shawn Hymel
 * Date: April 17, 2016
 *
 * License: MIT (see LICENSE.md)
 */
 
var game = new Phaser.Game(500, 500, Phaser.CANVAS);

// Game object to hold parameters and helper objects
var Vortex = {
    debug: false,
    center: new Phaser.Point(250, 200),
    bulletSpeed: -0.008,
    maxBullets: 5,
    fireRate: 100,
    maxEnemies: 16,
    gliderSpeed: 0.002
};

////////////////////////////////////////////////////////////////////////////////
// Flyer class
////////////////////////////////////////////////////////////////////////////////

// Add the Flyer class constructor to the game state's prototype
Flyer = function(game, key) {
    
    Phaser.Sprite.call(this, game, 0, 0, key);
    
    this.anchor.set(0.5);
    
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.exists = false;
    
    this.scaleSpeed = 0;
};

// Inherit properties from Sprite class
Flyer.prototype = Object.create(Phaser.Sprite.prototype);
Flyer.prototype.constructor = Flyer

// Fire method
Flyer.prototype.fire = function(source, speed) {
    this.pivot.x = source.pivot.x;
    this.pivot.y = source.pivot.y;
    this.angle = source.angle;
    this.speed = speed;
    this.scale.x = source.scale.x;
    this.scale.y = source.scale.y;
    
    this.reset(source.x, source.y);
};

// Update method
Flyer.prototype.update = function() {
    this.scale.x += this.speed;
    this.scale.y += this.speed;

    if ((this.scale.x <= 0.25) || (this.scale.x > 1)) {
        this.kill();
    }
};

////////////////////////////////////////////////////////////////////////////////
// Game State Definition
////////////////////////////////////////////////////////////////////////////////

// Constructor
var PhaserGame = function() {
    
    // State members
    this.debug = false;
    this.center = Vortex.center;
    this.player = null;
    this.nextFire = 0;
};

// Prototype
PhaserGame.prototype = {
    
    preload: function() {
        
        // Load the gamepad spritesheet. Note that the width must equal height
        // of the sprite.
        this.load.spritesheet('gamepad', 
            'img/gamepad/gamepad_spritesheet.png', 100, 100);
        
        this.load.image('vortex', 'img/the_vortex.png');
        this.load.image('ship', 'img/player.png');
        this.load.image('bullet', 'img/bullet.png');
        this.load.image('glider', 'img/glider.png');
    },
    
    create: function() {
        
        // Round to nearest pixel to prevent anti-aliasing in CANVAS
        game.renderer.roundPixels = true;
        
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.scale.pageAlignHorizontally = true;
		this.scale.pageAlignVertically = true;
        
        game.physics.startSystem(Phaser.Physics.ARCADE);
        
        // Add background
        this.vortex = this.add.sprite(this.center.x, this.center.y, 'vortex');
        this.vortex.anchor.set(0.5);
        
        // Add the hero
        this.player = this.add.sprite(250, 200, 'ship');
        this.player.scale.setTo(1, 1);
        this.player.anchor.set(0.5);
        this.player.pivot.x = -150;
        this.player.angle = 90;  

        // Create our group of bullets
        this.bullets = game.add.group();
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
        for (var i = 0; i < Vortex.maxBullets; i++) {
            this.bullets.add(new Flyer(game, 'bullet'), true);
        }
        this.bullets.setAll('alive', false);

        // Create our group of enemies
        this.enemies = game.add.group();
        this.enemies.enableBody = true;
        this.enemies.physicsBodyType = Phaser.Physics.ARCADE;
        for (var i = 0; i < Vortex.maxEnemies; i++) {
            this.enemies.add(new Flyer(game, 'glider'), true);
        }
        
        // Set the group of enemies as an entity that pivots around center
        this.enemies.setAll('x', this.center.x);
        this.enemies.setAll('y', this.center.y);
        this.enemies.setAll('pivot.x', -150);
        this.enemies.setAll('angle', 0);
        this.enemies.setAll('alive', false);
        
        // Only add the virtual gamepad if not on desktop
        if (!Phaser.Device.desktop) {
            this.gamepad = this.game.plugins.add(Phaser.Plugin.VirtualGamepad);
            this.joystick = this.gamepad.addJoystick(100, 420, 1.2, 'gamepad');
            this.button = this.gamepad.addButton(400, 420, 1.0, 'gamepad');
        }
        
        // Debug text
        if (this.debug) {
            var style = {font: '14px Arial', 
                         fill: '#ffffff', 
                         align: 'left', 
                         stroke: '#000000'};
            this.directionText = this.add.text(20, 20, '', style);
            this.rectangularText = this.add.text(140, 20, '', style);
            this.polarText = this.add.text(260, 20, '', style);
            this.pushText = this.add.text(380, 20, '', style);
        }
        
        // Set a timer to fire off the first enemy
        var that = this;
        setTimeout( function() {
            that.fireEnemy();
        }, 1000);
    },
    
    update: function() {
        
        if (this.debug) {
            this.updateDebugText();
        }
        
        // Read mouse pointer if on desktop and virtual gamepad if not
        if (Phaser.Device.desktop) {
            if (this.input.activePointer.isMouse) {
                var mousePoint = new Phaser.Point(this.input.mousePointer.x,
                                                  this.input.mousePointer.y);
                this.player.rotation = Phaser.Point.angle(mousePoint, this.center);
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
        game.physics.arcade.overlap(this.bullets,
                                    this.enemies, 
                                    this.enemyHitHandler,
                                    null,
                                    this);
        
    },
    
    fireWeapon: function() {
        
        // Shoot bullets at fire rate if we have some available
        if ((this.bullets.countDead() > 0) && 
            (game.time.time > this.nextFire)) {
            var bullet = this.bullets.getFirstDead(false);
            bullet.scale.setTo(1);
            bullet.fire(this.player, Vortex.bulletSpeed);
            
            // Set the next time we can fire a bullet
            this.nextFire = game.time.time + Vortex.fireRate;
        }
    },
    
    fireEnemy: function() {
        
        // If we haven't reached max enemies, fire in random direction
        if (this.enemies.countDead() > 0) {
            var enemy = this.enemies.getFirstDead(false);
            enemy.angle = game.rnd.angle();
            enemy.scale.setTo(0.25);
            enemy.fire(enemy, Vortex.gliderSpeed);
        }
        
        // Set another timer to fire off the next enemy
        var that = this;
        setTimeout( function() {
            that.fireEnemy();
        }, 1000);
    },
    
    enemyHitHandler: function (bullet, enemy) {
        
        // When a bullet hits an enemy, kill them both
        bullet.kill();
        enemy.kill();
        
        console.log("Enemy hit");
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
    },
};

////////////////////////////////////////////////////////////////////////////////
// Add Game State
////////////////////////////////////////////////////////////////////////////////
game.state.add('Game', PhaserGame, true);