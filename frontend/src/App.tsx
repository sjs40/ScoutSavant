import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ScoutPage } from "./pages/ScoutPage";
import { useFilterStore } from "./store/filterStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function KeyboardHandler() {
  const clearFilters = useFilterStore((s) => s.clearFilters);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.defaultPrevented) clearFilters();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [clearFilters]);
  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <KeyboardHandler />
        <Routes>
          <Route path="/scout/pitcher" element={<ScoutPage />} />
          <Route path="*" element={<Navigate to="/scout/pitcher" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
