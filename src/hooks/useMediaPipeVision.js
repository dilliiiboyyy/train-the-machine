import { useState, useEffect, useRef, useCallback } from 'react';
import { analyzeFrame, initMediaPipeVision } from '../ml/hybridVision';

/**
 * Custom React Hook: useMediaPipeVision
 *
 * Initializes the MediaPipe vision task runner (PoseLandmarker and GestureRecognizer),
 * handles webcam stream acquisition, and provides real-time access to pose landmarks
 * and hand gestures in a performant browser-based loop without a backend.
 *
 * @param {Object} options
 * @param {boolean} [options.autoStart=false] - Automatically request webcam on mount
 * @param {number} [options.targetFps=30] - Frame processing frequency target
 * @param {boolean} [options.enableHands=true] - Track hands and gestures
 * @param {boolean} [options.enablePose=true] - Track body pose landmarks
 */
export function useMediaPipeVision(options = {}) {
  const {
    autoStart = false,
    targetFps = 30,
    enableHands = true,
    enablePose = true
  } = options;

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const lastProcessTimeRef = useRef(0);

  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // Real-time perception states
  const [poseLandmarks, setPoseLandmarks] = useState(null);
  const [handGestures, setHandGestures] = useState(null);
  const [primaryHand, setPrimaryHand] = useState(null);
  const [perceptionData, setPerceptionData] = useState(null);

  // Performance metrics
  const [fps, setFps] = useState(0);
  const frameCountRef = useRef(0);
  const lastFpsTimestampRef = useRef(performance.now());

  // 1. Initialize MediaPipe Task Runner
  useEffect(() => {
    let isMounted = true;

    initMediaPipeVision()
      .then(() => {
        if (isMounted) setIsModelLoaded(true);
      })
      .catch((err) => {
        console.warn('MediaPipe initialization fallback active:', err);
        if (isMounted) setIsModelLoaded(true); // CV fallback remains available
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Stop Webcam Stream
  const stopWebcam = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }

    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (err) {
        console.warn('Error releasing webcam tracks:', err);
      }
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsStreaming(false);
    setPoseLandmarks(null);
    setHandGestures(null);
    setPrimaryHand(null);
    setPerceptionData(null);
    setFps(0);
  }, []);

  // 3. Acquire Webcam Stream
  const startWebcam = useCallback(async () => {
    setCameraError(null);

    if (typeof window !== 'undefined' && window.isSecureContext === false) {
      const msg = 'Camera requires a secure context (HTTPS or localhost).';
      setCameraError(msg);
      return false;
    }

    if (!navigator?.mediaDevices?.getUserMedia) {
      const msg = 'getUserMedia is not supported on this browser.';
      setCameraError(msg);
      return false;
    }

    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          },
          audio: false
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      setIsStreaming(true);
      return true;
    } catch (err) {
      console.warn('useMediaPipeVision webcam error:', err);
      let errMsg = 'Failed to acquire camera.';

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errMsg = 'Camera permission was denied. Please allow camera access.';
      } else if (err.name === 'NotFoundError') {
        errMsg = 'No camera device found.';
      } else if (err.name === 'NotReadableError') {
        errMsg = 'Camera is currently in use by another program.';
      }

      setCameraError(errMsg);
      setIsStreaming(false);
      return false;
    }
  }, []);

  // 4. Performant Inference Loop
  useEffect(() => {
    if (!isStreaming) {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      return;
    }

    const intervalMs = 1000 / targetFps;
    let isRunning = true;

    const processFrame = (now) => {
      if (!isRunning) return;

      if (now - lastProcessTimeRef.current >= intervalMs) {
        lastProcessTimeRef.current = now;

        const video = videoRef.current;
        if (video && video.readyState >= 2 && video.videoWidth > 0) {
          const result = analyzeFrame(video);

          if (result) {
            setPerceptionData(result);

            if (enablePose) {
              setPoseLandmarks(result.poseLandmarks || null);
            }

            if (enableHands) {
              setHandGestures(result.gesture || null);
              setPrimaryHand(result.primaryHand || null);
            }

            // Calculate FPS
            frameCountRef.current++;
            const timeSinceLastFps = now - lastFpsTimestampRef.current;
            if (timeSinceLastFps >= 1000) {
              setFps(Math.round((frameCountRef.current * 1000) / timeSinceLastFps));
              frameCountRef.current = 0;
              lastFpsTimestampRef.current = now;
            }
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(processFrame);
    };

    animFrameIdRef.current = requestAnimationFrame(processFrame);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [isStreaming, targetFps, enableHands, enablePose]);

  // Handle autoStart option
  useEffect(() => {
    if (autoStart) {
      startWebcam();
    }
    return () => {
      stopWebcam();
    };
  }, [autoStart, startWebcam, stopWebcam]);

  return {
    videoRef,
    stream: streamRef.current,
    isStreaming,
    isModelLoaded,
    cameraError,
    startWebcam,
    stopWebcam,
    poseLandmarks,
    handGestures,
    primaryHand,
    perceptionData,
    fps
  };
}

export default useMediaPipeVision;
