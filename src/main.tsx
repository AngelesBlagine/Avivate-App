import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
//C:\Users\abril\OneDrive\Documentos\RepoClon - Mio\Avivate-App\frontend\src
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
