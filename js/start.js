/**
 * Vortex
 * Author: Shawn Hymel
 * Date: April 17, 2016
 *
 * License: MIT (see LICENSE.md)
 */
 
var game = new Phaser.Game(500, 500, Phaser.CANVAS);

var PhaserGame = function() {
    
    // Game variables
    this.debug = false;
    this.center = new Phaser.Point(250, 200);
    this.player = null;
};

PhaserGame.prototype = {
    
    preload: function() {
        
        // Load the gamepad spritesheet. Note that the width must equal height
        // of the sprite.
        this.load.spritesheet('gamepad', 
            'img/gamepad/gamepad_spritesheet.png', 100, 100);
        
        this.load.image('vortex', 'img/the_vortex.png');
        this.load.image('ship', 'img/player.png');
        this.load.image('bullet', 'img/bullet.png');
    },
    
    create: function() {
        
        // Round to nearest pixel to prevent anti-aliasing in CANVAS
        game.renderer.roundPixels = true;
        
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.scale.pageAlignHorizontally = true;
		this.scale.pageAlignVertically = true;
        
        this.physics.startSystem(Phaser.Physics.ARCADE);
        
        // Add background
        this.vortex = this.add.sprite(this.center.x, this.center.y, 'vortex');
        this.vortex.anchor.set(0.5);
        
        // Add the player's weapon
        this.weapon = new this.Weapon.SingleBullet(this.game);
        
        this.player = this.add.sprite(250, 200, 'ship');
        this.player.scale.setTo(1, 1);
        this.player.anchor.set(0.5);
        this.player.pivot.x = -150;
        this.player.angle = 90;
        
        var style = {font: '14px Arial', 
                     fill: '#ffffff', 
                     align: 'left', 
                     stroke: '#000000'};
        
        // Only add the virtual gamepad if not on desktop
        if (!Phaser.Device.desktop) {
            this.gamepad = this.game.plugins.add(Phaser.Plugin.VirtualGamepad);
            this.joystick = this.gamepad.addJoystick(100, 420, 1.2, 'gamepad');
            this.button = this.gamepad.addButton(400, 420, 1.0, 'gamepad');
        }
        
        // Debug text
        if (this.debug) {
            this.directionText = this.add.text(20, 20, '', style);
            this.rectangularText = this.add.text(140, 20, '', style);
            this.polarText = this.add.text(260, 20, '', style);
            this.pushText = this.add.text(380, 20, '', style);
        }
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
        
        // Fire the laser!
        if (Phaser.Device.desktop) {
            if (game.input.activePointer.leftButton.isDown) {
                this.weapon.fire(this.player);
            }
        } else {
            if (this.button.isDown) {
                this.weapon.fire(this.player);
            }
        }
        
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

////////////////////////////////////////////////////////////////////////////
// Bullet class
////////////////////////////////////////////////////////////////////////////
PhaserGame.prototype.Bullet = function(game, key) {
    
    Phaser.Sprite.call(this, game, 0, 0, key);
    
    this.anchor.set(0.5);
    
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.exists = false;
    
    this.scaleSpeed = 0;
};

PhaserGame.prototype.Bullet.prototype = Object.create(Phaser.Sprite.prototype);
PhaserGame.prototype.Bullet.prototype.constructor = PhaserGame.Bullet;

PhaserGame.prototype.Bullet.prototype.fire = function(source, 
                                                      speed,
                                                      scaleSpeed) {
    
    this.pivot.x = source.pivot.x;
    this.pivot.y = source.pivot.y;
    this.angle = source.angle;
    this.scaleSpeed = scaleSpeed;
    
    this.reset(source.x, source.y);
    this.scale.set(1);
};

PhaserGame.prototype.Bullet.prototype.update = function() {
    this.scale.x += this.scaleSpeed;
    this.scale.y += this.scaleSpeed;
    
    if (this.scale.x <= 0.25) {
        this.kill();
    }
};

////////////////////////////////////////////////////////////////////////////
// Weapon class
////////////////////////////////////////////////////////////////////////////
PhaserGame.prototype.Weapon = {};
PhaserGame.prototype.Weapon.SingleBullet = function(game) {
    
    Phaser.Group.call(this, game, game.world, 'Single Bullet', false, true, 
        Phaser.Physics.ARCADE);
        
    this.nextFire = 0;
    this.bulletSpeed = 10;
    this.fireRate = 100;
    this.maxBullets = 10;
    
    // Add bullets to group and set all to dead
    for (var i = 0; i < 64; i++) {
        this.add(new PhaserGame.prototype.Bullet(game, 'bullet'), true);
    }
    this.setAll('alive', false);
    
    return this;
};

PhaserGame.prototype.Weapon.SingleBullet.prototype = 
    Object.create(Phaser.Group.prototype);
PhaserGame.prototype.Weapon.SingleBullet.prototype.constructor = 
    PhaserGame.prototype.Weapon.SingleBullet;

PhaserGame.prototype.Weapon.SingleBullet.prototype.fire = function(source) {
    
    if ((this.game.time.time < this.nextFire) || 
        (this.countLiving() + 1 > this.maxBullets)) {
        return;
    }
    
    var x = source.x;
    var y = source.y;
    
    this.getFirstExists(false).fire(source, this.bulletSpeed, -.008);
    
    this.nextFire = this.game.time.time + this.fireRate;
};

////////////////////////////////////////////////////////////////////////////////
// Add Game State
////////////////////////////////////////////////////////////////////////////////
game.state.add('Game', PhaserGame, true);