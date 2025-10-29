import React from "react";
import "./Toggle.css";

export default function Toggle({ isOn, onToggle }) {
  return (
    <div
      className={`toggle ${isOn ? "on" : ""}`}
      onClick={() => onToggle(!isOn)}
    >
      <div className="slider"></div>
    </div>
  );
}
