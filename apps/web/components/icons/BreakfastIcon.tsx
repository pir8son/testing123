
import React from 'react';

export const BreakfastIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <circle cx="20" cy="20" r="12" fill="#F3F4F6" stroke="#9CA3AF" strokeWidth="2"/>
        <circle cx="20" cy="20" r="5" fill="#FCD34D"/>
        <path d="M26 8L28 14" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
        <path d="M14 8L12 14" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
        <path d="M20 6V12" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);
