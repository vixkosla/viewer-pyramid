import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'
import './Viewer.css'
// import App from './App.tsx'
import Viewer from './Viewer.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <App /> */}
    <Viewer />
  </StrictMode>,
)
