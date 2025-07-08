import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import NotificationProvider from './components/Notification/NotificationContext.jsx'
import Router from './Router.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NotificationProvider>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </NotificationProvider>
  </StrictMode>,
)