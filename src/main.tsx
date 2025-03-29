
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Make sure we have a root element to render to
const rootElement = document.getElementById("root");
if (!rootElement) {
  const errorDiv = document.createElement("div");
  errorDiv.style.color = "red";
  errorDiv.style.padding = "20px";
  errorDiv.innerText = "Unable to find root element. Please check your HTML structure.";
  document.body.appendChild(errorDiv);
} else {
  createRoot(rootElement).render(<App />);
}
