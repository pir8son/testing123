
import React, { useRef, useState, useEffect } from 'react';
import { ClockIcon } from './icons/ClockIcon';

interface VideoFrameSelectorProps {
  videoFile: File;
  onTimeChange: (ms: number) => void;
  className?: string;
}

export const VideoFrameSelector: React.FC<VideoFrameSelectorProps> = ({ videoFile, onTimeChange, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(1); // Start at 1s default

  useEffect(() => {
    // Create a temporary URL for the video file to allow preview/seeking
    const url = URL.createObjectURL(videoFile);
    setVideoSrc(url);
    
    // Cleanup to prevent memory leaks
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      // Set initial position to 1s (to avoid black frames often found at 0s)
      videoRef.current.currentTime = 1; 
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    
    // Seek video to show preview of that frame
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
    
    // Report back to parent (convert seconds to ms)
    onTimeChange(val * 1000);
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Preview Area */}
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 group">
        <video 
            ref={videoRef}
            src={videoSrc}
            className="w-full h-full object-contain"
            onLoadedMetadata={handleLoadedMetadata}
            playsInline
            muted
        />
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
            <ClockIcon className="w-3 h-3" />
            <span>{currentTime.toFixed(1)}s</span>
        </div>
      </div>
      
      {/* Slider Controls */}
      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Select Cover Frame</label>
            <span className="text-xs font-mono text-gray-500">{currentTime.toFixed(1)}s / {duration.toFixed(1)}s</span>
        </div>
        
        <input 
            type="range"
            min="0"
            max={duration || 10}
            step="0.1"
            value={currentTime}
            onChange={handleSliderChange}
            className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-600 focus:outline-none focus:ring-2 focus:ring-green-500/50"
        />
        <p className="text-[10px] text-gray-400 text-center mt-2">
            Drag slider to pick the perfect moment for your thumbnail.
        </p>
      </div>
    </div>
  );
};
