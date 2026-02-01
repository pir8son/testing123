import React from 'react';

export const CakeSliceIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <circle cx="9" cy="7" r="2" />
    <path d="M7.2 7.9 3 11v9h18v-9l-4.2-3.1" />
    <path d="M3 11h18" />
    <path d="m3.6 15.6 16.8-3.2" />
    <path d="m3.6 19.8 16.8-3.2" />
  </svg>
);
