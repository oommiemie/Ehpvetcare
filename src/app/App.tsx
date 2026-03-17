import { RouterProvider } from "react-router";
import { router } from "./routes.tsx";
import { AuthProvider } from "./contexts/AuthContext";
import { SnackbarProvider } from "./contexts/SnackbarContext";
import { ClinicDataProvider } from "./contexts/ClinicDataContext";
import { PageLoader } from "./components/PageLoader";

export default function App() {
  return (
    <AuthProvider>
      <ClinicDataProvider>
        <SnackbarProvider>
          <PageLoader />
          <RouterProvider router={router} />
        </SnackbarProvider>
      </ClinicDataProvider>
    </AuthProvider>
  );
}