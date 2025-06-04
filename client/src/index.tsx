import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Screen from "./pages/Screen";

const queryClient = new QueryClient();

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Screen />
    </QueryClientProvider>
  </StrictMode>
);
