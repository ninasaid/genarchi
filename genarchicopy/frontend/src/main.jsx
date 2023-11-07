import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { QuotesProvider } from './QuoteContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QuotesProvider>
      <App />
    </QuotesProvider>
  </React.StrictMode>,
)
