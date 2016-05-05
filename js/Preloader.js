// Preloader - load in assets
Vortex.Preloader = function(game) {};
Vortex.Preloader.prototype = {

    // Preload the game assets
    preload: function() {
        
        // Load title sheet sprites
        this.load.image('button_start', 'img/button_start.png');
        this.load.image('button_credits', 'img/button_credits.png');
        this.load.image('button_settings', 'img/button_settings.png');
    
        // Load game sprites
        this.load.spritesheet('gamepad', 
            'img/gamepad/gamepad_spritesheet.png', 100, 100);
        this.load.spritesheet('vortex', 'img/the_vortex.png', 300, 300, 2);
        this.load.image('ship', 'img/player.png');
        this.load.image('bullet', 'img/bullet.png');
        this.load.image('glider', 'img/glider.png');
        this.load.image('butterfly', 'img/butterfly.png');
        this.load.image('enemy_bullet', 'img/enemy_bullet.png');
        
        // Load audio
        game.load.audio('music', ['sound/floating_cities.ogg', 
            'sound/floating_cities.m4a']);
        game.load.audio('pulse_laser', ['sound/pulse_laser.ogg',
            'sound/pulse_laser.m4a']);
    },
    
    // Go to next state
    create: function() {
        game.state.start('Title');
    }
};