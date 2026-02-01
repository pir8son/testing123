
import React from 'react';

export const BottleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M7 10v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V10" />
    <path d="M8 6v4h8V6" />
    <path d="M9 2h6" />
    <path d="M10 2v4" />
    <path d="M14 2v4" />
    <path d="M12 14v4" />
  </svg>
);
