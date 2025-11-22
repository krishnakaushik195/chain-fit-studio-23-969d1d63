import { useEffect, useRef, useState } from 'react';

interface Chain {
  name: string;
  data: string;
}

interface Earring {
  name: string;
  data: string;
}

interface VideoCanvasProps {
  currentChain: Chain | null;
  chainScale: number;
  verticalOffset: number;
  currentEarring: Earring | null;
  earringScale: number;
  showEarrings: boolean;
  onCameraReady: () => void;
}

export const VideoCanvas = ({
  currentChain,
  chainScale,
  verticalOffset,
  currentEarring,
  earringScale,
  showEarrings,
  onCameraReady,
}: VideoCanvasProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const faceMeshRef = useRef<any>(null);
  const chainImageRef = useRef<HTMLImageElement>(new Image());
  const earringImageRef = useRef<HTMLImageElement>(new Image());
  const isProcessingRef = useRef(false);
  const chainScaleRef = useRef(chainScale);
  const verticalOffsetRef = useRef(verticalOffset);
  const earringScaleRef = useRef(earringScale);
  const showEarringsRef = useRef(showEarrings);

  useEffect(() => {
    if (currentChain) {
      console.log('🖼️ Loading chain image:', currentChain.name);
      
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Allow CORS
      
      img.onload = () => {
        console.log('✅ Chain image loaded successfully');
        chainImageRef.current = img;
      };
      
      img.onerror = (err) => {
        console.error('❌ Failed to load chain image:', err);
        console.error('Image URL:', currentChain.data);
        setError('Failed to load chain image from Google Drive. The image may not be publicly accessible.');
      };
      
      img.src = currentChain.data;
    }
  }, [currentChain]);

  // Keep latest slider values in refs so MediaPipe callback sees updates
  useEffect(() => {
    chainScaleRef.current = chainScale;
  }, [chainScale]);

  useEffect(() => {
    verticalOffsetRef.current = verticalOffset;
  }, [verticalOffset]);

  useEffect(() => {
    earringScaleRef.current = earringScale;
  }, [earringScale]);

  useEffect(() => {
    showEarringsRef.current = showEarrings;
  }, [showEarrings]);

  // Load earring image
  useEffect(() => {
    if (currentEarring) {
      console.log('👂 Loading earring image:', currentEarring.name);
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        console.log('✅ Earring image loaded successfully');
        earringImageRef.current = img;
      };
      
      img.onerror = (err) => {
        console.error('❌ Failed to load earring image:', err);
        setError('Failed to load earring image.');
      };
      
      img.src = currentEarring.data;
    }
  }, [currentEarring]);

  const startCamera = async () => {
    try {
      console.log('🎥 Starting camera...');
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

      console.log('✅ MediaPipe loaded - FaceMesh:', !!FaceMeshCtor);
      console.log('✅ MediaPipe loaded - Camera:', !!CameraCtor);

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
      console.log('✅ FaceMesh initialized');

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
        console.log('✅ Camera stream started');

        const camera = new CameraCtor(videoRef.current, {
          onFrame: async () => {
            if (!isProcessingRef.current && videoRef.current) {
              isProcessingRef.current = true;
              try {
                await faceMesh.send({ image: videoRef.current });
              } catch (err) {
                console.error('❌ Frame processing error:', err);
              }
              isProcessingRef.current = false;
            }
          },
          width: 1280,
          height: 720,
        });

        await camera.start();
        console.log('✅ Camera processing started');
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

    if (!canvas || !ctx) {
      console.warn('⚠️ Canvas or context not available');
      return;
    }

    canvas.width = results.image.width;
    canvas.height = results.image.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];
      
      // Draw chain if image is loaded
      if (chainImageRef.current && chainImageRef.current.complete && chainImageRef.current.naturalWidth > 0) {
        drawChain(landmarks, canvas.width, canvas.height, ctx);
      }

      // Draw earrings if enabled (either image or gold dots as fallback)
      if (showEarringsRef.current) {
        drawEarrings(landmarks, canvas.width, canvas.height, ctx);
      }
    }
  };

  // Auto-start camera on mount
  useEffect(() => {
    console.log('🚀 Component mounted, starting camera...');
    startCamera();
    
    return () => {
      console.log('🛑 Component unmounting, cleaning up...');
    };
  }, []);

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

  const drawEarrings = (
    landmarks: any[],
    w: number,
    h: number,
    ctx: CanvasRenderingContext2D
  ) => {
    // MediaPipe Face Mesh ear landmarks
    const LEFT_EAR = 234;  // Left ear tragion (upper ear attachment)
    const RIGHT_EAR = 454; // Right ear tragion (upper ear attachment)
    
    const leftEar = { x: landmarks[LEFT_EAR].x * w, y: landmarks[LEFT_EAR].y * h };
    const rightEar = { x: landmarks[RIGHT_EAR].x * w, y: landmarks[RIGHT_EAR].y * h };

    // Calculate size based on face size
    const JAW_LEFT = 234;
    const JAW_RIGHT = 454;
    const jawL = { x: landmarks[JAW_LEFT].x * w, y: landmarks[JAW_LEFT].y * h };
    const jawR = { x: landmarks[JAW_RIGHT].x * w, y: landmarks[JAW_RIGHT].y * h };
    const faceWidth = Math.sqrt((jawR.x - jawL.x) ** 2 + (jawR.y - jawL.y) ** 2);
    
    // Check if earring image is loaded
    const hasEarringImage = earringImageRef.current && 
                            earringImageRef.current.complete && 
                            earringImageRef.current.naturalWidth > 0;

    if (hasEarringImage) {
      // Draw earring images
      const baseEarringSize = faceWidth * 0.15;
      const earringW = baseEarringSize * earringScaleRef.current;
      const earringH = (earringImageRef.current.height * earringW) / earringImageRef.current.width;

      // Draw left earring
      ctx.save();
      ctx.translate(leftEar.x, leftEar.y);
      ctx.drawImage(earringImageRef.current, -earringW / 2, 0, earringW, earringH);
      ctx.restore();

      // Draw right earring (mirrored)
      ctx.save();
      ctx.translate(rightEar.x, rightEar.y);
      ctx.scale(-1, 1);
      ctx.drawImage(earringImageRef.current, -earringW / 2, 0, earringW, earringH);
      ctx.restore();
    } else {
      // Draw gold dots as fallback
      const dotRadius = (faceWidth * 0.02) * earringScaleRef.current;
      
      // Gold color
      ctx.fillStyle = '#D4AF37';
      ctx.shadowColor = '#D4AF37';
      ctx.shadowBlur = 15;
      
      // Draw left dot
      ctx.beginPath();
      ctx.arc(leftEar.x, leftEar.y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw right dot
      ctx.beginPath();
      ctx.arc(rightEar.x, rightEar.y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Reset shadow
      ctx.shadowBlur = 0;
    }
  };

  return (
    <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden">
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
