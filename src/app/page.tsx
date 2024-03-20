"use client";

import { FONTS } from "@/fonts";
import NextImage from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

let startTime: number;
const delay = 200;

export default function Home() {
  const [text, setText] = useState("0xtype");
  const [assetLoaded, setAssetLoaded] = useState(false);
  const [fontIndex, setFontIndex] = useState(
    new Array(text.length)
      .fill(0)
      .map((_) => Math.floor(Math.random() * FONTS.length))
  );
  const [iconIndex, setIconIndex] = useState(-1);

  const paused = useRef(false);

  const setRandoms = useCallback(() => {
    setFontIndex(
      new Array(text.length)
        .fill(0)
        .map((_) => Math.floor(Math.random() * FONTS.length))
    );
  }, [text]);

  const draw = useCallback(
    (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp;
      }

      let currentTime = timestamp - startTime;

      if (currentTime > delay) {
        const capitalIndex = Math.floor(Math.random() * text.length);
        setText(
          text
            .toLowerCase()
            .split("")
            .map((letter, index) =>
              index === capitalIndex ? letter.toUpperCase() : letter
            )
            .join("")
        );
        setRandoms();
        startTime = timestamp;
      }
      if (!paused.current) {
        animationFrame.current = requestAnimationFrame(draw);
      }
    },
    [paused, setRandoms, text]
  );

  const animationFrame = useRef<number>();

  useEffect(() => {
    if (!paused.current) {
      animationFrame.current = requestAnimationFrame(draw);
    }
    () => {
      animationFrame.current && cancelAnimationFrame(animationFrame.current);
    };
  }, [paused, draw]);

  useEffect(() => {
    async function loadAssets() {
      await Promise.all([
        ...FONTS.map((font) => {
          const fontFace = new FontFace(
            font.family,
            `url(${window.location.origin}/fonts/${font.url})`
          );
          document.fonts.add(fontFace);
          return fontFace.load();
        }),
        ...new Array(6).fill(0).map((_, index) => {
          const img = new Image();
          img.src = `${window.location.origin}/icons/${index + 1}.svg`;
          return new Promise((resolve) => {
            img.onload = () => {
              resolve(null);
            };
          });
        }),
      ]);
      setAssetLoaded(true);
    }

    loadAssets();
  }, []);

  const textRef = useRef<HTMLSpanElement>(null);

  const handleMouseOver = (index: number) => {
    paused.current = true;
    setIconIndex(index);
  };
  const handleMouseOut = (index: number) => {
    if (index === iconIndex) return;
    paused.current = false;
    setIconIndex(-1);
    animationFrame.current = requestAnimationFrame(draw);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div />

      <div>
        {assetLoaded && (
          <span
            ref={textRef}
            className="text-8xl"
            style={{ letterSpacing: 10 }}
          >
            {text.split("").map((letter, index) =>
              index !== iconIndex ? (
                <span
                  key={index}
                  style={{
                    display: "inline-block",
                    fontFamily: FONTS[fontIndex[index]].family,
                  }}
                  onMouseOver={() => handleMouseOver(index)}
                  onMouseOut={() => handleMouseOut(index)}
                >
                  {letter}
                </span>
              ) : (
                <NextImage
                  style={{ display: "inline-block" }}
                  width={90}
                  height={90}
                  key={index}
                  src={`${window.location.origin}/icons/${
                    Math.floor(Math.random() * 6) + 1
                  }.svg`}
                  alt="icon"
                  onMouseOut={() => handleMouseOut(-1)}
                />
              )
            )}
          </span>
        )}
      </div>

      <div />
    </main>
  );
}
