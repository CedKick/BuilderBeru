// src/components/ResponsiveUI.jsx
// Responsive UI components for mobile-friendly experience
// Usage: Import and replace standard divs/buttons with these components

import React from 'react';

/**
 * ResponsiveText - Auto-scales text based on screen size
 * @param {string} size - 'tiny'|'small'|'normal'|'medium'
 * @param {string} className - Additional Tailwind classes
 */
export const ResponsiveText = ({ size = 'normal', className = '', children, ...props }) => {
  const sizeClass = {
    tiny: 'text-responsive-tiny',
    small: 'text-responsive-small',
    normal: 'text-responsive-normal',
    medium: 'text-responsive-medium',
  }[size] || 'text-responsive-normal';

  return (
    <span className={`${sizeClass} ${className}`} {...props}>
      {children}
    </span>
  );
};

/**
 * TouchButton - Touch-friendly button with min 44px hit area on mobile
 * @param {string} variant - 'primary'|'secondary'|'icon'
 * @param {string} className - Additional Tailwind classes
 */
export const TouchButton = ({ variant = 'primary', className = '', children, ...props }) => {
  const baseClass = variant === 'icon'
    ? 'btn-icon-touch'
    : 'btn-touch-friendly';

  return (
    <button className={`${baseClass} ${className}`} {...props}>
      {children}
    </button>
  );
};

/**
 * ResponsiveGrid - Auto-adjusts grid columns based on screen size
 * @param {number} cols - Desktop columns (1-4)
 */
export const ResponsiveGrid = ({ cols = 2, className = '', children, ...props }) => {
  const gridClass = {
    1: '',  // Always 1 column
    2: 'grid-responsive-2',
    3: 'grid-responsive-3',
    4: 'grid-responsive-4',
  }[cols] || 'grid-responsive-2';

  return (
    <div className={`${gridClass} ${className}`} {...props}>
      {children}
    </div>
  );
};

/**
 * ResponsiveCard - Stat/info card with adaptive padding
 */
export const ResponsiveCard = ({ className = '', children, ...props }) => {
  return (
    <div className={`stat-card-responsive ${className}`} {...props}>
      {children}
    </div>
  );
};

/**
 * ResponsiveModal - Fullscreen on mobile, centered on desktop
 */
export const ResponsiveModal = ({ className = '', children, ...props }) => {
  return (
    <div className={`modal-responsive ${className}`} {...props}>
      {children}
    </div>
  );
};

/**
 * MobileOnly - Only visible on mobile
 */
export const MobileOnly = ({ className = '', children, ...props }) => {
  return (
    <div className={`mobile-only ${className}`} {...props}>
      {children}
    </div>
  );
};

/**
 * DesktopOnly - Only visible on desktop
 */
export const DesktopOnly = ({ className = '', children, ...props }) => {
  return (
    <div className={`desktop-only ${className}`} {...props}>
      {children}
    </div>
  );
};

/**
 * ResponsiveContainer - Adaptive padding and gaps
 */
export const ResponsiveContainer = ({ gap = 'normal', className = '', children, ...props }) => {
  const gapClass = gap === 'tight' ? 'gap-responsive-tight' : 'gap-responsive';

  return (
    <div className={`p-responsive ${gapClass} ${className}`} {...props}>
      {children}
    </div>
  );
};
