import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { CurrencyProvider } from './context/CurrencyContext'
import { CartProvider } from './context/CartContext'
import { Toaster } from './components/ui/toaster'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <CurrencyProvider>
        <CartProvider>
          <App />
          <Toaster />
        </CartProvider>
      </CurrencyProvider>
    </AuthProvider>
  </BrowserRouter>
);
