import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './shared/styles/global.css';
import './shared/styles/components.css';
import './features/auth/styles/login.css';
import './features/orders/styles/orders.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
