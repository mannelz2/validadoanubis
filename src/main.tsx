import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

setInterval(() => {
  console.clear();
}, 200);

createRoot(document.getElementById('root')!).render(
  <App />
);
