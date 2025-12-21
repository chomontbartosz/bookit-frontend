import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const rootElement = document.getElementById('root')!;
rootElement.className = 'w-full min-h-screen bg-slate-50 flex justify-center items-center';

  createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
