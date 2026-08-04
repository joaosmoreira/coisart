import React from 'react';

interface WaveDividerProps {
  fillColor?: string;
  className?: string;
}

export const WaveDivider: React.FC<WaveDividerProps> = ({
  fillColor = '#3D405B',
  className = ''
}) => {
  return (
    <div className={`w-full overflow-hidden leading-none ${className}`}>
      <svg
        className="w-full h-10 sm:h-14 md:h-16 block"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
      >
        <path
          fill={fillColor}
          d="M0,32L48,42.7C96,53,192,75,288,80C384,85,480,75,576,64C672,53,768,43,864,48C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
        />
      </svg>
    </div>
  );
};
