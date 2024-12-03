import Bullet from "./Bullet";
import GameObject from "./GameObject";
import sprites from "./sprites"; // Assuming sprites.js is the file where you store the sprite data


export default class Ship extends GameObject {
  constructor(args) {
    super({
      position: args.position,
      onDie: args.onDie,
      speed: 2.5,
      radius: 15,
    });
    this.bullets = [];
    this.lastShot = 0;

    // Load the sprite sheet image
    this.spriteSheet = new Image();
    this.spriteSheet.src = "/one.png"; // Path to your sprite sheet
    this.spriteSheet.onload = () => {
      this.spriteLoaded = true; // Flag to indicate the image has loaded
    };
    this.spriteLoaded = false; // Initially the image is not loaded
  }

  update(keys) {
    if (keys.right) {
      this.position.x += this.speed;
    } else if (keys.left) {
      this.position.x -= this.speed;
    }

    if (keys.space && Date.now() - this.lastShot > 250) {
      const bullet = new Bullet({
        position: { x: this.position.x, y: this.position.y - 5 },
        direction: "up",
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
      // Don't render until the sprite sheet is loaded
      return;
    }

    if (this.position.x > state.screen.width) {
      this.position.x = 0;
    } else if (this.position.x < 0) {
      this.position.x = state.screen.width;
    }
    if (this.position.y > state.screen.height) {
      this.position.y = 0;
    } else if (this.position.y < 0) {
      this.position.y = state.screen.height;
    }

    this.renderBullets(state);

    const context = state.context;

    // Draw the ship using the sprite data
    context.save();
    context.translate(this.position.x, this.position.y);

    // Draw the ship sprite from the sprite sheet
    context.drawImage(
      this.spriteSheet, // The sprite sheet image
      sprites.ship.sx, // Source x (starting point in the image)
      sprites.ship.sy, // Source y (starting point in the image)
      sprites.ship.w, // Source width (width of the ship sprite)
      sprites.ship.h, // Source height (height of the ship sprite)
      -sprites.ship.w / 2, // Destination x (center the ship)
      -sprites.ship.h / 2, // Destination y (center the ship)
      sprites.ship.w, // Destination width
      sprites.ship.h // Destination height
    );

    context.restore();
  }
}
