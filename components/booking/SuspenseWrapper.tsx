'use client';
import React, { Suspense, ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';

interface SuspenseWrapperProps {
  children: ReactNode;
  fallback: ReactNode;
  errorFallback?: ReactNode;
}

const SuspenseWrapper: React.FC<SuspenseWrapperProps> = ({ 
  children, 
  fallback, 
  errorFallback 
}) => {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

export default SuspenseWrapper;
