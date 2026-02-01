
import React from 'react';

export const BreadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M2 13a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V9a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v4Z" />
    <path d="M2 13h20" />
    <path d="M6 16v4" />
    <path d="M10 16v4" />
    <path d="M14 16v4" />
    <path d="M18 16v4" />
    <path d="M6 5v4" />
    <path d="M10 5v4" />
    <path d="M14 5v4" />
    <path d="M18 5v4" />
  </svg>
);
