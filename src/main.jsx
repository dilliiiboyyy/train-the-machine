// Suppress benign internal TFLite XNNPACK delegate messages in browser
const isTFLiteLog = (args) => {
  for (let i = 0; i < args.length; i++) {
    const val = String(args[i]);
    if (
      val.includes('TensorFlow Lite') ||
      val.includes('XNNPACK') ||
      val.includes('Created TensorFlow Lite XNNPACK delegate')
    ) {
      return true;
    }
  }
  return false;
};

['error', 'warn', 'info', 'log'].forEach((method) => {
  const orig = console[method];
  console[method] = function (...args) {
    if (isTFLiteLog(args)) return;
    return orig.apply(console, args);
  };
});

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(<App />);

