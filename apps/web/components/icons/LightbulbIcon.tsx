
import React from 'react';

export const LightbulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        {...props}
    >
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M12 2a7 7 0 0 0-7 7c0 3.03 1.09 5.14 2.5 6.5C8.91 16.9 10.27 18 12 18s3.09-1.1 4.5-2.5c1.41-1.36 2.5-3.47 2.5-6.5a7 7 0 0 0-7-7z" />
    </svg>
);
