class VictoryScene extends Phaser.Scene {
  constructor() { super('VictoryScene'); }

  create(data) {
    const W = this.scale.width;
    const H = this.scale.height;
    const dignity = data ? data.dignity : MAX_DIGNITY;

    // Apartment background
    this.add.image(0, 0, 'bg_apartment').setOrigin(0).setDisplaySize(W, H);

    // Warm overlay
    this.add.rectangle(0, 0, W, H, 0xff9944, 0.15).setOrigin(0);

    // Hearts floating
    for (let i = 0; i < 12; i++) {
      const heart = this.add.text(
        Phaser.Math.Between(W * 0.2, W * 0.8),
        Phaser.Math.Between(H * 0.1, H * 0.7),
        '♥',
        { fontSize: Phaser.Math.Between(16, 32) + 'px', color: '#ff4488' }
      ).setAlpha(0);

      this.tweens.add({
        targets: heart,
        alpha: { from: 0, to: 0.8 },
        y: heart.y - Phaser.Math.Between(40, 80),
        duration: Phaser.Math.Between(1500, 3000),
        delay: Phaser.Math.Between(0, 2000),
        repeat: -1,
        yoyo: true,
      });
    }

    // Victory image (hug scene)
    const hug = this.add.image(W / 2, H / 2 + 20, 'victory').setScale(0.7);
    hug.setAlpha(0);
    this.tweens.add({ targets: hug, alpha: 1, duration: 800 });

    // Bounce in
    this.tweens.add({
      targets: hug,
      scaleX: { from: 0.4, to: 0.7 },
      scaleY: { from: 0.4, to: 0.7 },
      duration: 600,
      ease: 'Back.easeOut'
    });

    // Title
    this.add.text(W / 2, 42, 'IL EST ARRIVÉ.', {
      fontFamily: 'Georgia, serif',
      fontSize: '34px',
      color: '#ffd700',
      stroke: '#3d0070',
      strokeThickness: 5,
    }).setOrigin(0.5);

    this.add.text(W / 2, 82, '— Contre toute attente. —', {
      fontFamily: 'Georgia, serif',
      fontSize: '15px',
      color: '#c0a0ff',
    }).setOrigin(0.5);

    this.add.text(W / 2, 108, 'Trop heureux de retrouver Alexane ♥', {
      fontFamily: 'Georgia, serif',
      fontSize: '17px',
      color: '#ff88bb',
      stroke: '#3d0070',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Dignity remaining
    this.drawDignityGauge(dignity);

    // Dignity comment
    const comments = ['', 'Tout juste.', 'Pas mal !', 'Bien joué !', 'Impressionnant !', 'DIGNITÉ ROYALE INTACTE !'];
    this.add.text(W / 2, H - 80, comments[dignity] || '', {
      fontFamily: 'Georgia, serif',
      fontSize: '15px',
      color: '#ffd700',
    }).setOrigin(0.5);

    // Replay
    const replayText = this.add.text(W / 2, H - 45, '✦  Rejouer  ✦', {
      fontFamily: 'Georgia, serif',
      fontSize: '20px',
      color: '#ffd700',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.tweens.add({
      targets: replayText, alpha: 0.3, duration: 700, yoyo: true, repeat: -1
    });

    replayText.on('pointerdown', () => this.scene.start('TitleScene'));
    this.input.keyboard.once('keydown', () => this.scene.start('TitleScene'));
  }

  drawDignityGauge(count) {
    const padding = 12;
    const crownSize = 26;
    const maxCrowns = MAX_DIGNITY;
    const boxW = padding * 2 + maxCrowns * (crownSize + 4);
    const boxH = 58;

    this.add.rectangle(padding, padding, boxW, boxH, 0x1a0040, 0.85).setOrigin(0);
    this.add.rectangle(padding, padding, boxW, boxH, 0xffd700, 0).setOrigin(0).setStrokeStyle(2, 0xffd700);
    this.add.text(padding + boxW / 2, padding + 9, 'DIGNITÉ', {
      fontFamily: 'Georgia, serif', fontSize: '11px', color: '#ffd700',
    }).setOrigin(0.5, 0);

    for (let i = 0; i < maxCrowns; i++) {
      const cx = padding + 10 + i * (crownSize + 4);
      const cy = padding + 33;
      this.add.image(cx, cy, i < count ? 'crown_full' : 'crown_empty')
        .setDisplaySize(crownSize, crownSize).setOrigin(0, 0.5);
    }
  }
}
