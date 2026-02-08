import React from "react";
import { Composition } from "remotion";
import { DemoVideo } from "./DemoVideo";
import type { VideoCompositionProps } from "./types";

const defaultProps: VideoCompositionProps = {
  slides: [
    {
      title: "Welcome",
      content:
        "<ul><li>This is a demo video</li><li>Generated automatically</li></ul>",
      notes: "Welcome to this automatically generated demo video.",
      audioDurationInFrames: 150,
    },
    {
      title: "Code Example",
      content:
        '<pre><code>const hello = "world";\nconsole.log(hello);</code></pre>',
      notes: "Here we see a simple code example.",
      audioDurationInFrames: 150,
    },
  ],
  fps: 30,
  totalDurationInFrames: 390,
  presentationTitle: "Demo Presentation",
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="DemoVideo"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component={DemoVideo as any}
      durationInFrames={390}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={defaultProps}
    />
  );
};
