import { useRef, useEffect, useState, useCallback } from "react";

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
}

export const PriceRangeSlider = ({
  min,
  max,
  value,
  onChange,
  step = 1,
}: PriceRangeSliderProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeThumb, setActiveThumb] = useState<0 | 1 | null>(null);

  // Compute thumb positions directly from props to avoid sync issues
  const thumbPositions: [number, number] = [
    ((value[0] - min) / (max - min)) * 100,
    ((value[1] - min) / (max - min)) * 100,
  ];

  const updateThumbPosition = useCallback((clientX: number, thumbIndex: 0 | 1) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const newValue = min + (percentage / 100) * (max - min);
    const steppedValue = Math.round(newValue / step) * step;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));

    const newValues = [value[0], value[1]];
    newValues[thumbIndex] = clampedValue;
    // Ensure min <= max
    if (thumbIndex === 0 && newValues[0] > newValues[1]) newValues[1] = newValues[0];
    if (thumbIndex === 1 && newValues[1] < newValues[0]) newValues[0] = newValues[1];
    onChange(newValues as [number, number]);
  }, [min, max, step, value, onChange]);

  const handleMouseDown = (e: React.MouseEvent, thumbIndex: 0 | 1) => {
    e.preventDefault();
    setActiveThumb(thumbIndex);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (activeThumb !== null) {
        updateThumbPosition(e.clientX, activeThumb);
      }
    };
    const handleMouseUp = () => {
      setActiveThumb(null);
    };

    if (activeThumb !== null) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [activeThumb, updateThumbPosition]);

  const handleTouchStart = (e: React.TouchEvent, thumbIndex: 0 | 1) => {
    e.preventDefault();
    setActiveThumb(thumbIndex);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (activeThumb !== null && e.touches[0]) {
      updateThumbPosition(e.touches[0].clientX, activeThumb);
    }
  };

  const handleTouchEnd = () => {
    setActiveThumb(null);
  };

  const handleTrackClick = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const percentage = ((e.clientX - rect.left) / rect.width) * 100;
    // Determine which thumb is closer
    const distToThumb0 = Math.abs(percentage - thumbPositions[0]);
    const distToThumb1 = Math.abs(percentage - thumbPositions[1]);
    const thumbIndex = distToThumb0 < distToThumb1 ? 0 : 1;
    updateThumbPosition(e.clientX, thumbIndex);
  };

  return (
    <div className="relative h-6" role="slider" aria-label="Price range">
      <div
        ref={trackRef}
        className="relative h-1 bg-border rounded-full mt-2.5"
        onClick={handleTrackClick}
      >
        {/* Selected range */}
        <div
          className="absolute h-1 bg-primary rounded-full top-0"
          style={{
            left: `${thumbPositions[0]}%`,
            width: `${thumbPositions[1] - thumbPositions[0]}%`,
          }}
        />
        {/* Min thumb */}
        <button
          type="button"
          className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-primary shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
            activeThumb === 0 ? "scale-125 z-10" : "z-0"
          }`}
          style={{ left: `calc(${thumbPositions[0]}% - 8px)` }}
          onMouseDown={(e) => handleMouseDown(e, 0)}
          onTouchStart={(e) => handleTouchStart(e, 0)}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          aria-label={`Minimum price: $${value[0]}`}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value[0]}
        />
        {/* Max thumb */}
        <button
          type="button"
          className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-primary shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
            activeThumb === 1 ? "scale-125 z-10" : "z-0"
          }`}
          style={{ left: `calc(${thumbPositions[1]}% - 8px)` }}
          onMouseDown={(e) => handleMouseDown(e, 1)}
          onTouchStart={(e) => handleTouchStart(e, 1)}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          aria-label={`Maximum price: $${value[1]}`}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value[1]}
        />
      </div>
      <div className="flex justify-between text-xs text-text-muted mt-2">
        <span>${min}</span>
        <span>${max}</span>
      </div>
    </div>
  );
};