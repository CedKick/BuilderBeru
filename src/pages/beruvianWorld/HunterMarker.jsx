import React from "react";

export default function HunterMarker({ x, y, size = 64 }) {
  return (
    <img loading="lazy"
      src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606352/icons/build-31.png"
      alt="Hunter"
      style={{
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
        width: `${size}px`,
        height: `${size}px`,
        transform: "translate(-50%, -50%)",
        imageRendering: "pixelated",
        pointerEvents: "none",
        zIndex: 10
      }}
    />
  );
}