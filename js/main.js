window.onload = function(){
    
var game = new Phaser.Game(1024, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.tilemap('level1', 'assets/level2.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles-1', 'assets/tiles-1.png');
    game.load.spritesheet('character', 'assets/character.png', 60, 88);
    game.load.spritesheet('doge', 'assets/doge.png', 81, 71);
    game.load.image('grave', 'assets/grave.png');
    game.load.image('heart', 'assets/HeartContainer.png');
    game.load.audio('wow', 'assets/wow.mp3');
    game.load.audio('music', 'assets/music.mp3');

}

var map;
var tileset;
var layer;
var player;
var facing = 'left';
var cursors;
var jumpButton;
var invulnTimer = 0;
var playerMaxHealth = 3;
var playerHealth = 3;
var hearts = [];
var grave;
var doges = [];
var dogesFacing = [];
var numberOfDoges = 10;
var playerJumpVelocity = -300;
var wow;
var music;
var elapsedTime = 0;

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.stage.backgroundColor = '#000000';                                     //Background color

    //bg = game.add.tileSprite(0, 0, 800, 600, 'background');                     //Creates background
    //bg.fixedToCamera = true;                                                    //Fixes background to camera

    map = game.add.tilemap('level1');                                           //Creates tilemap

    map.addTilesetImage('tiles-1');                                             //Tile spritesheet

    map.setCollisionByExclusion([ 51 ]);    //Data on tile collisions

    layer = map.createLayer('Tile Layer 1');

    //  Un-comment this on to see the collision tiles
     //layer.debug = true;

    layer.resizeWorld();

    game.physics.arcade.gravity.y = 250;                                        //Sets gravity
    createDoges();
    player = game.add.sprite(128, 300, 'character');                                   //Adds spritesheet to player and places it at position (32, 32)
    grave = game.add.sprite(-100, -100, 'grave');
    createHearts();

    game.physics.enable(player, Phaser.Physics.ARCADE);                         //Adds physics to player

    player.body.bounce.y = 0.0;                                                 //Adds bounce to player
    player.body.collideWorldBounds = false;                                      //Makes player collide with world bounds
    player.body.setSize(39, 77, 5, 16);                                         //Sets side of player collision

    player.animations.add('left', [18, 17, 16, 15, 14, 13, 12, 11, 10], 10, true);                      //Adds animation to player "Left"
    player.animations.add('turn', [0, 19], 20, true);                               //Adds animation to player "Turn"
    player.animations.add('right', [1, 2, 3, 4, 5, 6, 7, 8, 9], 10, true);                     //Adds animation to player "Right"
    
    game.camera.follow(player); 
    cursors = game.input.keyboard.createCursorKeys();                           //Creates cursors
    jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);          //Creates jump button
    
    wow = game.add.audio('wow');
    music = game.add.audio('music', 0.2, true);
    wow.allowMultiple = true;
    music.play();
}

function update() 
{
    collisionUpdate();
    dogeUpdate();
    playerUpdate();
    heartUpdate();
}

function collisionUpdate()
{
    player.body.velocity.x = 0;
    game.physics.arcade.collide(player, layer);                                 //Collides player with layer
}

function heartUpdate()
{
    for(var i = 0; i < playerMaxHealth; ++i)
        {
             if(i < playerHealth)
                 {
                     hearts[i].revive();
                 }
            else
                {
                    hearts[i].kill();
                }
            
            hearts[i].x = game.camera.x + (i * 64) + 32;
            hearts[i].y = game.camera.y + 32;
        }
}

function dogeUpdate()
{
    for(var i = 0; i < doges.length; ++i)
        {
            game.physics.arcade.collide(doges[i], layer);
            if(game.time.now > invulnTimer)
                {
                    game.physics.arcade.overlap(player, doges[i], hurtPlayer);
                }
            if(doges[i].x >= 3080 && dogesFacing[i] == 'right')
                {
                    dogesFacing[i] = 'left';
                }
            else if(doges[i].x <= 32 && dogesFacing[i] == 'left')
                {
                    dogesFacing[i] = 'right';
                }
            if(dogesFacing[i] == 'right')
                {
                    var randomValue = game.rnd.integerInRange(150, 200);
                    doges[i].body.velocity.x = randomValue;
                    doges[i].animations.play('right');
                }
            else
                {
                    var randomValue = game.rnd.integerInRange(-150, -200);
                    doges[i].body.velocity.x = randomValue;
                    doges[i].animations.play('left');
                }
        }
}
function playerUpdate()
{
    
    if(playerHealth == 0)
        {
            return;
        }
    elapsedTime += game.time.elapsed;
    if (cursors.left.isDown)                                                    //Moves player left
    {
        player.body.velocity.x = -150;

        if (facing != 'left')
        {
            player.animations.play('left');
            facing = 'left';
        }
    }
    else if (cursors.right.isDown)                                              //Moves player right
    {
        player.body.velocity.x = 150;

        if (facing != 'right')
        {
            player.animations.play('right');
            facing = 'right';
        }
    }
    else                                                                        //Sets player to idle
    {
        if (facing != 'idle')
        {
            player.animations.stop();

            if (facing == 'left')
            {
                player.frame = 19;
            }
            else
            {
                player.frame = 0;
            }

            facing = 'idle';
        }
    }
    
    if (jumpButton.isDown && player.body.onFloor())//Makes player jump
    {
        player.body.velocity.y = playerJumpVelocity;
    }
    
    if(player.body.onFloor())
        {
            canMove = true;
        }
}

function hurtPlayer()
{
    if(game.time.now < invulnTimer)
        {
            return;
        }
    playerHealth--;
    if(playerHealth < 0)
        {
            playerHealth = 0;
            killPlayer();
        }
    else
        {
            wow.play();
        }
    invulnTimer = game.time.now + 2000;
}

function killPlayer()
{
    grave.x = player.x;
    grave.y = player.y + 55;
    player.kill();
}

function createDoges()
{
    for(var i = 0; i < numberOfDoges; ++i)
        {
            var randomValue = game.rnd.integerInRange(1024, 2900);
            doges.push(game.add.sprite(randomValue + (i * 64), 32, 'doge'));
            doges[i].animations.add('left', [15, 14, 13, 12, 11, 10, 9, 8], 10, true);
            doges[i].animations.add('right', [0, 1, 2, 3, 4, 5, 6, 7], 10, true)
            game.physics.enable(doges[i], Phaser.Physics.ARCADE);
            doges[i].body.setSize(75, 65, 5, 16); 
            var randomDirection = game.rnd.integerInRange(0, 1);
            if(randomDirection == 0)
                {
                    dogesFacing.push('left');
                }
            else
                {
                    dogesFacing.push('right');
                }
            
        }
}

function createHearts()
{
    for(var i = 0; i < playerHealth; ++i)
        {
            hearts.push(game.add.sprite(0, 0, 'heart')); 
        }
}

function render () 
{
    if(playerHealth == 0)
        {
            game.debug.text('GAME OVER\nTime alive: ' + elapsedTime / 1000 + ' seconds', 512, 300);
        }
}
};
