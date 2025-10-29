import React from "react";
import "./Toggle.css";

interface ToggleProps {
  isOn: boolean;
  onToggle: (value: boolean) => void;
}

export default function Toggle({ isOn, onToggle }: ToggleProps) {
  return (
    <div
      className={`toggle ${isOn ? "on" : ""}`}
      onClick={() => onToggle(!isOn)}
    >
      <div className="slider"></div>
    </div>
  );
}
