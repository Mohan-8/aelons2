// eslint-disable-next-line
import React, { Component } from "react";

export default class TitleScreen extends React.Component {
  render() {
    return (
      <div>
        <span className="centerScreen title">$AELON Invaders</span>
        <span className="centerScreen pressSpace">
          Press Enter to start the game!
        </span>
      </div>
    );
  }
}
