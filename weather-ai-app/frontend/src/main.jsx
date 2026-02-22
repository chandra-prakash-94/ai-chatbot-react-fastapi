import React from "react";
import ReactDOM from "react-dom/client";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <CopilotKit runtimeUrl="https://solid-sniffle-9qx66jv442xq59-8000.app.github.dev/copilotkit">
    <App />
    <CopilotChat />
  </CopilotKit>
);
