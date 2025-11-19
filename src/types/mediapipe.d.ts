declare module '@mediapipe/face_mesh' {
  export class FaceMesh {
    constructor(config: {
      locateFile: (file: string) => string;
    });
    setOptions(options: {
      maxNumFaces?: number;
      refineLandmarks?: boolean;
      minDetectionConfidence?: number;
      minTrackingConfidence?: number;
    }): void;
    onResults(callback: (results: any) => void): void;
    send(data: { image: HTMLVideoElement }): Promise<void>;
  }
}

declare module '@mediapipe/camera_utils' {
  export class Camera {
    constructor(
      video: HTMLVideoElement,
      config: {
        onFrame: () => Promise<void>;
        width?: number;
        height?: number;
        facingMode?: string;
      }
    );
    start(): Promise<void>;
  }
}
