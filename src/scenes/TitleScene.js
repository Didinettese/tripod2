class TitleScene extends Phaser.Scene {
  constructor() { super('TitleScene'); }

  preload() {
    // Backgrounds
    this.load.image('bg_countryside', 'assets/backgrounds/bg_countryside.png');
    this.load.image('bg_suburb',      'assets/backgrounds/bg_suburb.png');
    this.load.image('bg_city',        'assets/backgrounds/bg_city.png');
    this.load.image('bg_apartment',   'assets/backgrounds/bg_apartment.png');

    // Dog sprites
    this.load.image('dog_title',    'assets/sprites/dog_title.png');
    this.load.image('dog_idle',     'assets/sprites/dog_idle.png');
    this.load.image('dog_run',      'assets/sprites/dog_run.png');
    this.load.image('dog_jump1',    'assets/sprites/dog_jump.png');
    this.load.image('dog_hurt',     'assets/sprites/dog_hurt.png');
    this.load.image('dog_gameover', 'assets/sprites/dog_gameover.png');
    this.load.image('mistress',     'assets/sprites/mistress.png');
    this.load.image('victory',      'assets/sprites/victory.png');

    // Obstacles
    this.load.image('pigeon',       'assets/obstacles/pigeon.png');
    this.load.image('puddle',       'assets/obstacles/puddle.png');
    this.load.image('bike_blue',    'assets/obstacles/bike_blue.png');
    this.load.image('bike_black',   'assets/obstacles/bike_black.png');
    this.load.image('child_yellow', 'assets/obstacles/child_yellow.png');
    this.load.image('child_black',  'assets/obstacles/child_black.png');

    // UI
    this.load.image('crown_full',  'assets/ui/crown_full.png');
    this.load.image('crown_empty', 'assets/ui/crown_empty.png');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Dark royal background
    this.add.rectangle(0, 0, W, H, 0x0a0a1a).setOrigin(0);

    // Stars (decorative)
    for (let i = 0; i < 40; i++) {
      const x = Phaser.Math.Between(0, W);
      const y = Phaser.Math.Between(0, H * 0.75);
      const size = Phaser.Math.FloatBetween(0.5, 2);
      this.add.circle(x, y, size, 0xffd700, Phaser.Math.FloatBetween(0.3, 1));
    }

    // Title frame background
    this.add.rectangle(W / 2, H * 0.22, W * 0.7, 80, 0x4a0080, 0.9).setOrigin(0.5);

    // Title text
    this.add.text(W / 2, H * 0.22, 'TRIPOD', {
      fontFamily: 'Georgia, serif',
      fontSize: '58px',
      color: '#ffd700',
      stroke: '#3d0070',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(W / 2, H * 0.22 + 46, '~ La Quête de la Dignité ~', {
      fontFamily: 'Georgia, serif',
      fontSize: '15px',
      color: '#c0a0ff',
    }).setOrigin(0.5);

    // Dog with royal cape
    const dog = this.add.image(W / 2, H * 0.65, 'dog_title').setOrigin(0.5);
    dog.setDisplaySize(240, 240);

    // Idle float animation
    this.tweens.add({
      targets: dog,
      y: H * 0.65 - 8,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Dignity gauge (top left)
    this.drawDignityGauge(5);

    // Bouton "?" comment jouer (top right)
    const helpBtn = this.add.text(W - 16, 16, '?', {
      fontFamily: 'Georgia, serif', fontSize: '22px', color: '#ffd700',
      backgroundColor: '#1a0040', padding: { x: 10, y: 4 },
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    helpBtn.on('pointerdown', () => this.showHelp(W, H));

    // Press to start
    const startText = this.add.text(W / 2, H - 50, '✦  Appuyer pour commencer  ✦', {
      fontFamily: 'Georgia, serif', fontSize: '18px', color: '#ffd700',
    }).setOrigin(0.5);

    this.tweens.add({ targets: startText, alpha: 0.2, duration: 800, yoyo: true, repeat: -1 });

    this.startHandler = () => {
      if (!this.helpOpen) this.scene.start('GameScene');
    };
    this.helpOpen = false;

    this.input.keyboard.on('keydown', this.startHandler);
    this.input.on('pointerdown', (p) => {
      if (!this.helpOpen) this.scene.start('GameScene');
    });
  }

  showHelp(W, H) {
    this.helpOpen = true;

    // Overlay
    const overlay = this.add.rectangle(0, 0, W, H, 0x000000, 0.7).setOrigin(0).setDepth(10).setInteractive();

    // Fenêtre
    const bx = W / 2 - 240, by = H / 2 - 145;
    this.add.rectangle(bx, by, 480, 290, 0x1a0040, 0.97).setOrigin(0).setDepth(11);
    this.add.rectangle(bx, by, 480, 290, 0xffd700, 0).setOrigin(0).setStrokeStyle(2, 0xffd700).setDepth(11);

    this.add.text(W / 2, by + 22, 'COMMENT JOUER', {
      fontFamily: 'Georgia, serif', fontSize: '20px', color: '#ffd700',
    }).setOrigin(0.5, 0).setDepth(11);

    const lines = [
      '🖥  PC',
      '  ESPACE ou ↑  →  Sauter',
      '  ↓ (maintenir)  →  Se baisser',
      '',
      '📱  iPhone',
      '  Bouton ▲ SAUTER  →  Sauter',
      '  Bouton ▼ BAISSER  →  Se baisser',
      '',
      'Évite les obstacles !',
      'Tu as 5 couronnes de dignité.',
      'Perds-les toutes → game over.',
    ];

    lines.forEach((line, i) => {
      this.add.text(bx + 24, by + 58 + i * 20, line, {
        fontFamily: 'Georgia, serif', fontSize: '13px',
        color: line.startsWith('🖥') || line.startsWith('📱') ? '#ffd700' : '#ddd',
      }).setDepth(11);
    });

    // Bouton fermer
    const closeBtn = this.add.text(W / 2, by + 262, '✦  Fermer  ✦', {
      fontFamily: 'Georgia, serif', fontSize: '16px', color: '#ffd700',
    }).setOrigin(0.5).setDepth(11).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => {
      overlay.destroy();
      [overlay, closeBtn].forEach(o => o.destroy());
      this.helpOpen = false;
    });

    overlay.on('pointerdown', () => {
      overlay.destroy();
      closeBtn.destroy();
      this.helpOpen = false;
    });
  }

  drawDignityGauge(count) {
    const padding = 12;
    const crownSize = 28;
    const maxCrowns = 5;
    const boxW = padding * 2 + maxCrowns * (crownSize + 4);
    const boxH = 60;

    // Box
    this.add.rectangle(padding, padding, boxW, boxH, 0x1a0040, 0.85).setOrigin(0);
    this.add.rectangle(padding, padding, boxW, boxH, 0xffd700, 0).setOrigin(0).setStrokeStyle(2, 0xffd700);

    // Label
    this.add.text(padding + boxW / 2, padding + 10, 'DIGNITÉ', {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#ffd700',
    }).setOrigin(0.5, 0);

    // Crowns
    for (let i = 0; i < maxCrowns; i++) {
      const cx = padding + 10 + i * (crownSize + 4);
      const cy = padding + 34;
      const key = i < count ? 'crown_full' : 'crown_empty';
      this.add.image(cx, cy, key).setDisplaySize(crownSize, crownSize).setOrigin(0, 0.5);
    }
  }
}
