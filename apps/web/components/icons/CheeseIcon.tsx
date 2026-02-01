
import React from 'react';

export const CheeseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M19.66 4.27a2 2 0 0 0-2.18-.34L3.2 10.56a2 2 0 0 0-1.09 2.49l3.49 10.46a1 1 0 0 0 1.27.63l15.59-5.19a1 1 0 0 0 .63-1.27l-3.43-13.41Z" />
    <circle cx="12" cy="14" r="1.5" />
    <circle cx="16" cy="9" r="1" />
    <circle cx="8" cy="18" r="1" />
  </svg>
);
