import { RouterProvider } from "react-router";
import { router } from "./routes.tsx";
import { AuthProvider } from "./contexts/AuthContext";
import { SnackbarProvider } from "./contexts/SnackbarContext";
import { ClinicDataProvider } from "./contexts/ClinicDataContext";
import { OwnersProvider } from "./contexts/OwnersContext";
import { PetsProvider } from "./contexts/PetsContext";
import { PageLoader } from "./components/PageLoader";

export default function App() {
  return (
    <AuthProvider>
      <ClinicDataProvider>
        <OwnersProvider>
          <PetsProvider>
            <SnackbarProvider>
              <PageLoader />
              <RouterProvider router={router} />
            </SnackbarProvider>
          </PetsProvider>
        </OwnersProvider>
      </ClinicDataProvider>
    </AuthProvider>
  );
}