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
