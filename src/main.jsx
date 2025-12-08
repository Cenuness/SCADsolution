import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Remova qualquer import de CSS global aqui
// O estilo já está no index.html

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)