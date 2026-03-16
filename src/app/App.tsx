import { RouterProvider } from "react-router";
import { router } from "./routes.tsx";
import { AuthProvider } from "./contexts/AuthContext";
import { SnackbarProvider } from "./contexts/SnackbarContext";
import { PageLoader } from "./components/PageLoader";

export default function App() {
  return (
    <AuthProvider>
      <SnackbarProvider>
        <PageLoader />
        <RouterProvider router={router} />
      </SnackbarProvider>
    </AuthProvider>
  );
}