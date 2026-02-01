
import React from 'react';

export const DrumstickIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M16.5 14.5a4.95 4.95 0 0 0-7-7l-6.4 6.4a4.95 4.95 0 0 0 7 7l6.4-6.4z" />
    <path d="M13.7 17.3 18 21.6" />
    <path d="M21.6 18 17.3 13.7" />
    <path d="m19.1 19.1 2.1-2.1" />
  </svg>
);
