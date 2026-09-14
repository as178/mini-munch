import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router";
import { router } from "./router.tsx";
import { Toaster } from "react-hot-toast";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* router for pages */}
    <RouterProvider router={router} />

    {/* toaster for all notifications */}
    <Toaster />
  </StrictMode>,
);
