import React from "react";

const ControlOverlay = ({ onControl }) => {
  return (
    <div className="control-overlay">
      <button
        onMouseDown={() => onControl("left")}
        onMouseUp={() => onControl("")}
      >
        Left
      </button>
      <button
        onMouseDown={() => onControl("fire")}
        onMouseUp={() => onControl("")}
      >
        Fire
      </button>
      <button
        onMouseDown={() => onControl("right")}
        onMouseUp={() => onControl("")}
      >
        Right
      </button>
    </div>
  );
};

export default ControlOverlay;
