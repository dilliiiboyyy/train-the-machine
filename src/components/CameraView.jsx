import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera,
  PlayCircle,
  AlertCircle,
  Sparkles,
  RefreshCw,
  UserCheck,
  Activity,
  Hand,
  Timer,
  CheckCircle2,
  Sliders,
  Sun,
  Focus,
  Gauge
} from 'lucide-react';
import { sound } from '../utils/sound';
import { analyzeFrame, drawHybridSkeleton } from '../ml/hybridVision';
import { CameraControls } from './CameraControls';
import { readCameraSensors, getSyntheticSensors } from '../ml/cameraSensors';

export function CameraView({
  stream = null,
  videoRef: externalVideoRef = null,
  isCameraActive = false,
  isDemoMode = false,
  demoImage = null,
  activeClass = null,
  capturedCount = 0,
  targetCount = 5,
  onCapture = null,
  onCaptureSequence = null,
  onEnableCamera = null,
  onUseDemoMode = null,
  onResetCamera = null,
  onStopCamera = null,
  cameraState = 'idle',
  cameraError = null,
  isScanning = false,
  showCaptureButton = true,
  onSwitchClass = null,
  onProceedToTrain = null,
  nextClassLabel = null,
  onPerceptionUpdate = null,
  onSensorsUpdate = null
}) {
  const localVideoRef = useRef(null);
  const [videoEl, setVideoEl] = useState(null);
  const overlayCanvasRef = useRef(null);

  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const [lastSnapshot, setLastSnapshot] = useState(null);

  // Dynamic Recording state (for walking/clapping/waving 1.5s sequences)
  const [isRecordingSequence, setIsRecordingSequence] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);

  // Perception diagnostic state with high-clarity pixel tracking
  const [trackPixelsMode, setTrackPixelsMode] = useState(true);
  const [perceptionState, setPerceptionState] = useState({
    hasPerson: false,
    hasHands: false,
    isFaceOnly: false,
    gesture: null,
    trackedPixelCount: 0,
    handPixelCount: 0
  });

  // Real-time camera sensors state (Lux, Optical Sharpness, Motion Delta, Hardware Stream)
  const [showSensorsHud, setShowSensorsHud] = useState(true);
  const [cameraSensors, setCameraSensors] = useState(() => getSyntheticSensors());

  const latestPerceptionRef = useRef(null);
  const sequenceBufferRef = useRef([]);
  const animLoopRef = useRef(null);

  // Interactive Demo Mode pose variation cycle
  const [demoPoseIndex, setDemoPoseIndex] = useState(0);

  // Synchronize incoming MediaStream with HTML5 Video DOM Element
  useEffect(() => {
    const video = videoEl || externalVideoRef?.current || localVideoRef.current;
    if (!video) return;

    if (stream && isCameraActive && !isDemoMode) {
      if (video.srcObject !== stream) {
        video.srcObject = stream;
      }
      video.play().catch(() => {});
      setVideoLoaded(true);
    } else {
      if (!isCameraActive && video.srcObject) {
        video.srcObject = null;
      }
      if (!isCameraActive) {
        setVideoLoaded(false);
      }
    }
  }, [videoEl, externalVideoRef, stream, isCameraActive, isDemoMode]);

  // Synthetic perception generator for interactive Demo Mode
  const generateDemoPerception = useCallback((timestamp) => {
    const time = timestamp / 1000;
    const sway = Math.sin(time * 2) * 0.015;
    const legSway = Math.sin(time * 3) * 0.03;
    const className = (activeClass?.name || 'STANDING').toUpperCase();

    let landmarks = [];
    let handData = null;
    let isTorso = true;
    let isLegs = true;
    let detectedGesture = null;

    if (className.includes('SIT')) {
      landmarks = [
        { x: 0.5 + sway, y: 0.25, score: 0.96, name: 'nose' },
        { x: 0.48 + sway, y: 0.23, score: 0.94, name: 'left_eye' },
        { x: 0.52 + sway, y: 0.23, score: 0.94, name: 'right_eye' },
        { x: 0.45 + sway, y: 0.24, score: 0.9, name: 'left_ear' },
        { x: 0.55 + sway, y: 0.24, score: 0.9, name: 'right_ear' },
        { x: 0.41 + sway, y: 0.38, score: 0.95, name: 'left_shoulder' },
        { x: 0.59 + sway, y: 0.38, score: 0.95, name: 'right_shoulder' },
        { x: 0.37 + sway, y: 0.52, score: 0.9, name: 'left_elbow' },
        { x: 0.63 + sway, y: 0.52, score: 0.9, name: 'right_elbow' },
        { x: 0.42 + sway, y: 0.64, score: 0.92, name: 'left_wrist' },
        { x: 0.58 + sway, y: 0.64, score: 0.92, name: 'right_wrist' },
        { x: 0.42 + sway, y: 0.66, score: 0.96, name: 'left_hip' },
        { x: 0.58 + sway, y: 0.66, score: 0.96, name: 'right_hip' },
        { x: 0.38 + sway, y: 0.68, score: 0.92, name: 'left_knee' },
        { x: 0.62 + sway, y: 0.68, score: 0.92, name: 'right_knee' },
        { x: 0.39 + sway, y: 0.86, score: 0.88, name: 'left_ankle' },
        { x: 0.61 + sway, y: 0.86, score: 0.88, name: 'right_ankle' }
      ];
    } else if (className.includes('CLAP')) {
      const clapDist = Math.abs(Math.sin(time * 6)) * 0.12;
      landmarks = [
        { x: 0.5 + sway, y: 0.2, score: 0.96, name: 'nose' },
        { x: 0.48 + sway, y: 0.18, score: 0.94, name: 'left_eye' },
        { x: 0.52 + sway, y: 0.18, score: 0.94, name: 'right_eye' },
        { x: 0.45 + sway, y: 0.19, score: 0.9, name: 'left_ear' },
        { x: 0.55 + sway, y: 0.19, score: 0.9, name: 'right_ear' },
        { x: 0.42 + sway, y: 0.32, score: 0.95, name: 'left_shoulder' },
        { x: 0.58 + sway, y: 0.32, score: 0.95, name: 'right_shoulder' },
        { x: 0.44 + sway, y: 0.46, score: 0.92, name: 'left_elbow' },
        { x: 0.56 + sway, y: 0.46, score: 0.92, name: 'right_elbow' },
        { x: 0.5 - clapDist + sway, y: 0.46, score: 0.95, name: 'left_wrist' },
        { x: 0.5 + clapDist + sway, y: 0.46, score: 0.95, name: 'right_wrist' },
        { x: 0.44 + sway, y: 0.6, score: 0.95, name: 'left_hip' },
        { x: 0.56 + sway, y: 0.6, score: 0.95, name: 'right_hip' },
        { x: 0.44 + sway, y: 0.78, score: 0.95, name: 'left_knee' },
        { x: 0.56 + sway, y: 0.78, score: 0.95, name: 'right_knee' },
        { x: 0.44 + sway, y: 0.94, score: 0.9, name: 'left_ankle' },
        { x: 0.56 + sway, y: 0.94, score: 0.9, name: 'right_ankle' }
      ];
    } else if (className.includes('WALK')) {
      landmarks = [
        { x: 0.5 + sway, y: 0.18, score: 0.96, name: 'nose' },
        { x: 0.48 + sway, y: 0.16, score: 0.94, name: 'left_eye' },
        { x: 0.52 + sway, y: 0.16, score: 0.94, name: 'right_eye' },
        { x: 0.45 + sway, y: 0.17, score: 0.9, name: 'left_ear' },
        { x: 0.55 + sway, y: 0.17, score: 0.9, name: 'right_ear' },
        { x: 0.42 + sway, y: 0.3, score: 0.95, name: 'left_shoulder' },
        { x: 0.58 + sway, y: 0.3, score: 0.95, name: 'right_shoulder' },
        { x: 0.38 + sway, y: 0.44, score: 0.9, name: 'left_elbow' },
        { x: 0.62 + sway, y: 0.44, score: 0.9, name: 'right_elbow' },
        { x: 0.36 + sway, y: 0.58, score: 0.9, name: 'left_wrist' },
        { x: 0.64 + sway, y: 0.58, score: 0.9, name: 'right_wrist' },
        { x: 0.44 + sway, y: 0.6, score: 0.95, name: 'left_hip' },
        { x: 0.56 + sway, y: 0.6, score: 0.95, name: 'right_hip' },
        { x: 0.42 - legSway, y: 0.78, score: 0.95, name: 'left_knee' },
        { x: 0.58 + legSway, y: 0.78, score: 0.95, name: 'right_knee' },
        { x: 0.40 - legSway, y: 0.94, score: 0.9, name: 'left_ankle' },
        { x: 0.60 + legSway, y: 0.94, score: 0.9, name: 'right_ankle' }
      ];
    } else {
      // Standard Standing or Hand Action
      const hasHandGesture = className.includes('OPEN') || className.includes('PALM') || className.includes('FIST');
      detectedGesture = className.includes('FIST') ? 'FIST' : (hasHandGesture ? 'OPEN_HAND' : null);

      if (hasHandGesture) {
        handData = {
          gesture: detectedGesture,
          density: detectedGesture === 'FIST' ? 0.75 : 0.45,
          landmarks: Array.from({ length: 21 }, (_, i) => ({
            x: 0.5 + Math.sin(i + time) * 0.05,
            y: 0.5 + Math.cos(i + time) * 0.05
          }))
        };
      }

      landmarks = [
        { x: 0.5 + sway, y: 0.18, score: 0.96, name: 'nose' },
        { x: 0.48 + sway, y: 0.16, score: 0.94, name: 'left_eye' },
        { x: 0.52 + sway, y: 0.16, score: 0.94, name: 'right_eye' },
        { x: 0.45 + sway, y: 0.17, score: 0.9, name: 'left_ear' },
        { x: 0.55 + sway, y: 0.17, score: 0.9, name: 'right_ear' },
        { x: 0.42 + sway, y: 0.3, score: 0.95, name: 'left_shoulder' },
        { x: 0.58 + sway, y: 0.3, score: 0.95, name: 'right_shoulder' },
        { x: 0.38 + sway, y: 0.44, score: 0.9, name: 'left_elbow' },
        { x: 0.62 + sway, y: 0.44, score: 0.9, name: 'right_elbow' },
        { x: 0.36 + sway, y: 0.58, score: 0.9, name: 'left_wrist' },
        { x: 0.64 + sway, y: 0.58, score: 0.9, name: 'right_wrist' },
        { x: 0.44 + sway, y: 0.6, score: 0.95, name: 'left_hip' },
        { x: 0.56 + sway, y: 0.6, score: 0.95, name: 'right_hip' },
        { x: 0.44 + sway, y: 0.78, score: 0.95, name: 'left_knee' },
        { x: 0.56 + sway, y: 0.78, score: 0.95, name: 'right_knee' },
        { x: 0.44 + sway, y: 0.94, score: 0.9, name: 'left_ankle' },
        { x: 0.56 + sway, y: 0.94, score: 0.9, name: 'right_ankle' }
      ];
    }

    return {
      hasPerson: true,
      hasFullBody: isTorso,
      isFaceOnly: false,
      hasHands: !!handData,
      handCount: handData ? 1 : 0,
      poseLandmarks: landmarks,
      primaryHand: handData,
      gesture: detectedGesture,
      torsoVisible: isTorso,
      legsVisible: isLegs,
      engine: 'Exhibition Interactive Simulator (HD)',
      trackedPixelCount: 28450 + Math.round(Math.sin(time * 4) * 800),
      handPixelCount: handData ? 4200 : 850,
      pixelResolution: '320x240 HD',
      timestamp: Date.now()
    };
  }, [activeClass]);

  // Perception & Overlay Render Loop (Optimized for 60 FPS Zero-Lag Execution)
  useEffect(() => {
    let isRunning = true;
    let lastCheckTime = 0;
    let lastUiUpdateTime = 0;

    const runLoop = (timestamp) => {
      if (!isRunning) return;

      // Target smooth 30 FPS frame interval (~33ms) for zero-lag performance
      if (timestamp - lastCheckTime >= 33) {
        lastCheckTime = timestamp;

        const canvas = overlayCanvasRef.current;
        const shouldUpdateUi = timestamp - lastUiUpdateTime >= 150; // Throttle React state updates
        if (shouldUpdateUi) {
          lastUiUpdateTime = timestamp;
        }

        if (isDemoMode) {
          // 1. Process Demo Mode Synthetic Perception at 60 FPS
          if (canvas) {
            if (canvas.width !== 640 || canvas.height !== 480) {
              canvas.width = 640;
              canvas.height = 480;
            }

            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              const result = generateDemoPerception(timestamp);
              latestPerceptionRef.current = result;

              if (shouldUpdateUi) {
                setPerceptionState({
                  hasPerson: true,
                  hasHands: result.hasHands,
                  isFaceOnly: false,
                  gesture: result.gesture,
                  trackedPixelCount: result.trackedPixelCount,
                  handPixelCount: result.handPixelCount
                });

                const currentSensors = getSyntheticSensors(timestamp);
                setCameraSensors(currentSensors);
                if (onSensorsUpdate) {
                  onSensorsUpdate(currentSensors);
                }
              }

              sequenceBufferRef.current.push(result);
              if (sequenceBufferRef.current.length > 24) {
                sequenceBufferRef.current.shift();
              }

              // Smooth 60 FPS Skeleton & HUD Drawing
              drawHybridSkeleton(ctx, result, canvas.width, canvas.height, false, trackPixelsMode);

              if (onPerceptionUpdate) {
                onPerceptionUpdate(result, sequenceBufferRef.current);
              }
            }
          }
        } else if (isCameraActive) {
          // 2. Process Live Physical Camera Stream at 60 FPS
          const video = videoEl || externalVideoRef?.current || localVideoRef.current;

          if (video && canvas && video.videoWidth > 0 && (video.readyState >= 1 || videoLoaded)) {
            if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
            }

            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);

              const result = analyzeFrame(video);
              if (result) {
                latestPerceptionRef.current = result;

                if (shouldUpdateUi) {
                  setPerceptionState({
                    hasPerson: result.hasPerson,
                    hasHands: result.hasHands,
                    isFaceOnly: result.isFaceOnly,
                    gesture: result.gesture,
                    trackedPixelCount: result.trackedPixelCount || 0,
                    handPixelCount: result.handPixelCount || 0
                  });

                  const currentSensors = readCameraSensors(video);
                  setCameraSensors(currentSensors);
                  if (onSensorsUpdate) {
                    onSensorsUpdate(currentSensors);
                  }
                }

                sequenceBufferRef.current.push(result);
                if (sequenceBufferRef.current.length > 24) {
                  sequenceBufferRef.current.shift();
                }

                // Smooth 60 FPS Skeleton & HUD Drawing
                drawHybridSkeleton(ctx, result, canvas.width, canvas.height, true, trackPixelsMode);

                if (onPerceptionUpdate) {
                  onPerceptionUpdate(result, sequenceBufferRef.current);
                }
              }
            }
          }
        }
      }

      animLoopRef.current = requestAnimationFrame(runLoop);
    };

    animLoopRef.current = requestAnimationFrame(runLoop);

    return () => {
      isRunning = false;
      if (animLoopRef.current) cancelAnimationFrame(animLoopRef.current);
    };
  }, [
    isDemoMode,
    isCameraActive,
    videoEl,
    externalVideoRef,
    videoLoaded,
    trackPixelsMode,
    generateDemoPerception,
    onPerceptionUpdate
  ]);

  // Capture current frame snapshot data URL
  const takeSnapshotDataUrl = useCallback(() => {
    if (isDemoMode) {
      if (demoImage) return demoImage;

      // Generate instant crisp SVG demo thumbnail
      const cls = activeClass || { name: 'POSE', icon: '🧍', color: '#E67E42' };
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120" viewBox="0 0 160 120">
        <rect width="160" height="120" fill="#18324A"/>
        <circle cx="80" cy="50" r="32" fill="${cls.color || '#E67E42'}" opacity="0.25"/>
        <text x="80" y="58" font-size="34" text-anchor="middle">${cls.icon || '🧍'}</text>
        <text x="80" y="98" font-family="monospace" font-weight="bold" font-size="11" fill="#F7F3EA" text-anchor="middle">${cls.name || 'SAMPLE'}</text>
      </svg>`;
      return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    }

    const video = videoEl || externalVideoRef?.current || localVideoRef.current;
    if (!video || !video.videoWidth) return null;

    try {
      const snapCanvas = document.createElement('canvas');
      snapCanvas.width = 160;
      snapCanvas.height = 120;
      const snapCtx = snapCanvas.getContext('2d');
      if (!snapCtx) return null;
      snapCtx.translate(160, 0);
      snapCtx.scale(-1, 1);
      snapCtx.drawImage(video, 0, 0, 160, 120);
      return snapCanvas.toDataURL('image/jpeg', 0.85);
    } catch {
      return null;
    }
  }, [isDemoMode, demoImage, activeClass, videoEl, externalVideoRef]);

  const classNameUpper = (activeClass?.name || '').toUpperCase().trim();
  const icon = activeClass?.icon || '';
  const isWaving = classNameUpper.includes('WAVE') || icon === '👋';
  const isClapping = classNameUpper.includes('CLAP') || icon === '👏';
  const isDynamicAction =
    isWaving ||
    isClapping ||
    classNameUpper.includes('WALK') ||
    classNameUpper.includes('JUMP') ||
    classNameUpper.includes('DANCE') ||
    classNameUpper.includes('MOTION');

  // Handle Single Frame Capture (auto-delegates to recording if action is dynamic)
  const handleCaptureOnce = () => {
    if (isDynamicAction) {
      handleRecordSequence();
      return;
    }

    sound.playShutter();
    setIsFlashing(true);
    setShowRipple(true);
    setIsPressing(true);

    const snapshot = takeSnapshotDataUrl();
    if (snapshot) {
      setLastSnapshot(snapshot);
      setTimeout(() => setLastSnapshot(null), 1500);
    }

    const currentResult =
      latestPerceptionRef.current ||
      (isDemoMode ? generateDemoPerception(performance.now()) : { hasPerson: false, timestamp: Date.now() });

    if (onCapture && currentResult) {
      onCapture(currentResult, sequenceBufferRef.current, snapshot);
    }

    setTimeout(() => setIsFlashing(false), 240);
    setTimeout(() => setShowRipple(false), 500);
    setTimeout(() => setIsPressing(false), 180);
  };

  // Handle Dynamic Movement Recording (1.5 seconds sequence)
  const handleRecordSequence = () => {
    if (isRecordingSequence) return;
    sound.playEnginePulse(520);
    setIsRecordingSequence(true);
    setRecordingProgress(0);

    const recordedFrames = [];
    const intervalTime = 60;
    const totalFrames = 25;

    const timer = setInterval(() => {
      const frame = latestPerceptionRef.current || (isDemoMode ? generateDemoPerception(performance.now()) : null);
      if (frame) {
        recordedFrames.push(frame);
      }
      setRecordingProgress((prev) => Math.min(100, prev + 100 / totalFrames));

      if (recordedFrames.length >= totalFrames) {
        clearInterval(timer);
        setIsRecordingSequence(false);
        sound.playSuccess();

        const snapshot = takeSnapshotDataUrl();
        if (snapshot) {
          setLastSnapshot(snapshot);
          setTimeout(() => setLastSnapshot(null), 1500);
        }

        if (onCaptureSequence) {
          onCaptureSequence(recordedFrames, snapshot);
        } else if (onCapture) {
          onCapture(recordedFrames[recordedFrames.length - 1], recordedFrames, snapshot);
        }
      }
    }, intervalTime);
  };

  const isLive = isCameraActive && !isDemoMode && stream;
  const canAdvance = capturedCount >= 4;

  return (
    <div className="flex flex-col gap-3 w-full max-w-2xl mx-auto">
      {/* Viewport Top Telemetry Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#18324A] rounded-xl text-white text-xs font-mono shadow-md flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {isLive ? (
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE CAMERA</span>
            </span>
          ) : isDemoMode ? (
            <span className="flex items-center gap-1.5 text-teal-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>DEMO SIMULATOR</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>CAMERA STANDBY</span>
            </span>
          )}

          {/* Quick Mode Switcher */}
          {isDemoMode && onEnableCamera && (
            <button
              onClick={() => {
                sound.playClick();
                onEnableCamera();
              }}
              className="text-[10px] text-teal-200 underline hover:text-white transition-colors ml-1"
            >
              (Connect Webcam)
            </button>
          )}

          {!isDemoMode && onUseDemoMode && (
            <button
              onClick={() => {
                sound.playClick();
                onUseDemoMode();
              }}
              className="text-[10px] text-amber-200 underline hover:text-white transition-colors ml-1"
            >
              (Use Demo Mode)
            </button>
          )}
        </div>

        {/* Real-time Tracking Status Indicators */}
        <div className="flex items-center gap-1.5 text-[11px]">
          {perceptionState.hasPerson ? (
            <span className="flex items-center gap-1 text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
              <UserCheck className="w-3 h-3 text-emerald-400" />
              <span>POSE TRACKING ●</span>
            </span>
          ) : (
            <span className="text-slate-400 px-2 py-0.5 rounded bg-white/5 border border-white/10">
              NO POSE
            </span>
          )}

          {perceptionState.hasHands && (
            <span className="flex items-center gap-1 text-teal-300 font-bold px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/30">
              <Hand className="w-3 h-3 text-teal-300" />
              <span>HANDS TRACKED ●</span>
            </span>
          )}

          {/* Pixel Tracking Status & Toggle */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setTrackPixelsMode(!trackPixelsMode);
            }}
            className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-all cursor-pointer font-bold ${
              trackPixelsMode
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-white/5 text-slate-400 border-white/10'
            }`}
            title="Click to toggle High-Clarity Pixel Tracking overlay"
          >
            <Activity className="w-3 h-3 text-amber-400" />
            <span>
              {perceptionState.trackedPixelCount > 0
                ? `${perceptionState.trackedPixelCount.toLocaleString()} PIXELS`
                : 'TRACK PIXELS (HD)'}
            </span>
          </button>

          {/* Real-time Camera Sensors Toggle */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setShowSensorsHud(!showSensorsHud);
            }}
            className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-all cursor-pointer font-bold ${
              showSensorsHud
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-white/5 text-slate-400 border-white/10'
            }`}
            title="Toggle Real-Time Camera Sensors (Light, Focus, Motion, FPS)"
          >
            <Sun className="w-3 h-3 text-amber-400" />
            <span>SENSORS</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                showSensorsHud ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
          </button>
        </div>

        {/* Target Class Pill */}
        {activeClass && (
          <div className="flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded border border-white/10 text-[11px]">
            <span className="text-[#DDE2E5]/60 uppercase">TEACHING:</span>
            <span className="font-bold text-white flex items-center gap-1">
              <span>{activeClass.icon}</span>
              <span className="truncate max-w-[100px]">{activeClass.name}</span>
            </span>
          </div>
        )}

        {/* Counter Badge */}
        <div className="flex items-center gap-1 text-[11px]">
          <span className="text-[#DDE2E5]/80">
            <strong className="text-[#E67E42] tabular-nums font-bold text-xs">{capturedCount}</strong> / {targetCount}
          </span>
        </div>
      </div>

      {/* Main Viewport Frame */}
      <div className="relative aspect-[4/3] rounded-2xl bg-[#0e1d2c] overflow-hidden border border-white/10 flex items-center justify-center select-none shadow-inner">
        {/* Real Live HTML5 Video Element */}
        <video
          ref={(node) => {
            localVideoRef.current = node;
            if (externalVideoRef) externalVideoRef.current = node;
            if (node && node !== videoEl) setVideoEl(node);
          }}
          autoPlay
          playsInline
          muted
          onLoadedMetadata={() => setVideoLoaded(true)}
          onLoadedData={() => setVideoLoaded(true)}
          onCanPlay={() => setVideoLoaded(true)}
          onPlay={() => setVideoLoaded(true)}
          className={`w-full h-full object-cover transform -scale-x-100 ${
            isLive ? 'block' : 'hidden'
          }`}
        />

        {/* Skeleton & Hand Landmark Overlay Canvas (Active in both Live & Demo modes) */}
        <canvas
          ref={overlayCanvasRef}
          className={`absolute inset-0 w-full h-full pointer-events-none z-10 ${
            isLive || isDemoMode ? 'block' : 'hidden'
          }`}
        />

        {/* Real-Time Optical & Camera Sensors HUD */}
        {(isLive || isDemoMode) && showSensorsHud && (
          <div className="absolute top-2.5 left-2.5 right-2.5 z-20 pointer-events-none flex items-center justify-between gap-1.5 flex-wrap">
            {/* Left Sensor Cluster: Light / Lux, Focus, Motion */}
            <div className="flex items-center gap-2 bg-[#0e1d2c]/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/15 text-[10px] font-mono text-white shadow-lg pointer-events-auto">
              {/* Light / Exposure Sensor */}
              <div className="flex items-center gap-1" title="Real-Time Ambient Light & Exposure Sensor">
                <Sun className="w-3 h-3 text-amber-400" />
                <span className="text-slate-400">LUX:</span>
                <span className="font-bold" style={{ color: cameraSensors.light.color }}>
                  {cameraSensors.light.value}%
                </span>
                <span className="text-[9px] text-slate-400 hidden sm:inline">({cameraSensors.light.status})</span>
              </div>

              <span className="text-white/20">•</span>

              {/* Focus / Sharpness Sensor */}
              <div className="flex items-center gap-1" title="Real-Time Optical Sharpness & Focus Sensor">
                <Focus className="w-3 h-3 text-teal-300" />
                <span className="text-slate-400">FOCUS:</span>
                <span className="font-bold" style={{ color: cameraSensors.focus.color }}>
                  {cameraSensors.focus.score}%
                </span>
                <span className="text-[9px] text-slate-400 hidden sm:inline">({cameraSensors.focus.status})</span>
              </div>

              <span className="text-white/20">•</span>

              {/* Motion & Stability Sensor */}
              <div className="flex items-center gap-1" title="Real-Time Camera Motion & Stability Sensor">
                <Activity className="w-3 h-3 text-emerald-400" />
                <span className="text-slate-400">MOTION:</span>
                <span className="font-bold" style={{ color: cameraSensors.motion.color }}>
                  {cameraSensors.motion.value}%
                </span>
              </div>
            </div>

            {/* Right Sensor Cluster: Stream Hardware Telemetry */}
            <div className="flex items-center gap-1.5 bg-[#0e1d2c]/85 backdrop-blur-md px-2 py-1 rounded-lg border border-white/15 text-[10px] font-mono text-emerald-400 shadow-lg pointer-events-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold">{cameraSensors.stream.fps} FPS</span>
              <span className="text-white/25">•</span>
              <span className="text-slate-300 text-[9px]">{cameraSensors.stream.resolution}</span>
            </div>
          </div>
        )}

        {/* Interactive Holographic Specimen Avatar for Demo Mode */}
        {isDemoMode && (
          <div className="absolute inset-0 flex flex-col items-center justify-between p-6 pointer-events-none">
            <div className="flex items-center justify-between w-full">
              <span className="px-2.5 py-1 rounded-full bg-teal-500/20 border border-teal-400/40 text-teal-300 font-mono text-[10px] font-bold">
                ⚡ SYNTHETIC DATA STREAM
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#E67E42]/20 border border-[#E67E42]/40 text-[#E67E42] font-mono text-[10px] font-bold">
                {activeClass?.name || 'CLASS SPECIMEN'}
              </span>
            </div>

            {/* Specimen Center Hologram */}
            <div className="text-center space-y-2 pointer-events-auto">
              <div className="w-28 h-28 rounded-full bg-[#18324A]/80 border-2 border-[#E67E42] flex items-center justify-center mx-auto shadow-2xl backdrop-blur-sm relative">
                <span className="text-5xl select-none animate-bounce">
                  {activeClass?.icon || '🧍'}
                </span>
                <div className="absolute inset-0 rounded-full border border-teal-400/40 animate-ping pointer-events-none" />
              </div>
              <div className="bg-black/60 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-sm">
                <p className="text-xs font-mono font-bold text-white">
                  Target Posture: {activeClass?.name}
                </p>
                <p className="text-[10px] text-teal-300">
                  {isDynamicAction
                    ? 'Real-time motion tracking • Press Record for 1.5s sequence'
                    : 'Real-time joints mapped • Press Capture to add sample'}
                </p>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 font-mono">
              Ready to learn • No camera needed
            </div>
          </div>
        )}

        {/* Standby / Inactive Camera Overlay */}
        {!isLive && !isDemoMode && (
          <div className="absolute inset-0 bg-[#14293c]/95 flex flex-col items-center justify-center p-6 text-center space-y-4 z-20">
            <div className="w-14 h-14 rounded-2xl bg-[#E67E42]/20 border border-[#E67E42]/40 text-[#E67E42] flex items-center justify-center mx-auto shadow-md">
              <Camera className="w-7 h-7" />
            </div>

            <div>
              <h4 className="font-display font-bold text-lg text-white uppercase tracking-wider">
                {cameraState === 'denied'
                  ? 'CAMERA ACCESS DENIED'
                  : cameraState === 'error'
                  ? 'CAMERA UNAVAILABLE'
                  : 'CAMERA READY'}
              </h4>
              <p className="text-xs text-[#DDE2E5]/80 max-w-xs mx-auto mt-1 leading-relaxed">
                {cameraError || 'Connect your webcam or click Demo Mode below to start immediately.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full max-w-xs pt-1">
              {onEnableCamera && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onEnableCamera();
                  }}
                  className="pressable w-full py-3 px-4 bg-[#E67E42] hover:bg-[#d66e33] text-white font-display font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>ENABLE CAMERA</span>
                </button>
              )}

              {onUseDemoMode && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onUseDemoMode();
                  }}
                  className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/10 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <PlayCircle className="w-3.5 h-3.5 text-teal-300" />
                  <span>USE DEMO MODE</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Shutter Flash Animation Effect */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white/70 pointer-events-none z-30 transition-opacity duration-150" />
        )}

        {/* Shutter Water Ripple Effect */}
        {showRipple && (
          <div className="absolute inset-0 border-4 border-[#E67E42] rounded-2xl pointer-events-none animate-ping z-30 opacity-75" />
        )}

        {/* Continuous Scanning Laser Bar (During Testing Step) */}
        {isScanning && (
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#E67E42] to-transparent animate-scan pointer-events-none z-20 shadow-[0_0_12px_#E67E42]" />
        )}

        {/* Micro-preview thumbnail of last captured photo */}
        {lastSnapshot && (
          <div className="absolute bottom-3 left-3 w-14 h-11 rounded-lg border-2 border-white shadow-xl overflow-hidden z-20 animate-scale-in">
            <img src={lastSnapshot} alt="Last capture thumbnail" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Sequence Recording Progress Bar */}
        {isRecordingSequence && (
          <div className="absolute top-0 inset-x-0 h-2 bg-black/60 z-30">
            <div
              className="h-full bg-gradient-to-r from-[#E67E42] to-teal-400 transition-all duration-75"
              style={{ width: `${recordingProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Main Interactive Capture Controls */}
      {showCaptureButton && (
        <CameraControls
          capturedCount={capturedCount}
          targetCount={targetCount}
          activeClass={activeClass}
          isLive={isLive || isDemoMode}
          isDynamicAction={isDynamicAction}
          isRecordingSequence={isRecordingSequence}
          recordingProgress={recordingProgress}
          onCaptureOnce={handleCaptureOnce}
          onRecordSequence={handleRecordSequence}
          onResetCamera={onResetCamera}
          onStopCamera={onStopCamera}
          onSwitchClass={onSwitchClass}
          onProceedToTrain={onProceedToTrain}
          nextClassLabel={nextClassLabel}
          canAdvance={canAdvance}
        />
      )}
    </div>
  );
}

export default CameraView;
