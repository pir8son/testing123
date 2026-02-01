
import React from 'react';

export const SushiIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <rect x="10" y="18" width="20" height="14" rx="2" fill="#F3F4F6" stroke="#1F2937" strokeWidth="2"/>
        <path d="M10 22H30" stroke="#1F2937" strokeWidth="1"/>
        <circle cx="20" cy="25" r="3" fill="#EF4444"/>
        <rect x="8" y="32" width="24" height="4" rx="1" fill="#111827"/>
        <path d="M32 10L26 18" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round"/>
        <path d="M22 10L16 18" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);
