import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Screen } from "./screens/Screen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Screen />
    </QueryClientProvider>
  </StrictMode>
);
