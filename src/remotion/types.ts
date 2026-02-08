export interface SlideData {
  title: string;
  content: string; // HTML content
  notes: string;   // Speaker script
  audioDurationInFrames?: number;
  audioUrl?: string;
}

export interface VideoCompositionProps {
  slides: SlideData[];
  fps: number;
  totalDurationInFrames: number;
}
