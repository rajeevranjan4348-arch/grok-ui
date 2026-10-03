import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { UpdaterProvider } from "./hooks/UpdaterProvider";
import "./styles/tokens.css";
import "./styles/skins.css";
import "./styles/tailwind.css";
import "./styles/app.css";
import App from "./App";

const root = createRoot(document.getElementById("root")!);

root.render(
  <StrictMode>
    <UpdaterProvider>
      <App />
    </UpdaterProvider>
  </StrictMode>,
);
