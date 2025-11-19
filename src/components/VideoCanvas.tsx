import { useEffect, useRef, useState } from 'react';

interface Chain {
  name: string;
  data: string;
}

interface VideoCanvasProps {
  currentChain: Chain | null;
  chainScale: number;
  verticalOffset: number;
  onCameraReady: () => void;
}

export const VideoCanvas = ({
  currentChain,
  chainScale,
  verticalOffset,
  onCameraReady,
}: VideoCanvasProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const faceMeshRef = useRef<any>(null);
  const chainImageRef = useRef<HTMLImageElement>(new Image());
  const isProcessingRef = useRef(false);
  const chainScaleRef = useRef(chainScale);
  const verticalOffsetRef = useRef(verticalOffset);

  useEffect(() => {
    if (currentChain) {
      chainImageRef.current.src = currentChain.data;
    }
  }, [currentChain]);

  // Keep latest slider values in refs so MediaPipe callback sees updates
  useEffect(() => {
    chainScaleRef.current = chainScale;
  }, [chainScale]);

  useEffect(() => {
    verticalOffsetRef.current = verticalOffset;
  }, [verticalOffset]);

  const startCamera = async () => {
    try {
      setError(null);

      // --- Load MediaPipe scripts from CDN and use global constructors ---
      const loadScript = (src: string) =>
        new Promise<void>((resolve, reject) => {
          // Avoid adding the same script multiple times
          if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
          }

          const script = document.createElement('script');
          script.src = src;
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error(`Failed to load ${src}`));
          document.body.appendChild(script);
        });

      // Load FaceMesh and Camera utilities from jsDelivr (browser build)
      await loadScript(
        'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js'
      );
      await loadScript(
        'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js'
      );

      const FaceMeshCtor = (window as any).FaceMesh;
      const CameraCtor = (window as any).Camera;

      console.log('Global FaceMeshCtor:', FaceMeshCtor);
      console.log('Global CameraCtor:', CameraCtor);

      if (typeof FaceMeshCtor !== 'function' || typeof CameraCtor !== 'function') {
        throw new Error(
          'MediaPipe globals not found. Check CDN URLs or network connectivity.'
        );
      }

      const faceMesh = new FaceMeshCtor({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        },
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults(onResults);
      faceMeshRef.current = faceMesh;

      if (videoRef.current) {
        // Request camera with wider field of view to show neck area
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            aspectRatio: { ideal: 16/9 },
            facingMode: 'user',
          }
        });
        
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        const camera = new CameraCtor(videoRef.current, {
          onFrame: async () => {
            if (!isProcessingRef.current && videoRef.current) {
              isProcessingRef.current = true;
              await faceMesh.send({ image: videoRef.current });
              isProcessingRef.current = false;
            }
          },
          width: 1280,
          height: 720,
        });

        await camera.start();
        setIsStarted(true);
        onCameraReady();
      }
    } catch (err) {
      console.error('Camera error in startCamera:', err);
      setError(
        'Camera access failed or MediaPipe could not load. Please check camera permissions and internet connection, then refresh and try again.'
      );
    }
  };

  const onResults = (results: any) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx) return;

    canvas.width = results.image.width;
    canvas.height = results.image.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];
      drawChain(landmarks, canvas.width, canvas.height, ctx);
    }
  };

  const drawChain = (
    landmarks: any[],
    w: number,
    h: number,
    ctx: CanvasRenderingContext2D
  ) => {
    const JAW_LEFT = 234;
    const JAW_RIGHT = 454;
    const CHIN = 152;
    const NOSE_TIP = 4;

    const jawL = { x: landmarks[JAW_LEFT].x * w, y: landmarks[JAW_LEFT].y * h };
    const jawR = { x: landmarks[JAW_RIGHT].x * w, y: landmarks[JAW_RIGHT].y * h };
    const chin = { x: landmarks[CHIN].x * w, y: landmarks[CHIN].y * h };
    const nose = { x: landmarks[NOSE_TIP].x * w, y: landmarks[NOSE_TIP].y * h };

    const jawMidX = (jawL.x + jawR.x) / 2;
    const faceLength = Math.sqrt(
      (nose.x - chin.x) ** 2 + (nose.y - chin.y) ** 2
    );
    const jawWidth = Math.sqrt(
      (jawR.x - jawL.x) ** 2 + (jawR.y - jawL.y) ** 2
    );

    let verticalOff = faceLength * 0.3;
    const widthFactor = Math.min(jawWidth / w, 0.3);
    verticalOff += widthFactor * faceLength * 0.8;

    // Stronger user-controlled vertical adjustment (up/down on chest)
    const userOffsetPx = verticalOffsetRef.current * faceLength * 3;

    const neckX = jawMidX;
    const neckY = chin.y + verticalOff + userOffsetPx;

    const targetW = jawWidth * (1.4 + (jawWidth / w) * 0.8);
    const targetH =
      (chainImageRef.current.height * targetW) / chainImageRef.current.width;

    // Apply user's scale adjustment
    const chainW = targetW * chainScaleRef.current;
    const chainH = targetH * chainScaleRef.current;

    const angle = Math.atan2(jawR.y - jawL.y, jawR.x - jawL.x);

    ctx.save();
    ctx.translate(neckX, neckY + faceLength * 0.15);
    ctx.rotate(angle);
    ctx.drawImage(chainImageRef.current, -chainW / 2, 0, chainW, chainH);
    ctx.restore();
  };

  return (
    <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden">
      {!isStarted && (
        <button
          onClick={startCamera}
          className="absolute z-10 px-10 py-5 text-lg font-bold rounded-xl bg-black/20 backdrop-blur-md border-2 border-gold text-white shadow-lg shadow-gold/50 hover:shadow-gold/70 hover:bg-gold/10 transition-all hover:scale-105 active:scale-95"
        >
          🎥 Start Camera
        </button>
      )}

      {error && (
        <div className="absolute z-10 top-4 left-4 right-4 bg-destructive/90 backdrop-blur text-destructive-foreground p-4 rounded-lg">
          {error}
        </div>
      )}

      <video ref={videoRef} className="hidden" autoPlay playsInline />

      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover md:object-contain"
      />
    </div>
  );
};
