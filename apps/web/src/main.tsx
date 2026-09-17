import './preload'
import React from 'react'
import ReactDOM from 'react-dom/client'
import WebPortal from './web/WebPortal'
import './index.css'

const container = document.getElementById('root')!

// Reuse existing root across HMR reloads to avoid the double-createRoot warning
type RootContainer = HTMLElement & { _reactRoot?: ReactDOM.Root }
const c = container as RootContainer
if (!c._reactRoot) {
  c._reactRoot = ReactDOM.createRoot(c)
}

c._reactRoot.render(
  <React.StrictMode>
    <WebPortal />
  </React.StrictMode>,
)
