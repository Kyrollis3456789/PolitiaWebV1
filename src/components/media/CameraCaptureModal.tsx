'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, X, Check, AlertCircle, Sparkles, SwitchCamera } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File, previewUrl: string) => void;
  isRtl?: boolean;
}

export function CameraCaptureModal({
  isOpen,
  onClose,
  onCapture,
  isRtl = false,
}: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraState, setCameraState] = useState<'initializing' | 'ready' | 'captured' | 'error'>('initializing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashActive, setIsFlashActive] = useState(false);

  // Check for camera devices
  const checkMultipleCameras = async () => {
    try {
      if (navigator.mediaDevices?.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      }
    } catch {
      // Ignore enumeration errors
    }
  };

  const startCamera = async (mode: 'user' | 'environment' = facingMode) => {
    stopCamera();
    setCameraState('initializing');
    setErrorMessage(null);
    setCapturedImageUrl(null);
    setCapturedBlob(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          isRtl
            ? 'المتصفح لا يدعم الوصول للكاميرا بشكل مباشر.'
            : 'Your browser does not support live camera access.'
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {});
          setCameraState('ready');
        };
      } else {
        setCameraState('ready');
      }

      await checkMultipleCameras();
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      setCameraState('error');
      const msg =
        err instanceof Error
          ? err.message
          : isRtl
          ? 'تعذر الوصول إلى الكاميرا. يرجى التأكد من منح الإذن.'
          : 'Unable to access camera. Please check permissions.';
      setErrorMessage(msg);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const switchCamera = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    // Trigger visual flash
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 200);

    const canvas = document.createElement('canvas');
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mirror snapshot if using front camera
    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setCapturedBlob(blob);
          setCapturedImageUrl(url);
          setCameraState('captured');
        }
      },
      'image/jpeg',
      0.95
    );
  };

  const handleCountdownShutter = (seconds = 3) => {
    if (countdown !== null) return;
    setCountdown(seconds);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          takeSnapshot();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRetake = () => {
    setCapturedImageUrl(null);
    setCapturedBlob(null);
    setCameraState('ready');
  };

  const handleConfirm = () => {
    if (!capturedBlob || !capturedImageUrl) return;
    const file = new File([capturedBlob], `camera_photo_${Date.now()}.jpg`, {
      type: 'image/jpeg',
    });
    onCapture(file, capturedImageUrl);
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1B212D] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#0B57D0] dark:text-[#A8C7FA]">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
                <bdi>{isRtl ? 'التقاط صورة بالكاميرا' : 'Take Profile Photo'}</bdi>
              </h2>
              <p className="text-xs text-[#444746] dark:text-[#C4C7C5]">
                <bdi>{isRtl ? 'وجّه وجهك داخل الإطار الدائري' : 'Center your face inside the circle'}</bdi>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport / Video Area */}
        <div className="relative w-full aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
          {/* Flash Effect */}
          {isFlashActive && (
            <div className="absolute inset-0 bg-white z-30 transition-opacity duration-200" />
          )}

          {/* Countdown Overlay */}
          {countdown !== null && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-xs">
              <span className="text-7xl font-extrabold text-white animate-ping">
                {countdown}
              </span>
            </div>
          )}

          {/* Live Video Stream */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${
              facingMode === 'user' ? '-scale-x-100' : ''
            } ${cameraState === 'captured' ? 'hidden' : 'block'}`}
          />

          {/* Captured Image Preview */}
          {cameraState === 'captured' && capturedImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={capturedImageUrl}
              alt="Captured"
              className="w-full h-full object-cover"
            />
          )}

          {/* Face Guide Overlay Circle */}
          {cameraState === 'ready' && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full border-2 border-dashed border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
              </div>
            </div>
          )}

          {/* Initializing State */}
          {cameraState === 'initializing' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white gap-3 p-6 text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
              <p className="text-sm font-medium">
                <bdi>{isRtl ? 'جاري تشغيل الكاميرا...' : 'Starting camera...'}</bdi>
              </p>
            </div>
          )}

          {/* Error State */}
          {cameraState === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95 text-white gap-4 p-6 text-center z-20">
              <div className="p-3 rounded-full bg-red-500/20 text-red-400">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-xs">
                <p className="text-sm font-bold text-red-300">
                  <bdi>{isRtl ? 'تعذر فتح الكاميرا' : 'Camera Access Failed'}</bdi>
                </p>
                <p className="text-xs text-slate-300">
                  <bdi>
                    {errorMessage ||
                      (isRtl
                        ? 'يرجى التحقق من أذونات الكاميرا في المتصفح أو استخدام خيار رفع ملف.'
                        : 'Please grant camera permissions or use the file upload option.')}
                  </bdi>
                </p>
              </div>
              <button
                type="button"
                onClick={() => startCamera(facingMode)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-full transition flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <bdi>{isRtl ? 'إعادة المحاولة' : 'Try Again'}</bdi>
              </button>
            </div>
          )}
        </div>

        {/* Action Controls Footer */}
        <div className="p-4 sm:p-5 bg-white dark:bg-[#1B212D] flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
          {cameraState === 'captured' ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <bdi>{isRtl ? 'إعادة التقاط' : 'Retake'}</bdi>
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#0B57D0] hover:bg-[#0842A0] text-white text-xs sm:text-sm font-semibold transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <bdi>{isRtl ? 'استخدام الصورة' : 'Use Photo'}</bdi>
              </button>
            </>
          ) : (
            <>
              {/* Switch camera button if multiple devices */}
              {hasMultipleCameras ? (
                <button
                  type="button"
                  onClick={switchCamera}
                  disabled={cameraState !== 'ready'}
                  className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
                  title={isRtl ? 'تبديل الكاميرا' : 'Switch camera'}
                >
                  <SwitchCamera className="w-5 h-5" />
                </button>
              ) : (
                <div className="w-10" />
              )}

              {/* Shutter Button */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => takeSnapshot()}
                  disabled={cameraState !== 'ready'}
                  className="w-14 h-14 rounded-full bg-[#0B57D0] hover:bg-[#0842A0] active:scale-95 text-white flex items-center justify-center shadow-lg transition-transform disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ring-4 ring-blue-100 dark:ring-blue-900/40"
                  title={isRtl ? 'التقاط فوري' : 'Capture photo'}
                >
                  <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-white" />
                  </div>
                </button>

                {/* 3s Countdown Timer Trigger */}
                <button
                  type="button"
                  onClick={() => handleCountdownShutter(3)}
                  disabled={cameraState !== 'ready' || countdown !== null}
                  className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title={isRtl ? 'مؤقت 3 ثواني' : '3s timer'}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>3s</span>
                </button>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-3 py-2 cursor-pointer"
              >
                <bdi>{isRtl ? 'إلغاء' : 'Cancel'}</bdi>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
