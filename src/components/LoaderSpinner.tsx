import React from 'react';

interface LoaderSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  inline?: boolean;
}

export function LoaderSpinner({ size = 'medium', text, inline = false }: LoaderSpinnerProps) {
  const sizeClasses = {
    small: 'small',
    medium: 'medium',
    large: 'large',
  };

  const containerClass = inline ? `loader-container ${sizeClasses[size]}` : 'loader-container';

  return (
    <div className={containerClass}>
      <div className={`loader-spinner ${sizeClasses[size]}`}></div>
      {text && <div className="loader-text">{text}</div>}
    </div>
  );
}
