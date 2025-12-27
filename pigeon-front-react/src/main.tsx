import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SupabaseProvider } from "./supabase/provider";
import { BrowserRouter, Route, Routes } from "react-router";
import { LoginView, MessagingView, RegisterView } from "./views";
import { ProtectedRoute } from "./utils";

import "./index.scss";

const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SupabaseProvider>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/login" Component={LoginView} />
          <Route path="/register" Component={RegisterView} />
          <Route
            index
            element={
              <ProtectedRoute>
                <MessagingView />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </SupabaseProvider>
  </StrictMode>
);
