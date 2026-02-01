
import React from 'react';

export const FlameIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M12 22c-5 0-7-2-7-5 0-3 3-5 5-5 2 0 3 2 3 4s-1 4-3 4c-2 0-3-2-3-4" />
    <path d="M10.1 9.4C7.8 8.4 6.2 7.2 5 6c-2-2-3-4-1-6s4 1 6 3c1.2 1.2 2.4 2.8 3.4 5.1" />
  </svg>
);
