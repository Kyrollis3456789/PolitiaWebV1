'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  ZoomIn,
  ZoomOut,
  Sliders,
  Crop,
  Sparkles,
  Undo2,
  Check,
  Sun,
  Contrast as ContrastIcon,
  Palette,
} from 'lucide-react';

interface PhotoEditorModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  onClose: () => void;
  onSave: (file: File, previewUrl: string) => void;
  isRtl?: boolean;
}

type FilterPreset = 'none' | 'vivid' | 'warm' | 'cool' | 'noir' | 'sepia';

export function PhotoEditorModal({
  isOpen,
  imageUrl,
  onClose,
  onSave,
  isRtl = false,
}: PhotoEditorModalProps) {
  // Active Tab
  const [activeTab, setActiveTab] = useState<'crop' | 'filters'>('crop');

  // Transformation states
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // in degrees: 0, 90, 180, 270
  const [isFlippedH, setIsFlippedH] = useState(false);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Filter Adjustments
  const [brightness, setBrightness] = useState(0); // -50 to +50
  const [contrast, setContrast] = useState(0); // -50 to +50
  const [saturation, setSaturation] = useState(0); // -50 to +50
  const [selectedPreset, setSelectedPreset] = useState<FilterPreset>('none');

  // Dragging / Pan handling
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);

  // Reset when image changes or modal opens
  useEffect(() => {
    if (isOpen) {
      handleReset();
    }
  }, [isOpen, imageUrl]);

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setIsFlippedH(false);
    setPan({ x: 0, y: 0 });
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setSelectedPreset('none');
    setActiveTab('crop');
  };

  // Preset Filters definitions
  const applyPreset = (preset: FilterPreset) => {
    setSelectedPreset(preset);
    switch (preset) {
      case 'none':
        setBrightness(0);
        setContrast(0);
        setSaturation(0);
        break;
      case 'vivid':
        setBrightness(5);
        setContrast(20);
        setSaturation(30);
        break;
      case 'warm':
        setBrightness(5);
        setContrast(10);
        setSaturation(15);
        break;
      case 'cool':
        setBrightness(0);
        setContrast(15);
        setSaturation(-10);
        break;
      case 'noir':
        setBrightness(5);
        setContrast(30);
        setSaturation(-100);
        break;
      case 'sepia':
        setBrightness(5);
        setContrast(10);
        setSaturation(-30);
        break;
    }
  };

  // Pan / Drag interactions
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPan({
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy,
      });
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch interactions for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panStartRef.current = { ...pan };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartRef.current.x;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    setPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Compute CSS filter string for live preview
  const getFilterStyle = () => {
    const b = 100 + brightness;
    const c = 100 + contrast;
    const s = 100 + saturation;
    const sepiaVal = selectedPreset === 'sepia' ? 40 : 0;
    return `brightness(${b}%) contrast(${c}%) saturate(${s}%) sepia(${sepiaVal}%)`;
  };

  // Rotation handlers
  const rotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const rotateLeft = () => {
    setRotation((prev) => (prev - 90 + 360) % 360);
  };

  const toggleFlipH = () => {
    setIsFlippedH((prev) => !prev);
  };

  // Save / Render to Canvas
  const handleSave = () => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      const outputSize = 600; // Output square size (600x600)
      const canvas = document.createElement('canvas');
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Apply CSS-like filters on canvas
      const b = 100 + brightness;
      const c = 100 + contrast;
      const s = 100 + saturation;
      const sepiaVal = selectedPreset === 'sepia' ? 40 : 0;

      // Setup filter on context if supported
      if ('filter' in ctx) {
        ctx.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%) sepia(${sepiaVal}%)`;
      }

      // Fill background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, outputSize, outputSize);

      ctx.save();
      // Move to center of canvas
      ctx.translate(outputSize / 2, outputSize / 2);

      // Apply Pan (scale proportional to preview box of size 280px)
      const previewBoxSize = 280;
      const scaleFactor = outputSize / previewBoxSize;
      ctx.translate(pan.x * scaleFactor, pan.y * scaleFactor);

      // Apply Rotation
      ctx.rotate((rotation * Math.PI) / 180);

      // Apply Flip Horizontal
      if (isFlippedH) {
        ctx.scale(-1, 1);
      }

      // Calculate initial fit scaling
      const imgAspect = img.width / img.height;
      let drawW: number;
      let drawH: number;

      if (imgAspect >= 1) {
        // Wider than tall: match height to outputSize
        drawH = outputSize * zoom;
        drawW = drawH * imgAspect;
      } else {
        // Taller than wide: match width to outputSize
        drawW = outputSize * zoom;
        drawH = drawW / imgAspect;
      }

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const fileName = `edited_avatar_${Date.now()}.jpg`;
            const file = new File([blob], fileName, { type: 'image/jpeg' });
            const newPreviewUrl = URL.createObjectURL(blob);
            onSave(file, newPreviewUrl);
            onClose();
          }
        },
        'image/jpeg',
        0.92
      );
    };
  };

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
    >
      <div className="relative w-full max-w-xl bg-white dark:bg-[#1B212D] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#0B57D0] dark:text-[#A8C7FA]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
                <bdi>{isRtl ? 'تعديل الصورة الشخصية' : 'Edit Profile Photo'}</bdi>
              </h2>
              <p className="text-xs text-[#444746] dark:text-[#C4C7C5]">
                <bdi>{isRtl ? 'قص وتدوير وضبط الألوان والفلاتر' : 'Crop, rotate, and adjust colors'}</bdi>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Editor Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Interactive Crop Viewport */}
          <div className="flex flex-col items-center justify-center">
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={`relative w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden bg-slate-950 shadow-inner border-4 border-white dark:border-slate-700 select-none cursor-move flex items-center justify-center`}
              style={{ touchAction: 'none' }}
            >
              {/* Circular guide & grid overlay */}
              <div className="pointer-events-none absolute inset-0 rounded-full border border-white/40 z-10">
                {/* Crosshairs & rule of thirds */}
                <div className="absolute inset-x-0 top-1/3 border-b border-white/20 border-dashed" />
                <div className="absolute inset-x-0 top-2/3 border-b border-white/20 border-dashed" />
                <div className="absolute inset-y-0 start-1/3 border-e border-white/20 border-dashed" />
                <div className="absolute inset-y-0 start-2/3 border-e border-white/20 border-dashed" />
              </div>

              {/* Transformed Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imageElementRef}
                src={imageUrl}
                alt="Editing target"
                draggable={false}
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg) scale(${
                    isFlippedH ? -zoom : zoom
                  }, ${zoom})`,
                  filter: getFilterStyle(),
                  transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                }}
                className="max-w-none w-full h-full object-cover select-none pointer-events-none"
              />
            </div>
            <p className="text-[11px] text-[#747775] dark:text-[#8E918F] mt-2 text-center">
              <bdi>{isRtl ? '💡 اسحب الصورة للتحريك وضبط المركز' : '💡 Drag image to center within circular frame'}</bdi>
            </p>
          </div>

          {/* Navigation Tabs (Crop & Transform vs Filters & Colors) */}
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('crop')}
              className={`flex-1 pb-2.5 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
                activeTab === 'crop'
                  ? 'border-[#0B57D0] text-[#0B57D0] dark:border-[#A8C7FA] dark:text-[#A8C7FA]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Crop className="w-4 h-4" />
              <bdi>{isRtl ? 'القص والتدوير' : 'Crop & Rotate'}</bdi>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('filters')}
              className={`flex-1 pb-2.5 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
                activeTab === 'filters'
                  ? 'border-[#0B57D0] text-[#0B57D0] dark:border-[#A8C7FA] dark:text-[#A8C7FA]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <bdi>{isRtl ? 'الفلاتر والألوان' : 'Filters & Colors'}</bdi>
            </button>
          </div>

          {/* Tab 1: Crop & Transform Controls */}
          {activeTab === 'crop' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Zoom Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <ZoomIn className="w-3.5 h-3.5 text-[#0B57D0] dark:text-[#A8C7FA]" />
                    <bdi>{isRtl ? 'التكبير (الزووم)' : 'Zoom Level'}</bdi>
                  </span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(1, +(z - 0.1).toFixed(2)))}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <ZoomOut className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  </button>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 accent-[#0B57D0] dark:accent-[#A8C7FA] cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <ZoomIn className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  </button>
                </div>
              </div>

              {/* Transform Action Buttons (Rotate Left, Rotate Right, Flip H) */}
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={rotateLeft}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex flex-col items-center justify-center gap-1 cursor-pointer text-slate-700 dark:text-slate-200"
                >
                  <RotateCcw className="w-4 h-4 text-[#0B57D0] dark:text-[#A8C7FA]" />
                  <span className="text-[11px] font-medium"><bdi>{isRtl ? 'تدوير يساراً' : 'Rotate -90°'}</bdi></span>
                </button>

                <button
                  type="button"
                  onClick={rotateRight}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex flex-col items-center justify-center gap-1 cursor-pointer text-slate-700 dark:text-slate-200"
                >
                  <RotateCw className="w-4 h-4 text-[#0B57D0] dark:text-[#A8C7FA]" />
                  <span className="text-[11px] font-medium"><bdi>{isRtl ? 'تدوير يميناً' : 'Rotate +90°'}</bdi></span>
                </button>

                <button
                  type="button"
                  onClick={toggleFlipH}
                  className={`p-2.5 rounded-xl border transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    isFlippedH
                      ? 'border-[#0B57D0] bg-blue-50 dark:bg-blue-950/40 text-[#0B57D0] dark:text-[#A8C7FA]'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <FlipHorizontal className="w-4 h-4 text-[#0B57D0] dark:text-[#A8C7FA]" />
                  <span className="text-[11px] font-medium"><bdi>{isRtl ? 'انعكاس أفقي' : 'Flip Mirror'}</bdi></span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Filters & Color Adjustments */}
          {activeTab === 'filters' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Presets Horizontal list */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <bdi>{isRtl ? 'الفلاتر الجاهزة' : 'Filter Presets'}</bdi>
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {(
                    [
                      { id: 'none', labelEn: 'Original', labelAr: 'الأصلي' },
                      { id: 'vivid', labelEn: 'Vivid', labelAr: 'حيوي' },
                      { id: 'warm', labelEn: 'Warm', labelAr: 'دافئ' },
                      { id: 'cool', labelEn: 'Cool', labelAr: 'هادئ' },
                      { id: 'noir', labelEn: 'Noir (B&W)', labelAr: 'أبيض وأسود' },
                      { id: 'sepia', labelEn: 'Vintage', labelAr: 'كلاسيكي' },
                    ] as const
                  ).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => applyPreset(p.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                        selectedPreset === p.id
                          ? 'bg-[#0B57D0] text-white shadow-sm'
                          : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <bdi>{isRtl ? p.labelAr : p.labelEn}</bdi>
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Adjustments Sliders */}
              <div className="space-y-3 pt-2">
                {/* Brightness */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <bdi>{isRtl ? 'السطوع' : 'Brightness'}</bdi>
                    </span>
                    <span>{brightness > 0 ? `+${brightness}` : brightness}</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={brightness}
                    onChange={(e) => {
                      setBrightness(parseInt(e.target.value, 10));
                      setSelectedPreset('none');
                    }}
                    className="w-full accent-[#0B57D0] dark:accent-[#A8C7FA] cursor-pointer"
                  />
                </div>

                {/* Contrast */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <ContrastIcon className="w-3.5 h-3.5 text-blue-500" />
                      <bdi>{isRtl ? 'التباين' : 'Contrast'}</bdi>
                    </span>
                    <span>{contrast > 0 ? `+${contrast}` : contrast}</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={contrast}
                    onChange={(e) => {
                      setContrast(parseInt(e.target.value, 10));
                      setSelectedPreset('none');
                    }}
                    className="w-full accent-[#0B57D0] dark:accent-[#A8C7FA] cursor-pointer"
                  />
                </div>

                {/* Saturation */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-purple-500" />
                      <bdi>{isRtl ? 'تشبع الألوان' : 'Saturation'}</bdi>
                    </span>
                    <span>{saturation > 0 ? `+${saturation}` : saturation}</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={saturation}
                    onChange={(e) => {
                      setSaturation(parseInt(e.target.value, 10));
                      setSelectedPreset('none');
                    }}
                    className="w-full accent-[#0B57D0] dark:accent-[#A8C7FA] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-white dark:bg-[#1B212D] flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Undo2 className="w-4 h-4" />
            <bdi>{isRtl ? 'إعادة الضبط' : 'Reset'}</bdi>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
            >
              <bdi>{isRtl ? 'إلغاء' : 'Cancel'}</bdi>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-[#0B57D0] hover:bg-[#0842A0] text-white text-xs sm:text-sm font-semibold transition shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <bdi>{isRtl ? 'تطبيق التعديلات' : 'Apply & Save'}</bdi>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
