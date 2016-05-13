// Title screen
Vortex.Title = function(game) {};
Vortex.Title.prototype = {

    create: function() {
        
        // Set title font
        var style = {
            font: "48px Helvetica",
            fill: "#ffffff",
            align: "center"
        };
        
        // Show title
        var title = game.add.text(game.width / 2, game.height / 2 - 100,
            "VORTEX", style);
        title.anchor.set(0.5);
        
        // Add buttons
        var startButton = game.add.button(game.width / 2, 
            game.height / 2 + 50, 'button_start', this.startGame, this);
        var creditsButton = game.add.button(game.width / 2,
            game.height / 2 + 125, 'button_credits', this.showCredits, this);
            
        // Center all buttons
        startButton.anchor.set(0.5);
        creditsButton.anchor.set(0.5);
        
        // Scale all buttons
        startButton.scale.set(0.5);
        creditsButton.scale.set(0.5);
        
        // Get the stored high score
        storageAPI.initUnset('Vortex-highscore', 0);
        Vortex.highscore = storageAPI.get('Vortex-highscore') || 0;
        
        // Display "high score"
        style = {font: '24px Helvetica',
                 fill: '#ffffff',
                 align: 'left'};
        this.add.text(490, 10, 'High Score', style).anchor.set(1, 0); 

        // Display the high score
        style = {font: '24px Courier',
                 fill: '#ffffff',
                 align: 'right'};
        this.add.text(490, 35, Vortex.highscore, style).anchor.set(1, 0);
        
        
        // Start playing music (if it isn't already)
        if (Vortex.music === null) {
            Vortex.music = game.add.audio('music');
            if (Vortex.soundEnabled) {
                Vortex.music.play('', 0, 0.5, true);
            }
        }
        
        // Add sound/mute button
        this.soundButton = game.add.button(80, 10, 'icon_sound', 
            this.toggleSound, this);
        this.soundButton.scale.set(0.6);
        if (Vortex.soundEnabled) {
            this.soundButton.frame = 0;
        } else {
            this.soundButton.frame = 1;
        }
    },
    
    startGame: function() {
        game.state.start('Game');
    },
    
    showCredits: function() {
        game.state.start('Credits');
    },
    
    toggleSound: function() {
        
        // Toggle sound and update icon. Also, pause and play music.
        Vortex.soundEnabled = !Vortex.soundEnabled;
        if (Vortex.soundEnabled) {
            this.soundButton.frame = 0;
            Vortex.music.resume();
        } else {
            this.soundButton.frame = 1;
            Vortex.music.pause();
        }
    }
};