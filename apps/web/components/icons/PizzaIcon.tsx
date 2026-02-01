
import React from 'react';

export const PizzaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path d="M20 8L34 34H6L20 8Z" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M6 34Q20 38 34 34" fill="#F59E0B" stroke="#B45309" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="20" cy="24" r="2" fill="#EF4444"/>
        <circle cx="16" cy="28" r="1.5" fill="#EF4444"/>
        <circle cx="24" cy="28" r="1.5" fill="#EF4444"/>
        <circle cx="20" cy="16" r="1.5" fill="#EF4444"/>
    </svg>
);
