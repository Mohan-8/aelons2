import React, { Component } from "react";
// for input
import InputManager from "@/components/InputManager";
// print the information
import GameOverScreen from "@/components/ReactComponents/GameOverScreen";
import ControlOverlay from "@/components/ReactComponents/ControlOverlay";
// ship and invaders
import Ship from "@/components/GameComponents/Ship";
import Invader from "@/components/GameComponents/Invader";
// may be game
import { checkCollisionsWith, checkCollision } from "@/components/Helper";
import "@/styles/base.css";
let width = 400;
let height = 800;
const GameState = {
  StartScreen: 0,
  Playing: 1,
  GameOver: 2,
};
class App extends Component {
  constructor() {
    super();
    this.state = {
      input: new InputManager(),
      screen: {
        width: width,
        height: height,
        ratio: 1,
      },
      score: 0,
      gameState: GameState.StartScreen,
      previousState: GameState.StartScreen,
      context: null,
    };

    this.ship = null;
    this.invaders = [];
    this.lastStateChange = 0;
    this.previousDelta = 0;
    this.fpsLimit = 30;
    this.showControls = false;
  }

  handleResize() {
    this.setState({
      screen: {
        width: width,
        height: height,
        ratio: 1,
      },
    });
  }

  startGame() {
    let ship = new Ship({
      onDie: this.die.bind(this),
      position: {
        x: this.state.screen.width / 2,
        y: this.state.screen.height - 50,
      },
    });
    this.ship = ship;

    this.createInvaders(25);

    this.setState({
      gameState: GameState.Playing,
      score: 0,
    });
    this.showControls = true;
  }

  die() {
    this.setState({ gameState: GameState.GameOver });
    this.ship = null;
    this.invaders = [];
    this.lastStateChange = Date.now();
  }

  increaseScore(val) {
    this.setState({ score: this.state.score + 20 });
  }

  update(currentDelta) {
    var delta = currentDelta - this.previousDelta;

    if (this.fpsLimit && delta < 1000 / this.fpsLimit) {
      return;
    }

    const keys = this.state.input.pressedKeys;
    const context = this.state.context;

    if (
      this.state.gameState === GameState.StartScreen &&
      keys.enter &&
      Date.now() - this.lastStateChange > 2000
    ) {
      this.startGame();
    }

    if (this.state.gameState === GameState.GameOver && keys.enter) {
      this.setState({ gameState: GameState.StartScreen });
    }

    if (
      this.state.gameState === GameState.Playing &&
      Date.now() - this.lastStateChange > 500
    ) {
      if (this.state.previousState !== GameState.Playing) {
        this.lastStateChange = Date.now();
      }

      if (this.invaders.length === 0) {
        this.setState({ gameState: GameState.GameOver });
      }

      context.save();
      context.scale(this.state.screen.ratio, this.state.screen.ratio);

      // Clear the canvas
      context.fillStyle = "black";
      context.fillRect(0, 0, this.state.screen.width, this.state.screen.height);

      // Draw the score
      context.fillStyle = "white";
      context.font = "24px Arial";
      context.textAlign = "left";
      context.fillText(`Score: ${this.state.score}`, 20, 40);

      // Handle game elements
      checkCollisionsWith(this.ship.bullets, this.invaders);
      checkCollisionsWith([this.ship], this.invaders);

      if (keys.space || keys.left || keys.right) {
        this.showControls = false;
      }

      for (var i = 0; i < this.invaders.length; i++) {
        checkCollisionsWith(this.invaders[i].bullets, [this.ship]);
      }

      if (this.ship !== null) {
        this.ship.update(keys);
        this.ship.render(this.state);
      }

      this.renderInvaders(this.state);
      this.setState({ previousState: this.state.gameState });
      context.restore();
    }

    requestAnimationFrame(() => {
      this.update();
    });
  }

  createInvaders(count) {
    const newPosition = { x: 100, y: 0 };
    let swapStartX = true;

    for (var i = 0; i < count; i++) {
      const invader = new Invader({
        position: { x: newPosition.x, y: newPosition.y },
        onDie: this.increaseScore.bind(this, false),
      });

      newPosition.x += invader.radius + 5;

      if (newPosition.x + invader.radius + 50 >= this.state.screen.width) {
        newPosition.x = swapStartX ? 110 : 100;
        swapStartX = !swapStartX;
        newPosition.y += invader.radius + 5;
      }

      this.invaders.push(invader);
    }
  }

  renderInvaders(state) {
    let index = 0;
    let reverse = false;

    for (let invader of this.invaders) {
      if (invader.delete) {
        this.invaders.splice(index, 1);
      } else if (
        invader.position.x + invader.radius >= this.state.screen.width ||
        invader.position.x - invader.radius <= 0
      ) {
        reverse = true;
      } else {
        this.invaders[index].update();
        this.invaders[index].render(state);
      }
      index++;
    }

    if (reverse) {
      this.reverseInvaders();
    }
  }

  reverseInvaders() {
    let index = 0;
    for (let invader of this.invaders) {
      this.invaders[index].reverse();
      this.invaders[index].position.y += 50;
      index++;
    }
  }

  componentDidMount() {
    window.addEventListener("resize", this.handleResize.bind(this));
    this.state.input.bindKeys();
    const context = this.refs.canvas.getContext("2d");
    this.setState({ context: context });

    requestAnimationFrame(() => {
      this.update();
    });
  }

  componentWillUnmount() {
    this.state.input.unbindKeys();
    window.removeEventListener("resize", this.handleResize);
  }

  handleButtonClick(action) {
    const keys = this.state.input.pressedKeys;
    switch (action) {
      case "start":
        this.startGame();
        break;
      case "fire":
        keys.space = true; // Simulate fire button press
        break;
      case "left":
        keys.left = true; // Simulate left arrow press
        break;
      case "right":
        keys.right = true; // Simulate right arrow press
        break;
      default:
        break;
    }

    // Release keys after the action to stop continuous movement
    setTimeout(() => {
      if (action === "left") {
        keys.left = false;
      }
      if (action === "right") {
        keys.right = false;
      }
      if (action === "fire") {
        keys.space = false;
      }
    }, 100); // Reset after a short delay (can adjust the timing as needed)
  }

  render() {
    return (
      <div>
        {this.showControls && <ControlOverlay />}
        {this.state.gameState === GameState.GameOver && (
          <GameOverScreen score={this.state.score} />
        )}

        {/* Canvas for the game */}
        <canvas
          ref="canvas"
          width={this.state.screen.width * this.state.screen.ratio}
          height={this.state.screen.height * this.state.screen.ratio}
        />
        {/* Button overlay */}
        {this.state.gameState === GameState.StartScreen && (
          <>
            <p
              style={{
                color: "cyan",
                position: "absolute",
                top: "30%",
                fontSize: "20px",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              $AELON Invaders
            </p>
            <p
              style={{
                color: "cyan",
                position: "absolute",
                top: "20%",
                fontSize: "20px",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              Start the game
            </p>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <button onClick={() => this.handleButtonClick("start")}>
                Start
              </button>
            </div>
          </>
        )}

        {this.state.gameState === GameState.Playing && (
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
              display: "flex",
              justifyContent: "space-between", // Distribute buttons evenly
              padding: "0 20px", // Add padding for spacing
            }}
          >
            {/* Left and Right movement buttons */}
            <div style={{ display: "flex", gap: "3px" }}>
              <button
                onClick={() => this.handleButtonClick("left")}
                style={{
                  border: "2px solid white",
                  color: "white",
                  padding: "10px",
                  fontSize: "18px",
                  cursor: "pointer",
                }}
              >
                Left
              </button>
              <button
                onClick={() => this.handleButtonClick("right")}
                style={{
                  border: "2px solid white",
                  color: "white",
                  padding: "10px",
                  fontSize: "18px",
                  cursor: "pointer",
                }}
              >
                Right
              </button>
            </div>

            {/* Fire button */}
            <button
              onClick={() => this.handleButtonClick("fire")}
              style={{
                border: "2px solid white",
                color: "white",
                padding: "10px",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              Fire
            </button>
          </div>
        )}
      </div>
    );
  }
}

export default App;
