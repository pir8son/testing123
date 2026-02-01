
import React from 'react';

export const SaladIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path d="M6 24C6 24 10 34 20 34C30 34 34 24 34 24" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 20C12 16 16 14 20 14C24 14 28 16 28 20" stroke="#34D399" strokeWidth="2" strokeLinecap="round" fill="#D1FAE5"/>
        <circle cx="16" cy="18" r="2" fill="#EF4444"/>
        <circle cx="24" cy="18" r="2" fill="#EF4444"/>
        <circle cx="20" cy="22" r="2" fill="#EF4444"/>
        <path d="M4 34H36" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);
