import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CameraView } from '../components/CameraView';
import { CameraPermission } from '../components/CameraPermission';
import { ClassCreator } from '../components/ClassCreator';
import { ExampleGallery } from '../components/ExampleGallery';
import { TrainingBoard } from '../components/TrainingBoard';
import { TrainingAnimation } from '../components/TrainingAnimation';
import { PredictionDisplay } from '../components/PredictionDisplay';
import { TakeawayCard } from '../components/TakeawayCard';
import { DeveloperDebugPanel } from '../components/DeveloperDebugPanel';
import { MachineVisionExplainer } from '../components/MachineVisionExplainer';

import { actionClassifier } from '../ml/actionClassifier';
import { getPoseDemoData } from '../data/poseDemoData';
import { initMediaPipeVision } from '../ml/hybridVision';
import { sound } from '../utils/sound';
import { Sparkles, Upload, Package } from 'lucide-react';
import { isObjectAction, processImageFile, extractVisualEmbedding } from '../ml/objectFeatureExtractor';
import {
  captureWebcamFrameAsTensor,
  setActiveWebcamStream,
  setActiveWebcamVideo,
  trainingTensorBuffer
} from '../ml/tensorBuffer';

export function TrainMachine({
  onResetAll,
  onGoHome,
  onGoToChallenge
}) {
  // Navigation Steps:
  // 1. 'select-classes' -> WHAT DO YOU WANT TO TEACH?
  // 2. 'camera-permission' -> READY TO USE THE CAMERA?
  // 3. 'collect-data' -> REAL-TIME POSE / MOVEMENT CAPTURE
  // 4. 'ready-to-train' -> READY TO TRAIN?
  // 5. 'training-anim' -> IN-BROWSER TRAINING ANIMATION
  // 6. 'testing' -> TEST LIVE SENSING & UNKNOWN REJECTION
  // 7. 'takeaway' -> WHAT ACTUALLY HAPPENED?
  const [step, setStep] = useState('select-classes');

  // Custom Classes created by the visitor (2 or 3 classes)
  const [classes, setClasses] = useState([
    { id: 'classA', name: 'WAVING', icon: '👋', color: '#3B82F6' },
    { id: 'classB', name: 'CLAPPING', icon: '👏', color: '#F59E0B' }
  ]);
  const [activeClassId, setActiveClassId] = useState('classA');

  // Camera state & MediaStream management
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [cameraState, setCameraState] = useState('idle');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [cameraResetNotice, setCameraResetNotice] = useState(false);
  const [qualityNotice, setQualityNotice] = useState(null);

  // Captured dataset: map of classId -> list of { id, dataUrl, perceptionResult, sequence }
  const [examplesByClass, setExamplesByClass] = useState({
    classA: [],
    classB: []
  });

  // Current Perception data & rolling temporal window
  const latestPerceptionRef = useRef(null);
  const rollingWindowRef = useRef([]);
  const [cameraSensors, setCameraSensors] = useState(null);

  // Live Prediction state
  const [currentPrediction, setCurrentPrediction] = useState(null);
  const predictionLoopRef = useRef(null);
  const lastInferenceTimeRef = useRef(0);

  // Diagnostics metrics for Developer Debug Panel
  const [fps, setFps] = useState(30);
  const [latencyMs, setLatencyMs] = useState(8);
  const frameCountRef = useRef(0);
  const lastFpsTimeRef = useRef(Date.now());

  // Stable stop camera stream (Never recreated on re-renders)
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (err) {
        console.warn('Error stopping camera track:', err);
      }
      streamRef.current = null;
    }
    setActiveWebcamStream(null);
    setActiveWebcamVideo(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setMediaStream(null);
    setIsCameraActive(false);
    setCameraState('stopped');
  }, []);

  // Request & Initialize Real Browser Camera
  const startCamera = async () => {
    setCameraState('requesting');
    setCameraError(null);
    setCameraResetNotice(false);

    if (typeof window !== 'undefined' && window.isSecureContext === false) {
      const msg = 'Camera access requires a secure connection (HTTPS or localhost). Please explore using Demo Mode.';
      setCameraError(msg);
      setCameraState('error');
      return;
    }

    if (!navigator?.mediaDevices?.getUserMedia) {
      const msg = 'This browser cannot access the camera. Please try a modern browser such as Chrome or Edge.';
      setCameraError(msg);
      setCameraState('error');
      return;
    }

    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 60, min: 30 }
          },
          audio: false
        });
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              frameRate: { ideal: 60 }
            },
            audio: false
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
        }
      }

      streamRef.current = stream;
      setMediaStream(stream);
      setActiveWebcamStream(stream);
      if (videoRef.current) {
        setActiveWebcamVideo(videoRef.current);
      }
      setIsCameraActive(true);
      setIsDemoMode(false);
      setCameraState('active');
      sound.playSuccess();

      // Fire off MediaPipe vision tasks initialization
      initMediaPipeVision().catch(() => {});

      setTimeout(() => {
        setStep('collect-data');
      }, 550);
    } catch (err) {
      console.warn('Webcam permission error:', err);
      let userMsg = '';
      let nextState = 'denied';

      const isIframe = typeof window !== 'undefined' && window.self !== window.top;

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        nextState = 'denied';
        if (isIframe) {
          userMsg =
            'Camera permission was blocked inside the preview frame. Click "OPEN IN NEW TAB ↗" to run in a standalone window.';
        } else {
          userMsg =
            'Camera permission was denied. Please click the lock icon in your address bar to Allow access.';
        }
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        userMsg = 'No camera was detected on this device. Please connect a webcam or use Demo Mode.';
        nextState = 'error';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        userMsg = 'The camera is currently being used by another application. Please close that app and try again.';
        nextState = 'error';
      } else {
        userMsg = err.message || 'Unable to access camera on this device.';
      }

      setCameraError(userMsg);
      setCameraState(nextState);
      sound.playEnginePulse(180, 0.1);
    }
  };

  // Section 28 & 29: RESET CAMERA (Only reconnects webcam without deleting training data)
  const handleResetCameraOnly = () => {
    stopCameraStream();
    setCameraState('idle');
    setCameraResetNotice(true);
    sound.playClick();
  };

  // Section 29: RESET EXPERIMENT (Clears classes, dataset, and model for a new visitor)
  const handleResetExperiment = () => {
    stopCameraStream();
    actionClassifier.reset();
    setClasses([
      { id: 'classA', name: 'WAVING', icon: '👋', color: '#3B82F6' },
      { id: 'classB', name: 'CLAPPING', icon: '👏', color: '#F59E0B' }
    ]);
    setActiveClassId('classA');
    setExamplesByClass({ classA: [], classB: [] });
    setCurrentPrediction(null);
    setCameraResetNotice(false);
    setStep('select-classes');
    onResetAll();
    sound.playSuccess();
  };

  // Activate Demo Mode fallback
  const startDemoMode = () => {
    stopCameraStream();
    setIsDemoMode(true);
    setIsCameraActive(false);
    setCameraState('idle');
    setCameraError(null);

    const demo = getPoseDemoData(classes);
    setExamplesByClass(demo);

    setStep('collect-data');
    sound.playSuccess();
  };

  // Clean up camera ONLY on true component unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        try {
          streamRef.current.getTracks().forEach((track) => track.stop());
        } catch {
          // ignore
        }
        streamRef.current = null;
      }
      if (predictionLoopRef.current) {
        cancelAnimationFrame(predictionLoopRef.current);
      }
    };
  }, []);

  // Restore saved machine learning training state from local storage on mount
  useEffect(() => {
    try {
      const saved = actionClassifier.loadTrainingState();
      if (saved && saved.dataset) {
        const hasExamples = Object.values(saved.dataset).some((arr) => Array.isArray(arr) && arr.length > 0);
        if (hasExamples) {
          setExamplesByClass((prev) => {
            const updated = { ...prev };
            for (const [clsId, items] of Object.entries(saved.dataset)) {
              if (Array.isArray(items) && items.length > 0) {
                updated[clsId] = items.map((item) => ({
                  id: item.id,
                  categoryId: item.categoryId || clsId,
                  categoryName: item.categoryName,
                  dataUrl: item.thumbnail || item.dataUrl,
                  visualEmbedding: item.visualEmbedding,
                  perceptionResult: item.perceptionResult,
                  sequenceWindow: item.sequenceWindow || [],
                  source: item.source || 'webcam',
                  timestamp: item.timestamp || Date.now()
                }));
              }
            }
            return updated;
          });
        }
      }
    } catch (e) {
      console.warn('Failed to hydrate local training state:', e);
    }
  }, []);

  // Handle capturing a single frame or 1.5s temporal sequence
  const handleCaptureFrame = (frameResult, sequenceWindow, thumbnail) => {
    const activeClass = classes.find((c) => c.id === activeClassId);
    if (!activeClass) return;

    const isObject = isObjectAction(activeClass.name, activeClass.kind);

    if (!isDemoMode && !isObject) {
      if (!frameResult || !frameResult.hasPerson) {
        sound.playEnginePulse(180, 0.1);
        setQualityNotice('NO POSE DETECTED: Please step in front of the camera.');
        setTimeout(() => setQualityNotice(null), 3200);
        return;
      }

      const nameUpper = activeClass.name.toUpperCase();
      const requiresBody = nameUpper.includes('STAND') || nameUpper.includes('SIT') || nameUpper.includes('WALK');
      if (requiresBody && frameResult.isFaceOnly) {
        sound.playEnginePulse(180, 0.1);
        setQualityNotice('MOVE FURTHER INTO VIEW: Step back so your torso and legs are visible.');
        setTimeout(() => setQualityNotice(null), 3200);
        return;
      }

      const requiresHands = nameUpper.includes('HAND') || nameUpper.includes('FIST') || nameUpper.includes('PALM');
      if (requiresHands && !frameResult.hasHands) {
        sound.playEnginePulse(180, 0.1);
        setQualityNotice('SHOW YOUR HANDS: Hold your hand clearly in front of the lens.');
        setTimeout(() => setQualityNotice(null), 3200);
        return;
      }

      const isDynamic = nameUpper.includes('WALK') || nameUpper.includes('CLAP') || nameUpper.includes('WAVE');
      if (isDynamic && sequenceWindow && sequenceWindow.length < 5) {
        sound.playEnginePulse(180, 0.1);
        setQualityNotice('MOTION TOO SHORT: Please hold record while performing the motion.');
        setTimeout(() => setQualityNotice(null), 3200);
        return;
      }
    }

    if (isDemoMode) {
      const demo = getPoseDemoData(classes);
      const pool = demo[activeClassId] || [];
      const currentList = examplesByClass[activeClassId] || [];
      const nextIdx = currentList.length % Math.max(1, pool.length);
      const baseItem = pool[nextIdx] || pool[0];

      const newItem = {
        ...baseItem,
        id: `${activeClassId}-${Date.now()}`,
        categoryId: activeClassId,
        categoryName: activeClass.name,
        dataUrl: thumbnail || baseItem?.dataUrl,
        perceptionResult: frameResult || baseItem,
        sequenceWindow: sequenceWindow || [],
        visualEmbedding: null,
        source: 'webcam'
      };

      actionClassifier.addCustomObjectExample(activeClassId, newItem);

      setExamplesByClass((prev) => ({
        ...prev,
        [activeClassId]: [...(prev[activeClassId] || []), newItem]
      }));
      return;
    }

    // Extract video frame as a tensor from the active webcam stream, associate it with the
    // currently selected custom object label, and store it in the training buffer.
    const activeStreamOrVideo = videoRef.current || streamRef.current || mediaStream;
    const capturedExample = actionClassifier.captureWebcamFrame(
      activeStreamOrVideo,
      activeClass,
      {
        perceptionResult: frameResult,
        sequenceWindow: sequenceWindow || [],
        thumbnail: thumbnail,
        fallbackDataUrl: thumbnail
      }
    );

    setExamplesByClass((prev) => ({
      ...prev,
      [activeClassId]: [...(prev[activeClassId] || []), capturedExample]
    }));
  };

  // Upload custom images from device (e.g. photos of water bottle, toy car, etc.)
  const handleUploadImages = async (classId, fileList) => {
    if (!fileList || fileList.length === 0) return;
    sound.playClick();
    const files = Array.from(fileList);
    let addedCount = 0;
    const activeCategory = classes.find((c) => c.id === classId) || { id: classId, name: classId };

    for (const file of files) {
      try {
        const processed = await processImageFile(file);
        const newItem = {
          id: `${classId}-upload-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          categoryId: classId,
          categoryName: activeCategory.name,
          dataUrl: processed.dataUrl,
          visualEmbedding: processed.visualEmbedding,
          source: 'upload',
          perceptionResult: null,
          sequenceWindow: [],
          timestamp: Date.now()
        };

        // Save locally to machine learning model's training state
        actionClassifier.addCustomObjectExample(classId, newItem);

        setExamplesByClass((prev) => ({
          ...prev,
          [classId]: [...(prev[classId] || []), newItem]
        }));
        addedCount++;
      } catch (err) {
        console.warn('Error processing image upload:', err);
      }
    }

    if (addedCount > 0) {
      sound.playSuccess();
    }
  };

  const handleDeleteExample = (classId, exampleId) => {
    actionClassifier.removeExample(classId, exampleId);
    setExamplesByClass((prev) => ({
      ...prev,
      [classId]: (prev[classId] || []).filter((ex) => ex.id !== exampleId)
    }));
  };

  // Run in-browser model training
  const handleStartTraining = () => {
    setStep('training-anim');
  };

  const handleTrainingAnimationComplete = () => {
    // 1. Configure custom classes in in-browser classifier
    actionClassifier.setClasses(classes);

    // 2. Feed all captured pose, object & sequence examples
    for (const cls of classes) {
      const samples = examplesByClass[cls.id] || [];
      for (const s of samples) {
        if (s.perceptionResult) {
          actionClassifier.addExample(
            cls.id,
            s.perceptionResult,
            s.sequenceWindow,
            s.dataUrl,
            s.visualEmbedding
          );
        } else if (s.visualEmbedding || s.dataUrl) {
          actionClassifier.addExample(
            cls.id,
            null,
            [],
            s.dataUrl,
            s.visualEmbedding
          );
        } else if (s.poseLandmarks) {
          // Demo format
          actionClassifier.addExample(
            cls.id,
            {
              hasPerson: true,
              hasFullBody: true,
              hasHands: s.hasHands,
              poseLandmarks: s.poseLandmarks,
              primaryHand: s.primaryHand
            },
            [],
            s.dataUrl,
            s.visualEmbedding
          );
        }
      }
    }

    // 3. Train in browser
    actionClassifier.train();

    setStep('testing');
    sound.playSuccess();
  };

  // Continuous In-Browser Live Inference Loop during testing step
  useEffect(() => {
    if (step !== 'testing') {
      if (predictionLoopRef.current) {
        cancelAnimationFrame(predictionLoopRef.current);
      }
      return;
    }

    let isPredicting = false;

    const runInference = (timestamp) => {
      // Run inference at up to 60 FPS (~16ms)
      if (timestamp - lastInferenceTimeRef.current >= 16 && !isPredicting) {
        const startT = performance.now();
        lastInferenceTimeRef.current = timestamp;
        isPredicting = true;

        if (isCameraActive && (latestPerceptionRef.current || videoRef.current)) {
          const pred = actionClassifier.predict(
            latestPerceptionRef.current,
            rollingWindowRef.current,
            videoRef.current
          );
          if (pred) {
            setCurrentPrediction(pred);
          }
        } else if (isDemoMode) {
          // Dynamic demonstration cycle in Demo Mode
          const time = Date.now() / 1500;
          const cycle = Math.sin(time);

          if (cycle > 0.35) {
            setCurrentPrediction({
              status: 'recognized',
              prediction: classes[0].name,
              predictedIcon: classes[0].icon,
              matchScore: Math.round(89 + Math.sin(time * 3) * 5),
              probabilities: {
                [classes[0].name]: 92,
                [classes[1].name]: 8
              }
            });
          } else if (cycle < -0.35) {
            setCurrentPrediction({
              status: 'recognized',
              prediction: classes[1].name,
              predictedIcon: classes[1].icon,
              matchScore: Math.round(88 + Math.sin(time * 3) * 6),
              probabilities: {
                [classes[0].name]: 9,
                [classes[1].name]: 91
              }
            });
          } else {
            setCurrentPrediction({
              status: 'unknown',
              prediction: null,
              matchScore: 36,
              probabilities: {
                [classes[0].name]: 35,
                [classes[1].name]: 32
              },
              message: 'NO TRAINED MATCH'
            });
          }
        }

        const elapsed = Math.round(performance.now() - startT);
        setLatencyMs(elapsed);

        // Update FPS counter
        frameCountRef.current++;
        if (Date.now() - lastFpsTimeRef.current >= 1000) {
          setFps(frameCountRef.current);
          frameCountRef.current = 0;
          lastFpsTimeRef.current = Date.now();
        }

        isPredicting = false;
      }

      predictionLoopRef.current = requestAnimationFrame(runInference);
    };

    predictionLoopRef.current = requestAnimationFrame(runInference);

    return () => {
      if (predictionLoopRef.current) {
        cancelAnimationFrame(predictionLoopRef.current);
      }
    };
  }, [step, isCameraActive, isDemoMode, classes]);

  const activeClass = classes.find((c) => c.id === activeClassId) || classes[0];
  const activeClassExamples = examplesByClass[activeClassId] || [];
  const totalSamplesCount = Object.values(examplesByClass).reduce(
    (acc, list) => acc + (list ? list.length : 0),
    0
  );

  return (
    <div className="bg-[#F7F3EA] text-[#20303C] min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 relative">
      <div className="max-w-7xl mx-auto">
        {/* STEP 1: WHAT DO YOU WANT TO TEACH? */}
        {step === 'select-classes' && (
          <ClassCreator
            initialClasses={classes}
            onConfirmClasses={(newClasses) => {
              setClasses(newClasses);
              setActiveClassId(newClasses[0].id);
              const initialMap = {};
              newClasses.forEach((c) => {
                initialMap[c.id] = [];
              });
              setExamplesByClass(initialMap);
              setStep('camera-permission');
            }}
          />
        )}

        {/* STEP 2: CAMERA PERMISSION & INITIALIZATION */}
        {step === 'camera-permission' && (
          <CameraPermission
            onEnableCamera={startCamera}
            onUseDemoMode={startDemoMode}
            cameraState={cameraState}
            errorMessage={cameraError}
            selectedPreset={{
              classA: classes[0],
              classB: classes[1]
            }}
          />
        )}

        {/* STEP 3: COLLECTING REAL CAMERA SAMPLES */}
        {step === 'collect-data' && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#E67E42]/10 text-[#E67E42] text-xs font-mono font-bold tracking-wider uppercase mb-2">
                STAGE 02 · REAL-TIME SENSING & RECORDING
              </div>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#18324A] uppercase">
                TEACH: {activeClass.name}
              </h2>
              <p className="text-sm text-[#20303C]/80 mt-1">
                “Demonstrate {activeClass.name} in front of the lens.”
              </p>
            </div>

            {/* Camera Reset Alert Notice */}
            {cameraResetNotice && (
              <div className="max-w-xl mx-auto p-3 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 text-xs font-mono flex items-center justify-between">
                <span>CAMERA RESET. Click "Enable Camera" below to reconnect.</span>
                <button
                  onClick={startCamera}
                  className="px-3 py-1 bg-[#E67E42] text-white font-bold rounded-lg text-xs"
                >
                  Enable Camera
                </button>
              </div>
            )}

            {/* Data Quality Feedback Banner (Section 11) */}
            {qualityNotice && (
              <div className="max-w-xl mx-auto p-3.5 rounded-2xl bg-rose-100 border-2 border-rose-400 text-rose-900 text-xs font-mono font-bold flex items-center gap-2 shadow-lg animate-scale-in">
                <span className="text-base">⚠️</span>
                <span>{qualityNotice}</span>
              </div>
            )}

            {/* Split View: Camera View on Left, Class Switcher & Dataset on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7">
                <CameraView
                  stream={mediaStream}
                  videoRef={videoRef}
                  isCameraActive={isCameraActive}
                  cameraState={cameraState}
                  isDemoMode={isDemoMode}
                  demoImage={
                    activeClassExamples[activeClassExamples.length - 1]?.dataUrl
                  }
                  activeClass={activeClass}
                  capturedCount={activeClassExamples.length}
                  targetCount={5}
                  onCapture={handleCaptureFrame}
                  onCaptureSequence={(seq, thumb) => {
                    handleCaptureFrame(seq[seq.length - 1], seq, thumb);
                  }}
                  onEnableCamera={startCamera}
                  onUseDemoMode={startDemoMode}
                  onResetCamera={handleResetCameraOnly}
                  onStopCamera={stopCameraStream}
                  cameraError={cameraError}
                  showCaptureButton={true}
                  onSensorsUpdate={setCameraSensors}
                  onPerceptionUpdate={(result, windowSeq) => {
                    latestPerceptionRef.current = result;
                    rollingWindowRef.current = windowSeq;
                  }}
                  onSwitchClass={() => {
                    const currentIdx = classes.findIndex((c) => c.id === activeClassId);
                    const nextIdx = (currentIdx + 1) % classes.length;
                    setActiveClassId(classes[nextIdx].id);
                  }}
                  nextClassLabel={`SWITCH TO ${
                    classes[(classes.findIndex((c) => c.id === activeClassId) + 1) % classes.length]?.name
                  }`}
                  onProceedToTrain={
                    classes.every((c) => (examplesByClass[c.id] || []).length >= 2)
                      ? () => setStep('ready-to-train')
                      : null
                  }
                />
              </div>

              {/* Class Tabs & Capture Guide on Right */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-5 bg-white rounded-3xl border-2 border-[#DDE2E5] shadow-lg space-y-4">
                  <div className="flex items-center justify-between border-b border-[#DDE2E5] pb-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#4E8585]">
                      SELECT ACTIVE CLASS TO TEACH
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      {classes.length} CLASSES
                    </span>
                  </div>

                  {/* Class Switcher Tabs */}
                  <div className="grid grid-cols-1 gap-2.5">
                    {classes.map((cls) => {
                      const count = (examplesByClass[cls.id] || []).length;
                      const isActive = cls.id === activeClassId;

                      return (
                        <button
                          key={cls.id}
                          onClick={() => {
                            sound.playClick();
                            setActiveClassId(cls.id);
                          }}
                          className={`p-3.5 rounded-2xl border-2 flex items-center justify-between text-left transition-all ${
                            isActive
                              ? 'bg-[#18324A] text-white border-[#18324A] shadow-md scale-[1.01]'
                              : 'bg-[#F7F3EA] hover:bg-[#eae4d5] text-[#18324A] border-[#DDE2E5]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{cls.icon}</span>
                            <div>
                              <strong className="block font-display text-sm uppercase tracking-wide">
                                {cls.name}
                              </strong>
                              <span
                                className={`text-[11px] font-mono ${
                                  isActive ? 'text-[#E67E42]' : 'text-slate-500'
                                }`}
                              >
                                {count} samples captured
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            {count >= 3 ? (
                              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                                READY ✓
                              </span>
                            ) : (
                              <span className="text-xs font-mono text-amber-500">
                                Need {Math.max(0, 3 - count)} more
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Upload Image Examples for Active Class */}
                  <div className="pt-1">
                    <label className="cursor-pointer w-full py-2.5 px-3 rounded-xl border border-dashed border-[#18324A]/30 bg-[#F7F3EA] hover:bg-[#eae4d5] flex items-center justify-center gap-2 text-xs font-mono font-bold text-[#18324A] transition-colors">
                      <Upload className="w-3.5 h-3.5 text-[#E67E42]" />
                      <span>UPLOAD IMAGES FOR {classes.find((c) => c.id === activeClassId)?.name || 'CLASS'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleUploadImages(activeClassId, e.target.files);
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>
                  </div>

                  {/* Ready to train button */}
                  {classes.every((c) => (examplesByClass[c.id] || []).length >= 2) && (
                    <button
                      onClick={() => {
                        sound.playClick();
                        setStep('ready-to-train');
                      }}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-sm uppercase rounded-2xl shadow-xl flex items-center justify-center gap-2 animate-pulse transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>PROCEED TO TRAIN MODEL ➔</span>
                    </button>
                  )}
                </div>

                <div className="p-4 bg-[#F7F3EA] rounded-2xl border border-[#DDE2E5] text-xs space-y-2 font-mono text-slate-600">
                  <div className="font-bold text-[#18324A] uppercase flex items-center gap-1.5">
                    <span>💡 EXHIBITION TRAINING TIP:</span>
                  </div>
                  <p>
                    For <strong>CUSTOM OBJECTS</strong> (Water Bottle, Toy Car, Mug, Phone), hold the item up to the webcam or click &ldquo;Upload Images&rdquo;. For <strong>WAVING & GESTURES</strong>, use the webcam recorder to capture movement!
                  </p>
                </div>
              </div>
            </div>

            {/* Gallery of captured examples */}
            <ExampleGallery
              classes={classes}
              examplesByClass={examplesByClass}
              onDeleteExample={handleDeleteExample}
              onUploadImages={handleUploadImages}
            />
          </div>
        )}

        {/* STEP 4: READY TO TRAIN BOARD */}
        {step === 'ready-to-train' && (
          <TrainingBoard
            classes={classes}
            examplesByClass={examplesByClass}
            onStartTraining={handleStartTraining}
            onBackToCapture={() => setStep('collect-data')}
          />
        )}

        {/* STEP 5: COLLECTING PATTERNS ANIMATION */}
        {step === 'training-anim' && (
          <TrainingAnimation
            classes={classes}
            totalSamples={totalSamplesCount}
            onComplete={handleTrainingAnimationComplete}
            onSkip={handleTrainingAnimationComplete}
          />
        )}

        {/* STEP 6: LIVE TESTING CHAMBER & UNKNOWN REJECTION */}
        {step === 'testing' && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-500/10 text-emerald-700 text-xs font-mono font-bold tracking-wider uppercase mb-2">
                STAGE 04 · LIVE PREDICTION CHAMBER
              </div>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#18324A] uppercase">
                TEST YOUR MACHINE
              </h2>
              <p className="text-sm text-[#20303C]/80 mt-1">
                “Perform one of your trained actions. Or test an untrained gesture to see if the machine rejects it!”
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Live camera view with active skeleton tracking */}
              <div className="lg:col-span-6 space-y-4">
                <CameraView
                  stream={mediaStream}
                  videoRef={videoRef}
                  isCameraActive={isCameraActive}
                  cameraState={cameraState}
                  isDemoMode={isDemoMode}
                  demoImage={examplesByClass[classes[0].id]?.[0]?.dataUrl}
                  activeClass={classes.find((c) => c.name === currentPrediction?.prediction) || classes[0]}
                  capturedCount={totalSamplesCount}
                  targetCount={totalSamplesCount}
                  onEnableCamera={startCamera}
                  onUseDemoMode={startDemoMode}
                  onResetCamera={handleResetCameraOnly}
                  onStopCamera={stopCameraStream}
                  isScanning={true}
                  showCaptureButton={false}
                  onPerceptionUpdate={(result, windowSeq) => {
                    latestPerceptionRef.current = result;
                    rollingWindowRef.current = windowSeq;
                  }}
                />

                {/* What the Machine Sees expandable module */}
                <MachineVisionExplainer
                  perceptionData={latestPerceptionRef.current}
                  activeClassName={currentPrediction?.prediction}
                />
              </div>

              {/* Live Prediction Display from in-browser classifier */}
              <div className="lg:col-span-6 space-y-6">
                <PredictionDisplay
                  prediction={currentPrediction}
                  classes={classes}
                  onAddMoreExamples={() => setStep('collect-data')}
                  onResetExperiment={handleResetExperiment}
                />

                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      sound.playClick();
                      stopCameraStream();
                      setStep('takeaway');
                    }}
                    className="px-6 py-3.5 bg-[#E67E42] hover:bg-[#d66e33] text-white font-display font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2 transition-all hover:scale-105"
                  >
                    <span>Finish Experiment & See Takeaways ➔</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: EDUCATIONAL SYNTHESIS & TAKEAWAYS */}
        {step === 'takeaway' && (
          <TakeawayCard
            classes={classes}
            totalSamples={totalSamplesCount}
            onResetExperiment={handleResetExperiment}
            onTestAgain={() => {
              sound.playClick();
              startCamera();
              setStep('testing');
            }}
            onGoHome={onGoHome}
          />
        )}
      </div>

      {/* Developer Debug Panel (Section 35) */}
      <DeveloperDebugPanel
        perceptionData={latestPerceptionRef.current}
        windowLength={rollingWindowRef.current.length}
        currentPrediction={currentPrediction}
        classes={classes}
        dataset={actionClassifier.dataset}
        fps={fps}
        latencyMs={latencyMs}
        cameraState={cameraState}
        cameraSensors={cameraSensors}
      />
    </div>
  );
}

export default TrainMachine;
