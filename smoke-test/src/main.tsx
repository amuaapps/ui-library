import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import '@amuaapps/ui-theme-core/theme.css';

// Add theme-core class to root element
document.documentElement.classList.add('theme-core');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
