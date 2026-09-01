import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './shared/styles/global.css';
import './shared/styles/componentes.css';
import './features/auth/styles/login.css';
import './features/pedidos/styles/pedidos.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
