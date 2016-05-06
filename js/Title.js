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
        
        // Start playing music
        Vortex.music = game.add.audio('music');
        if (Vortex.soundEnabled) {
            Vortex.music.play('', 0, 0.5, true);
        }
        
        // Add sound/mute button
        this.soundButton = game.add.button(80, 10, 'icon_sound', 
            this.toggleSound, this);
        this.soundButton.scale.set(0.6);
        this.soundButton.frame = 0;
    },
    
    startGame: function() {
        game.state.start('Game');
    },
    
    showCredits: function() {
        
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