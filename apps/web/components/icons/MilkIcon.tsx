import React from 'react';

export const MilkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M8 2h8v2H8z" />
    <path d="M9 2v17.5a2.5 2.5 0 0 0 2.5 2.5h1a2.5 2.5 0 0 0 2.5-2.5V2" />
    <path d="M9 4h6" />
    <path d="M9 8h6" />
    <path d="M9 12h6" />
  </svg>
);
