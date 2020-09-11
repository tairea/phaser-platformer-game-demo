var config = {
    type: Phaser.AUTO,
    width: 900,
    height: 576,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 1200
            },
            debug: true
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

function preload() {
    // background
    this.load.image('background', 'assets/images/Backgrounds/colored_grass.png')
    // map
    this.load.tilemapTiledJSON('map', 'assets/map/gamedevwananga.json')
    // grounds
    this.load.image('groundsImg', 'assets/spritesheets/spritesheet_ground.png');
    // player
    this.load.atlasXML('alien', 'assets/spritesheets/spritesheet_players.png', 'assets/spritesheets/spritesheet_players.xml');
    // enemy
    this.load.atlasXML('enemies', 'assets/spritesheets/spritesheet_enemies.png', 'assets/spritesheets/spritesheet_enemies.xml');
    this.load.image('bee', 'assets/images/Enemies/bee.png')

}

function create() {
    // background
    const backgroundImage = this.add.image(0, 0, 'background').setOrigin(0, 0);
    backgroundImage.setScale(0.9)
    // map
    const map = this.make.tilemap({key: 'map' });
    // ground
    const groundsTileset = map.addTilesetImage('spritesheet_ground', 'groundsImg');
    const platforms = map.createStaticLayer('Platforms', groundsTileset, 0, 0);
    platforms.setScale(0.3)
    platforms.setCollisionByExclusion(-1, true);
    // player
    this.player = this.physics.add.sprite(50, 400, 'alien');
    this.player.setScale(0.5)
    this.player.setBounce(0.05);
    this.player.body.setSize(this.player.width, this.player.height - 150).setOffset(0, 150);
    // collider
    this.physics.add.collider(this.player, platforms);
    // animations
    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNames('alien', { 
            prefix: 'alienYellow_walk', 
            suffix: '.png',
            start: 1,
            end: 2,
            zeroPad: 1
        }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'idle',
        frames: [{ key: 'alien', frame: 'alienYellow_front.png' }],
        frameRate: 10,
    });
    this.anims.create({
        key: 'jump',
        frames: [{ key: 'alien', frame: 'alienYellow_jump.png' }],
        frameRate: 10,
    });
   

    // --- Controls ---
    this.cursors = this.input.keyboard.createCursorKeys();


    // enemies
    this.anims.create({
        key: 'beeMove',
        frames: [{ key: 'enemies', frame: 'bee.png'},{ key: 'enemies', frame: 'bee_move.png'} ],
        frameRate: 10,
        repeat: -1
    });
    this.bees = this.physics.add.group({allowGravity: false,immovable: true});
    const beeObjects = map.getObjectLayer('Enemies')['objects'];
    beeObjects.forEach(beeObject => {
        const bee = this.bees.create(beeObject.x * 0.3, (beeObject.y * 0.3) - beeObject.height, 'bee').setOrigin(0, 0).setScale(0.3)
        this.tweens.add({
            targets: bee,
            y: 200,
            duration: 2000,
            ease: 'Sine.easeInOut',
            repeat: -1,
            yoyo: true
        });
        bee.play('beeMove', true);
    });
    
    

    this.physics.add.collider(this.player, this.bees, hitBee, null, this);

}

function update() {
    const speed = 500
   // Control the player with left or right keys
  if (this.cursors.left.isDown) {
    this.player.setVelocityX(-speed);
    if (this.player.body.onFloor()) {
      this.player.play('walk', true);
    }
  } else if (this.cursors.right.isDown) {
    this.player.setVelocityX(speed);
    if (this.player.body.onFloor()) {
      this.player.play('walk', true);
    }
  } else {
    // If no keys are pressed, the player keeps still
    this.player.setVelocityX(0);
    this.player.play('jump', true);
    // Only show the idle animation if the player is footed
    // If this is not included, the player would look idle while jumping
    if (this.player.body.onFloor()) {
      this.player.play('idle', true);
    }
  }

  // Player can jump while walking any direction by pressing the space bar
  // or the 'UP' arrow
  if ((this.cursors.space.isDown || this.cursors.up.isDown) && this.player.body.onFloor()) {
    this.player.setVelocityY(-620);
    this.player.play('jump', true);
  }
  
  // flip player
  if (this.player.body.velocity.x > 0) {
    this.player.setFlipX(false);
  } else if (this.player.body.velocity.x < 0) {
    // otherwise, make them face the other side
    this.player.setFlipX(true);
  }
   
}

function hitBee() {
    console.log("bee hit")
}