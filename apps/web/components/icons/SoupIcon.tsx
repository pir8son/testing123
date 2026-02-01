
import React from 'react';

export const SoupIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path d="M8 22C8 22 12 32 20 32C28 32 32 22 32 22" fill="#FFEDD5" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 22H32" stroke="#F97316" strokeWidth="2"/>
        <path d="M14 14C14 14 16 10 16 12" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
        <path d="M20 12C20 12 22 8 22 10" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
        <path d="M26 14C26 14 28 10 28 12" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
        <path d="M6 32H34" stroke="#F97316" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);
