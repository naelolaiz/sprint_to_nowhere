import ReactDOM from 'react-dom/client'
import './index.css'
import SprintToNowhere from './SprintToNowhere.jsx'
import { initLocale } from './i18n/index.js'

// Load the player's language before the first render, so the menu does not
// flash in English first.
initLocale().finally(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(<SprintToNowhere />)
})
