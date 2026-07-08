
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import { seedRuntimeOnce } from "./app/data/seedRuntime";
  import "./styles/index.css";

  seedRuntimeOnce();

  createRoot(document.getElementById("root")!).render(<App />);
  