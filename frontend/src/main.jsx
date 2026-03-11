import { StrictMode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CatProvider } from './context/CategoriesContext.jsx'
import { AuthProvider } from './context/AuthProvider.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <StrictMode>
    <AuthProvider>
      <CatProvider>
        <App />
      </CatProvider> 
   </AuthProvider>
  </StrictMode>
  </BrowserRouter>
)
