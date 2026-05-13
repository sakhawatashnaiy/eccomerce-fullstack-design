/**
 * Application entry point.
 * Mounts the React app into `#root` and loads global styles.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './index.css'
import App from './App.jsx'
import { store } from './app/store.js'
import { initAuthTokenListener } from './services/authClient.js'

// Apply saved admin theme ASAP (before React mounts) to avoid "dark not working" and flashes.
try {
  const savedTheme = localStorage.getItem('admin:theme') || 'light'
  const root = document.documentElement
  root.classList.toggle('theme-dark', savedTheme === 'dark')
  root.dataset.theme = savedTheme
} catch {
  // ignore
}

// Keep localStorage token in sync with Firebase (best-effort).
const unsubscribeAuthTokenListener = initAuthTokenListener()

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    try {
      unsubscribeAuthTokenListener?.()
    } catch {
      // ignore
    }
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
