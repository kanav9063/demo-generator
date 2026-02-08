import React from "react";
import { Sequence } from "remotion";
import { SlideScene } from "./SlideScene";
import type { VideoCompositionProps } from "./types";

export const DemoVideo: React.FC<VideoCompositionProps> = ({ slides, fps }) => {
  let currentFrame = 0;

  return (
    <>
      {slides.map((slide, i) => {
        const duration = slide.audioDurationInFrames || fps * 8; // default 8s per slide
        const startFrame = currentFrame;
        currentFrame += duration;

        return (
          <Sequence
            key={i}
            from={startFrame}
            durationInFrames={duration}
            name={`Slide ${i + 1}: ${slide.title}`}
          >
            <SlideScene slide={slide} durationInFrames={duration} />
          </Sequence>
        );
      })}
    </>
  );
};
