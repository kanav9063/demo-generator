import React from "react";
import { Sequence } from "remotion";
import { SlideScene } from "./SlideScene";
import { TitleSlide } from "./TitleSlide";
import type { VideoCompositionProps } from "./types";

export const DemoVideo: React.FC<VideoCompositionProps> = ({
  slides,
  fps,
  presentationTitle,
}) => {
  let currentFrame = 0;
  const titleDuration = Math.ceil(fps * 3); // 3 second title slide
  const totalSlides = slides.length;

  const sequences: React.ReactNode[] = [];

  // Title slide
  if (presentationTitle) {
    sequences.push(
      <Sequence
        key="title"
        from={currentFrame}
        durationInFrames={titleDuration}
        name="Title"
      >
        <TitleSlide
          title={presentationTitle}
          subtitle={`${totalSlides} slides • Auto-generated`}
          durationInFrames={titleDuration}
        />
      </Sequence>
    );
    currentFrame += titleDuration;
  }

  // Content slides
  slides.forEach((slide, i) => {
    const duration = slide.audioDurationInFrames || fps * 8;
    sequences.push(
      <Sequence
        key={`slide-${i}`}
        from={currentFrame}
        durationInFrames={duration}
        name={`Slide ${i + 1}: ${slide.title}`}
      >
        <SlideScene
          slide={slide}
          durationInFrames={duration}
          slideIndex={i}
          totalSlides={totalSlides}
        />
      </Sequence>
    );
    currentFrame += duration;
  });

  return <>{sequences}</>;
};
