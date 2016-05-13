// Credits screen
Vortex.Credits = function(game) {};
Vortex.Credits.prototype = {
    
    create: function() {
    
        // Add sound/mute button
        this.soundButton = game.add.button(80, 10, 'icon_sound', 
            this.toggleSound, this);
        this.soundButton.scale.set(0.6);
        if (Vortex.soundEnabled) {
            this.soundButton.frame = 0;
        } else {
            this.soundButton.frame = 1;
        }
        
        // Set credits font
        var style = {
            font: "24px Helvetica",
            fill: "#ffffff",
            align: "center"
        };
        
        // Show developer
        game.add.text(game.width / 2, 100,
            "Developer: Shawn Hymel", style).anchor.set(0.5);
        
        // Add link for developer's Twitter handle
        style = {
            font: "24px Helvetica",
            fill: "#00baff",
            align: "center"
        };
        var tweetText = game.add.text(game.width / 2, 130,
            "@ShawnHymel", style);
        tweetText.anchor.set(0.5);
        tweetText.inputEnabled = true;
        tweetText.events.onInputDown.add(function() {
            window.location.href = 
                "https://twitter.com/ShawnHymel";
        }, this);
            
        // Show song credits
        style = {
            font: "18px Helvetica",
            fill: "#ffffff",
            align: "center"
        };
        var song = '"Floating Cities" Kevin MacLeod (incompetech.com)\n' +
            'Licensed under Creative Commons: By Attribution 3.0 License\n';
        game.add.text(game.width / 2, 200,
            song, style).anchor.set(0.5);
            
        // Add link for CC
        style = {
            font: "18px Helvetica",
            fill: "#00baff",
            align: "center"
        };
        var licenseText = game.add.text(game.width / 2, 226,
            "http://creativecommons.org/licenses/by/3.0/", style);
        licenseText.anchor.set(0.5);
        licenseText.inputEnabled = true;
        licenseText.events.onInputDown.add(function() {
            window.location.href = 
                "http://creativecommons.org/licenses/by/3.0/";
        }, this);
        
        // Show source code info
        style = {
            font: "18px Helvetica",
            fill: "#ffffff",
            align: "center"
        };
        var song = 'This game is open source! Fork it at:';
        game.add.text(game.width / 2, 280,
            song, style).anchor.set(0.5);
            
        // Add link for CC
        style = {
            font: "18px Helvetica",
            fill: "#00baff",
            align: "center"
        };
        var gitText = game.add.text(game.width / 2, 306,
            "https://github.com/ShawnHymel/Vortex", style);
        gitText.anchor.set(0.5);
        gitText.inputEnabled = true;
        gitText.events.onInputDown.add(function() {
            window.location.href = 
                "https://github.com/ShawnHymel/Vortex";
        }, this);
        
        // Add return to title screen button
        var returnButton = game.add.button(game.width / 2, 
            game.height / 2 + 125, 'button_return', this.returnToTitle, this);
        returnButton.anchor.set(0.5);
        returnButton.scale.set(0.5);
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
    },
    
    returnToTitle: function() {
        game.state.start('Title');
    }
};