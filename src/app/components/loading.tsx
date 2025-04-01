import React from 'react';

interface LoadingProps {
  /** Custom loading text to display */
  text?: string;
  /** Size of the spinner in pixels */
  size?: number;
  /** Color of the spinner (hex, rgb, or Tailwind class name) */
  color?: string;
  /** Whether to show the loading text */
  showText?: boolean;
  /** Full-screen mode (centers in viewport) */
  fullScreen?: boolean;
}

/**
 * Loading spinner component that can be used across the application
 * @example
 * // Basic usage
 * <Loading />
 * 
 * // Custom text
 * <Loading text="Please wait..." />
 * 
 * // Custom size and color
 * <Loading size={12} color="#FF5733" />
 * 
 * // Without text
 * <Loading showText={false} />
 */
export default function Loading({
  text = "Loading...",
  size = 8,
  color = "#2AA296",
  showText = true,
  fullScreen = true,
}: LoadingProps) {
  const spinnerSize = `h-${size} w-${size}`;
  const spinnerColor = color.startsWith('#') || color.startsWith('rgb') 
    ? { color } 
    : { className: `text-[${color}]` };

  const spinner = (
    <div className="flex flex-col items-center">
      <svg 
        className={`animate-spin ${spinnerSize} mb-4`}
        style={spinnerColor.className ? {} : spinnerColor}
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      {showText && <span className="text-gray-600">{text}</span>}
    </div>
  );

  // Return fullscreen wrapper or just the spinner
  return fullScreen ? (
    <div className="min-h-screen bg-beige-light flex items-center justify-center">
      {spinner}
    </div>
  ) : spinner;
}