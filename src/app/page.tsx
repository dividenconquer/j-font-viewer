"use client";

import { FONTS } from "@/fonts";
import { isEmpty } from "lodash";
import { useEffect, useRef, useState } from "react";

let startTime: number;

export default function Home() {
  const text = isEmpty(localStorage.getItem("text")?.trim())
    ? "oxfont"
    : localStorage.getItem("text")!;
  const [paused, setPaused] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [fontIndex, setFontIndex] = useState(
    new Array(text.length)
      .fill(0)
      .map((_) => Math.floor(Math.random() * FONTS.length))
  );

  const draw = (timestamp: number) => {
    if (!startTime) {
      startTime = timestamp;
    }

    let currentTime = timestamp - startTime;

    if (currentTime > 100) {
      setRandoms();
      startTime = timestamp;
    }
    if (!paused) {
      animationFrame.current = requestAnimationFrame(draw);
    }
  };

  const animationFrame = useRef<number>();

  useEffect(() => {
    if (!paused) {
      animationFrame.current = requestAnimationFrame(draw);
    }
  }, [paused, draw]);

  const setRandoms = () => {
    setFontIndex(
      new Array(text.length)
        .fill(0)
        .map((_) => Math.floor(Math.random() * FONTS.length))
    );
  };

  useEffect(() => {
    Promise.all(
      FONTS.map((font) => {
        const fontFace = new FontFace(
          font.family,
          `url(http://localhost:3000/fonts/${font.url})`
        );
        document.fonts.add(fontFace);
        return fontFace.load();
      })
    ).then(() => {
      setFontLoaded(true);
    });
  }, []);

  const textRef = useRef<HTMLSpanElement>(null);

  const onBlur = () => {
    const text = isEmpty(textRef.current?.innerText)
      ? "oxfont"
      : textRef.current!.innerText!;
    localStorage.setItem("text", text);
  };

  const onFocus = () => {
    console.log(1);
    animationFrame.current && cancelAnimationFrame(animationFrame.current);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div />

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
        {fontLoaded && (
          <span
            ref={textRef}
            className="text-8xl"
            onMouseUp={() => {
              setPaused(true);
            }}
          >
            {text.split("").map((letter, index) => (
              <span
                key={index}
                style={{
                  fontFamily: FONTS[fontIndex[index]].family,
                }}
              >
                {letter}
              </span>
            ))}
          </span>
        )}
      </div>

      <div />
    </main>
  );
}
