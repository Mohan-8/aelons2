import GameObject from "./GameObject";
import Bullet from "./Bullet";
import sprites from "./sprites";

export const Direction = {
  Left: 0,
  Right: 1,
};

export default class Invader extends GameObject {
  constructor(args) {
    super({ position: args.position, onDie: args.onDie, speed: 1, radius: 50 });
    this.direction = Direction.Right;
    this.bullets = [];
    this.lastShot = 0;
    this.shootDelay = Date.now();

    this.spriteSheet = new Image();
    this.spriteSheet.src = "/one.png";
    this.spriteSheet.onload = () => {
      this.spriteLoaded = true;
    };
    this.spriteLoaded = false;

    // Randomly pick an enemy sprite
    const enemyTypes = [
      sprites.enemy_purple,
      sprites.enemy_bee,
      sprites.enemy_ship,
      sprites.enemy_circle,
    ];
    this.selectedSprite =
      enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
  }

  reverse() {
    if (this.direction === Direction.Right) {
      this.position.x -= 10;
      this.direction = Direction.Left;
    } else {
      this.direction = Direction.Right;
      this.position.x += 10;
    }
  }

  update() {
    if (this.direction === Direction.Right) {
      this.position.x += this.speed;
    } else {
      this.position.x -= this.speed;
    }

    let nextShoot = Math.random() * 10 * 100000;

    let now = Date.now();
    if (
      now - this.shootDelay > nextShoot &&
      this.bullets.length <= 2 &&
      now - this.lastShot > nextShoot
    ) {
      const bullet = new Bullet({
        position: { x: this.position.x, y: this.position.y - 5 },
        direction: "down",
      });

      this.bullets.push(bullet);
      this.lastShot = Date.now();
    }
  }

  renderBullets(state) {
    let index = 0;
    for (let bullet of this.bullets) {
      if (bullet.delete) {
        this.bullets.splice(index, 1);
      } else {
        this.bullets[index].update();
        this.bullets[index].render(state);
      }
      index++;
    }
  }

  render(state) {
    if (!this.spriteLoaded) {
      return;
    }

    if (this.position.y > state.screen.height || this.position.y < 0) {
      this.die();
    }

    this.renderBullets(state);

    const context = state.context;

    context.save();
    context.translate(this.position.x, this.position.y);

    context.drawImage(
      this.spriteSheet,
      this.selectedSprite.sx, // Use selected sprite's sx
      this.selectedSprite.sy, // Use selected sprite's sy
      this.selectedSprite.w, // Use selected sprite's width
      this.selectedSprite.h, // Use selected sprite's height
      -this.selectedSprite.w / 2, // Center the sprite
      -this.selectedSprite.h / 2, // Center the sprite
      this.selectedSprite.w, // Width of the image in the canvas
      this.selectedSprite.h // Height of the image in the canvas
    );

    context.restore();
  }
}
