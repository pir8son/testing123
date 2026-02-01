
import React from 'react';

export const PastaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path d="M5 25C5 25 10 35 20 35C30 35 35 25 35 25" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 25V15C10 12 12 10 15 10H25C28 10 30 12 30 15V25" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round"/>
        <path d="M15 25V15" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round"/>
        <path d="M20 25V15" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round"/>
        <path d="M25 25V15" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round"/>
        <path d="M8 35L32 35" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);
