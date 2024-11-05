'use client'

import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import { LoadingContext } from '@/contexts/LoadingContext';

export default function PageSpinner() {
  const { loading, loaded } = useContext(LoadingContext);
  const [state, setState] = useState('');
  // const [isVisible, setIsVisible] = useState(loading);

  useEffect(() => {
    if (loading === true && loaded === false) {
      // Transition to 'loaded' after 3 seconds
      setState('loading');
      // setTimeout(() => setState('loading'), 3000);
    } else if (loading === false && loaded === true) {
      setState('loaded');
      setTimeout(() => setState('complete'), 2000);
    }
  }, [loading, loaded]);

  // if (!isVisible) {
  //   return null; // Unmount the component
  // }

  const spinnerBaseClass =
    'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-cover';

  let spinnerClass = '';

  if (state === 'loading') {
    spinnerClass = `${spinnerBaseClass} bg-[url('https://cdn.indejuice.com/img/icons/page-spinner-loader.png')] animate-spin opacity-100`;
  } else if (state === 'loaded') {
    spinnerClass = `${spinnerBaseClass} bg-[url('https://cdn.indejuice.com/img/icons/page-spinner-loaded.png')] animate-reverseSpin opacity-100 transition-opacity duration-400`;
  } else if (state === 'complete') {
    setState('');
    return null;
    // spinnerClass = `${spinnerBaseClass} opacity-0 transition-opacity duration-400`;
  } else {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.8)] z-[1000]">
      <div className={spinnerClass}></div>
    </div>
  );
}