import React from 'react';

const FlowPayLogo = ({ size = 'large' }) => {
  const dimensions = size === 'large' ? { width: 180, height: 50 } : { width: 120, height: 32 };
  return (
    <svg width={dimensions.width} height={dimensions.height} viewBox="0 0 180 50" fill="none">
      <defs>
        <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <path d="M10 25C10 25 20 15 30 25C40 35 50 15 60 25" stroke="url(#flowGradient)" strokeWidth="4" strokeLinecap="round" fill="none" />
      <text x="70" y="32" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="url(#flowGradient)">FlowPay</text>
    </svg>
  );
};

export default FlowPayLogo; 