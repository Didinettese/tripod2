const GROUND_Y = 310;
const DOG_X = 160;
const MAX_DIGNITY = 5;
const DOG_SIZE = 200;
const GRAVITY = 2200;

const PHASES = [
  {
    name: 'Campagne',
    bg: 'bg_countryside',
    duration: 18000,
    speed: 300,
    obstacles: ['pigeon', 'puddle'],
    spawnDelay: 2000,
  },
  {
    name: 'Banlieue',
    bg: 'bg_suburb',
    duration: 18000,
    speed: 390,
    obstacles: ['child_yellow', 'child_black', 'bike_blue', 'bike_black'],
    spawnDelay: 1700,
  },
  {
    name: 'Ville',
    bg: 'bg_city',
    duration: 20000,
    speed: 490,
    obstacles: ['pigeon', 'puddle', 'child_yellow', 'bike_blue', 'bike_black', 'child_black'],
    spawnDelay: 1300,
  },
];

const DUCK_OBSTACLES = ['bike_blue', 'bike_black'];

class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.dignity    = MAX_DIGNITY;
    this.phaseIndex = 0;
    this.isHurt     = false;
    this.isDucking  = false;
    this.isOnGround = true;
    this.gameActive = true;
    this.vy         = 0;      // vitesse verticale manuelle
    this.bobTime    = 0;

    // Background
    this.bg = this.add.image(0, 0, PHASES[0].bg).setOrigin(0).setDisplaySize(W, H);

    // Chien — image simple, pas de physique (évite le conflit tween/gravité)
    this.dog = this.add.image(DOG_X, GROUND_Y, 'dog_run');
    this.dog.setDisplaySize(DOG_SIZE, DOG_SIZE);

    // Obstacles (physique uniquement pour le déplacement horizontal)
    this.obstacleList = [];

    // UI
    this.createUI();

    // Phase label
    this.phaseText = this.add.text(W / 2, 20, '', {
      fontFamily: 'Georgia, serif', fontSize: '20px',
      color: '#ffd700', stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5, 0);

    // Contrôles clavier
    this.cursors  = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Boutons tactiles visibles
    this.createTouchButtons(W, H);

    // Touch fallback sur tout l'écran (hors boutons)
    this.input.on('pointerup', () => this.unduck());

    this.startPhase(0);
  }

  startPhase(index) {
    this.phaseIndex = index;
    const phase = PHASES[index];
    this.bg.setTexture(phase.bg);

    this.phaseText.setAlpha(1).setText(phase.name.toUpperCase());
    this.tweens.add({ targets: this.phaseText, alpha: 0, duration: 1500, delay: 2000 });

    if (this.spawnTimer) this.spawnTimer.remove();
    this.spawnTimer = this.time.addEvent({
      delay: phase.spawnDelay, callback: this.spawnObstacle,
      callbackScope: this, loop: true,
    });

    if (this.phaseTimer) this.phaseTimer.remove();
    this.phaseTimer = this.time.delayedCall(phase.duration, () => {
      if (index < PHASES.length - 1) {
        this.spawnTimer.remove();
        this.clearObstacles();
        this.startPhase(index + 1);
      } else {
        this.endGame(true);
      }
    });
  }

  spawnObstacle() {
    if (!this.gameActive) return;
    const phase = PHASES[this.phaseIndex];
    const W = this.scale.width;
    const key = Phaser.Utils.Array.GetRandom(phase.obstacles);
    const isDuck = DUCK_OBSTACLES.includes(key);

    const obs = this.add.image(W + 80, GROUND_Y, key);

    if (key === 'puddle') {
      obs.setDisplaySize(160, 55);
      obs.y = GROUND_Y + 30;
    } else if (key === 'pigeon') {
      obs.setDisplaySize(110, 110);
      obs.y = GROUND_Y + 10;
    } else if (isDuck) {
      obs.setDisplaySize(190, 150);
      obs.y = GROUND_Y - 25;
    } else {
      obs.setDisplaySize(120, 190);
      obs.y = GROUND_Y - 5;
    }

    obs.speed  = phase.speed;
    obs.isDuck = isDuck;
    // Hitbox manuelle (rectangles en unités monde)
    obs.hw = obs.displayWidth  * 0.35;
    obs.hh = obs.displayHeight * 0.4;

    this.obstacleList.push(obs);
  }

  clearObstacles() {
    this.obstacleList.forEach(o => o.destroy());
    this.obstacleList = [];
  }

  jump() {
    if (!this.gameActive || !this.isOnGround) return;
    this.isOnGround = false;
    this.vy = -800;
    this.dog.setTexture('dog_jump1');
  }

  duck() {
    if (!this.gameActive || !this.isOnGround || this.isDucking) return;
    this.isDucking = true;
    this.dog.setDisplaySize(DOG_SIZE, DOG_SIZE * 0.5);
    this.dog.y = GROUND_Y + 50;
  }

  unduck() {
    if (!this.isDucking) return;
    this.isDucking = false;
    this.dog.setDisplaySize(DOG_SIZE, DOG_SIZE);
    this.dog.y = GROUND_Y;
  }

  checkCollisions() {
    // Hitbox du chien (plus petite que le sprite)
    const dogHW = this.isDucking ? DOG_SIZE * 0.25 : DOG_SIZE * 0.22;
    const dogHH = this.isDucking ? DOG_SIZE * 0.2  : DOG_SIZE * 0.3;

    for (let i = this.obstacleList.length - 1; i >= 0; i--) {
      const obs = this.obstacleList[i];
      if (!obs || !obs.active) continue;

      const dx = Math.abs(this.dog.x - obs.x);
      const dy = Math.abs(this.dog.y - obs.y);

      if (dx < dogHW + obs.hw && dy < dogHH + obs.hh) {
        // Vélo → doit se baisser
        if (obs.isDuck && this.isDucking) continue;
        // Pigeon/flaque/enfant → doit sauter
        if (!obs.isDuck && !this.isOnGround) continue;

        this.obstacleList.splice(i, 1);
        obs.destroy();
        this.onHit();
        break;
      }
    }
  }

  onHit() {
    if (this.isHurt || !this.gameActive) return;
    this.isHurt = true;
    this.dignity--;
    this.updateDignityUI();

    this.dog.setTexture('dog_hurt');
    this.cameras.main.shake(200, 0.01);

    if (this.dignity <= 0) {
      this.endGame(false);
      return;
    }

    this.tweens.add({
      targets: this.dog, alpha: 0.2, duration: 100, yoyo: true, repeat: 5,
      onComplete: () => {
        this.dog.setAlpha(1);
        this.dog.setTexture('dog_run');
        this.isHurt = false;
      }
    });
  }

  endGame(victory) {
    this.gameActive = false;
    if (this.spawnTimer) this.spawnTimer.remove();
    if (this.phaseTimer) this.phaseTimer.remove();

    if (victory) {
      this.dog.setTexture('dog_run');
      this.time.delayedCall(800, () => this.scene.start('VictoryScene', { dignity: this.dignity }));
    } else {
      this.dog.setTexture('dog_gameover');
      this.time.delayedCall(1500, () => this.scene.start('GameOverScene'));
    }
  }

  createUI() {
    const pad = 12, cs = 26, bW = pad * 2 + MAX_DIGNITY * (cs + 4), bH = 58;
    this.add.rectangle(pad, pad, bW, bH, 0x1a0040, 0.85).setOrigin(0).setDepth(10);
    this.add.rectangle(pad, pad, bW, bH, 0xffd700, 0).setOrigin(0).setStrokeStyle(2, 0xffd700).setDepth(10);
    this.add.text(pad + bW / 2, pad + 9, 'DIGNITÉ', {
      fontFamily: 'Georgia, serif', fontSize: '11px', color: '#ffd700',
    }).setOrigin(0.5, 0).setDepth(10);

    this.crownIcons = [];
    for (let i = 0; i < MAX_DIGNITY; i++) {
      const crown = this.add.image(pad + 10 + i * (cs + 4), pad + 33, 'crown_full')
        .setDisplaySize(cs, cs).setOrigin(0, 0.5).setDepth(10);
      this.crownIcons.push(crown);
    }
  }

  createTouchButtons(W, H) {
    const btnW = 130, btnH = 60, margin = 16, y = H - 38;

    // Bouton SAUTER (gauche)
    const jumpBg = this.add.rectangle(margin, y, btnW, btnH, 0x1a0040, 0.75)
      .setOrigin(0, 0.5).setDepth(20).setInteractive();
    this.add.rectangle(margin, y, btnW, btnH, 0xffd700, 0)
      .setOrigin(0, 0.5).setStrokeStyle(2, 0xffd700).setDepth(20);
    this.add.text(margin + btnW / 2, y, '▲  SAUTER', {
      fontFamily: 'Georgia, serif', fontSize: '15px', color: '#ffd700',
    }).setOrigin(0.5).setDepth(20);

    jumpBg.on('pointerdown', () => { if (this.gameActive) this.jump(); });

    // Bouton BAISSER (droite)
    const duckBg = this.add.rectangle(W - margin, y, btnW, btnH, 0x1a0040, 0.75)
      .setOrigin(1, 0.5).setDepth(20).setInteractive();
    this.add.rectangle(W - margin, y, btnW, btnH, 0xffd700, 0)
      .setOrigin(1, 0.5).setStrokeStyle(2, 0xffd700).setDepth(20);
    this.add.text(W - margin - btnW / 2, y, '▼  BAISSER', {
      fontFamily: 'Georgia, serif', fontSize: '15px', color: '#ffd700',
    }).setOrigin(0.5).setDepth(20);

    duckBg.on('pointerdown', () => { if (this.gameActive) this.duck(); });
    duckBg.on('pointerup',   () => this.unduck());
    duckBg.on('pointerout',  () => this.unduck());
  }

  updateDignityUI() {
    this.crownIcons.forEach((c, i) => c.setTexture(i < this.dignity ? 'crown_full' : 'crown_empty'));
  }

  update(time, delta) {
    if (!this.gameActive) return;
    const dt = delta / 1000;

    // Contrôles clavier
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) || Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.jump();
    }
    if (this.cursors.down.isDown)        this.duck();
    else if (this.cursors.down.isUp && this.isDucking) this.unduck();

    // Physique manuelle du saut
    if (!this.isOnGround) {
      this.vy += GRAVITY * dt;
      this.dog.y += this.vy * dt;

      if (this.dog.y >= GROUND_Y) {
        this.dog.y      = GROUND_Y;
        this.vy         = 0;
        this.isOnGround = true;
        if (!this.isHurt) this.dog.setTexture('dog_run');
      }
    } else if (!this.isDucking && !this.isHurt) {
      // Bob quand au sol
      this.bobTime += delta;
      this.dog.y = GROUND_Y + Math.sin(this.bobTime / 150) * 5;
    }

    // Déplacement des obstacles
    const W = this.scale.width;
    for (let i = this.obstacleList.length - 1; i >= 0; i--) {
      const obs = this.obstacleList[i];
      obs.x -= obs.speed * dt;
      if (obs.x < -200) {
        obs.destroy();
        this.obstacleList.splice(i, 1);
      }
    }

    // Collisions
    if (!this.isHurt) this.checkCollisions();
  }
}
