'use client';

import React, { useState, useEffect, useContext } from 'react';
import { GlobalStateContext } from '@/contexts/GlobalStateContext';

export default function PageSpinner() {
  const { loading, loaded, setLoading, setLoaded } = useContext(GlobalStateContext);
  const [state, setState] = useState('');

  // Handle state transitions
  useEffect(() => {
    if (loading && !loaded) {
      setState('loading');
    } else if (!loading && loaded) {
      setState('loaded');
      const timer = setTimeout(() => {
        setState('complete');
      }, 2000); // Delay before transitioning to 'complete'

      return () => clearTimeout(timer); // Clean up timer
    }
  }, [loading, loaded]);

  // Handle cleanup when the spinner is complete
  useEffect(() => {
    if (state === 'complete') {
      setLoaded(false);
      setLoading(false);
      setState(''); // Reset spinner state
    }
  }, [state, setLoaded, setLoading]);

  // Spinner class management
  const spinnerBaseClass =
    'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-cover';

  let spinnerClass = '';

  if (state === 'loading') {
    spinnerClass = `${spinnerBaseClass} bg-[url('https://cdn.indejuice.com/img/icons/page-spinner-loader.png')] animate-spin opacity-100`;
  } else if (state === 'loaded') {
    spinnerClass = `${spinnerBaseClass} bg-[url('https://cdn.indejuice.com/img/icons/page-spinner-loaded.png')] animate-reverseSpin opacity-100 transition-opacity duration-400`;
  }

  if (!state) {
    return null; // Do not render the spinner when there's no state
  }

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.8)] z-[1000]">
      <div className={spinnerClass}></div>
    </div>
  );
}
