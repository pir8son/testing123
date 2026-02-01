
import React from 'react';

export const ShakerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M6 7v13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7" />
    <path d="M17 7V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v3" />
    <path d="M5 7h14" />
    <circle cx="9.5" cy="12.5" r=".5" fill="currentColor" />
    <circle cx="14.5" cy="12.5" r=".5" fill="currentColor" />
    <circle cx="12" cy="16.5" r=".5" fill="currentColor" />
  </svg>
);
