class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.add.rectangle(0, 0, W, H, 0x0a0a1a).setOrigin(0);

    for (let i = 0; i < 20; i++) {
      this.add.circle(
        Phaser.Math.Between(0, W), Phaser.Math.Between(0, H),
        Phaser.Math.FloatBetween(0.5, 1.5), 0x666699, 0.5
      );
    }

    const dog = this.add.image(W / 2, H * 0.55, 'dog_gameover').setDisplaySize(240, 240);
    this.tweens.add({ targets: dog, y: H * 0.55 - 10, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    this.add.text(W / 2, 70, 'PLUS AUCUNE DIGNITÉ', {
      fontFamily: 'Georgia, serif', fontSize: '32px', color: '#c0a0ff',
      stroke: '#000', strokeThickness: 5,
    }).setOrigin(0.5);

    this.add.text(W / 2, 112, '— Il s\'est assis. C\'est terminé. —', {
      fontFamily: 'Georgia, serif', fontSize: '16px', color: '#7755aa',
    }).setOrigin(0.5);

    this.drawDignityGauge(0);

    // Bouton Réessayer
    const retryBtn = this.add.text(W / 2 - 110, H - 48, '✦  Réessayer  ✦', {
      fontFamily: 'Georgia, serif', fontSize: '20px', color: '#ffd700',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.tweens.add({ targets: retryBtn, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });
    retryBtn.on('pointerdown', () => this.scene.start('GameScene'));

    // Séparateur
    this.add.text(W / 2, H - 48, '|', {
      fontFamily: 'Georgia, serif', fontSize: '20px', color: '#555588',
    }).setOrigin(0.5);

    // Bouton Accueil
    const homeBtn = this.add.text(W / 2 + 110, H - 48, '⌂  Accueil  ⌂', {
      fontFamily: 'Georgia, serif', fontSize: '20px', color: '#c0a0ff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.tweens.add({ targets: homeBtn, alpha: 0.3, duration: 700, yoyo: true, repeat: -1, delay: 350 });
    homeBtn.on('pointerdown', () => this.scene.start('TitleScene'));
  }

  drawDignityGauge(count) {
    const padding = 12;
    const crownSize = 26;
    const boxW = padding * 2 + MAX_DIGNITY * (crownSize + 4);
    const boxH = 58;

    this.add.rectangle(padding, padding, boxW, boxH, 0x1a0040, 0.85).setOrigin(0);
    this.add.rectangle(padding, padding, boxW, boxH, 0xffd700, 0).setOrigin(0).setStrokeStyle(2, 0xffd700);
    this.add.text(padding + boxW / 2, padding + 9, 'DIGNITÉ', {
      fontFamily: 'Georgia, serif', fontSize: '11px', color: '#ffd700',
    }).setOrigin(0.5, 0);

    for (let i = 0; i < MAX_DIGNITY; i++) {
      this.add.image(padding + 10 + i * (crownSize + 4), padding + 33, i < count ? 'crown_full' : 'crown_empty')
        .setDisplaySize(crownSize, crownSize).setOrigin(0, 0.5);
    }
  }
}
