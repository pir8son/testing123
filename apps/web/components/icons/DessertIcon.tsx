
import React from 'react';

export const DessertIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path d="M10 24L12 34H28L30 24H10Z" fill="#FBCFE8" stroke="#EC4899" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M10 24C10 20 12 16 20 16C28 16 30 20 30 24" fill="#FCE7F3" stroke="#EC4899" strokeWidth="2"/>
        <circle cx="20" cy="14" r="3" fill="#EF4444"/>
        <path d="M12 24C12 24 14 28 16 28" stroke="#EC4899" strokeWidth="1"/>
        <path d="M28 24C28 24 26 28 24 28" stroke="#EC4899" strokeWidth="1"/>
    </svg>
);
