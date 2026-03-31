"use client";

import React, { useState, useEffect, useRef } from "react";

const CHARS = "ABCDEF0123456789<>-_\\/[]{}—=+*^?#_";

interface ScrambleTextProps {
  text: string;
  isHovered: boolean;
  className?: string;
}

const ScrambleText: React.FC<ScrambleTextProps> = ({ text, isHovered, className }) => {
  const [displayText, setDisplayText] = useState(text);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isHovered) {
      let iteration = 0;
      clearInterval(intervalRef.current as NodeJS.Timeout);

      intervalRef.current = setInterval(() => {
        setDisplayText((prev) =>
          text
            .split("")
            .map((letter, index) => {
              if (index < iteration) {
                return text[index];
              }
              if (letter === " ") return " ";
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join("")
        );

        if (iteration >= text.length) {
          clearInterval(intervalRef.current as NodeJS.Timeout);
        }

        iteration += 1 / 3;
      }, 30);
    } else {
      setDisplayText(text);
      clearInterval(intervalRef.current as NodeJS.Timeout);
    }

    return () => clearInterval(intervalRef.current as NodeJS.Timeout);
  }, [isHovered, text]);

  return <span className={className || ""}>{displayText}</span>;
};

export default ScrambleText;
