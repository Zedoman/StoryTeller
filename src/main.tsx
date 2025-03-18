import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { FlagsmithProvider } from "./contexts/FlagsmithContext";

import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

const basename = import.meta.env.BASE_URL;

// Using Flagsmith with environment ID from .env file
console.log(
  "Flagsmith environment ID:",
  import.meta.env.VITE_FLAGSMITH_ENVIRONMENT_ID,
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <FlagsmithProvider>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </FlagsmithProvider>
  </React.StrictMode>,
);
