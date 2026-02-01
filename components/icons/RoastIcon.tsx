
import React from 'react';

export const RoastIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path d="M8 24C8 24 12 16 24 16C30 16 34 20 34 24" fill="#FCD34D" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M34 24C34 24 32 28 24 28C16 28 8 24 8 24Z" fill="#F59E0B" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M34 24L38 22" stroke="#D97706" strokeWidth="2" strokeLinecap="round"/>
        <path d="M8 24L4 22" stroke="#D97706" strokeWidth="2" strokeLinecap="round"/>
        <path d="M20 20V18C20 18 22 16 24 16" stroke="#92400E" strokeWidth="1"/>
    </svg>
);
