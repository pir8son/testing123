
import React, { useRef, useState, useEffect } from 'react';

interface SmartVideoPlayerProps {
  source: { uri: string };
  style?: string | React.CSSProperties; // Supports Tailwind strings or objects
  shouldPlay: boolean;
  resizeMode?: 'cover' | 'contain' | 'fill';
  isLooping?: boolean;
}

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export const SmartVideoPlayer: React.FC<SmartVideoPlayerProps> = ({
  source,
  style,
  shouldPlay,
  resizeMode = 'cover',
  isLooping = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- PLAYBACK CONTROL ---
  useEffect(() => {
    if (!videoRef.current) return;

    if (shouldPlay && !isScrubbing) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Autoplay policy or interruption usually causes this.
          // We fail silently as it's common in list scrolling.
        });
      }
    } else {
      videoRef.current.pause();
    }
  }, [shouldPlay, isScrubbing]);

  // --- EVENT HANDLERS ---

  const handleTimeUpdate = () => {
    if (videoRef.current && !isScrubbing) {
      setPosition(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  };

  // Called continuously while dragging
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setPosition(newTime);
    if (videoRef.current) {
        videoRef.current.currentTime = newTime;
    }
  };

  const handleScrubStart = () => {
      setIsScrubbing(true);
      videoRef.current?.pause();
  };

  const handleScrubEnd = () => {
      setIsScrubbing(false);
      if (shouldPlay) {
          videoRef.current?.play();
      }
  };

  // Resolve container styles
  const containerClassName = typeof style === 'string' 
    ? `relative bg-black overflow-hidden ${style}` 
    : "relative bg-black overflow-hidden w-full h-full";
    
  const containerStyle = typeof style === 'object' ? style : undefined;

  return (
    <div className={containerClassName} style={containerStyle}>
        {/* HTML5 Video Element */}
        <video
            ref={videoRef}
            src={source.uri}
            className={`w-full h-full object-${resizeMode}`}
            loop={isLooping}
            playsInline
            muted={false} // Ensure audio is enabled
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onWaiting={() => setIsLoading(true)}
            onPlaying={() => setIsLoading(false)}
            preload="metadata"
        />

        {/* Loading Indicator Overlay */}
        {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
        )}

        {/* Scrubber Control Bar */}
        <div 
            className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent z-20 flex flex-col justify-end transition-opacity duration-300"
            onClick={(e) => e.stopPropagation()} // Prevent parent click interactions (like pausing)
        >
            <div className="flex items-center gap-3">
                {/* Current Time */}
                <span className="text-[10px] font-medium text-white/90 font-mono min-w-[30px] text-right drop-shadow-md">
                    {formatTime(position)}
                </span>
                
                {/* Slider Container */}
                <div className="relative flex-grow h-6 flex items-center group">
                    
                    {/* Visual Track Background */}
                    <div className="absolute left-0 right-0 h-1 bg-white/30 rounded-full overflow-hidden pointer-events-none backdrop-blur-sm">
                        {/* Progress Fill */}
                        <div 
                            className="h-full bg-green-500 rounded-full transition-all duration-75 linear"
                            style={{ width: `${(position / (duration || 1)) * 100}%` }}
                        />
                    </div>
                    
                    {/* The Invisible Interaction Layer (Native Input) */}
                    {/* This sits on top to capture touches reliably */}
                    <input
                        type="range"
                        min="0"
                        max={duration || 0.1}
                        step="0.1"
                        value={position}
                        onChange={handleSeekChange}
                        onMouseDown={handleScrubStart}
                        onTouchStart={handleScrubStart}
                        onMouseUp={handleScrubEnd}
                        onTouchEnd={handleScrubEnd}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    
                    {/* Custom Visual Thumb */}
                    {/* Follows the position state purely for aesthetics */}
                    <div 
                        className="absolute w-3 h-3 bg-white rounded-full shadow-md pointer-events-none transition-transform duration-100 ease-out group-hover:scale-125 group-active:scale-150"
                        style={{ 
                            left: `${(position / (duration || 1)) * 100}%`,
                            transform: 'translateX(-50%)' 
                        }}
                    />
                </div>

                {/* Total Duration */}
                <span className="text-[10px] font-medium text-white/60 font-mono min-w-[30px] drop-shadow-md">
                    {formatTime(duration)}
                </span>
            </div>
        </div>
    </div>
  );
};
