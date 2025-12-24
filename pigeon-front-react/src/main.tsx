import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SupabaseProvider } from "./supabase/provider";
import { BrowserRouter, Route, Routes } from "react-router";
import { LoginView, MessagingView } from "./views";
import { ProtectedRoute } from "./utils";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SupabaseProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" Component={LoginView} />
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
