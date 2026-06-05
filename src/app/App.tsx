import { RouterProvider } from "react-router";
import { router } from "./routes.tsx";
import { AuthProvider } from "./contexts/AuthContext";
import { SnackbarProvider } from "./contexts/SnackbarContext";
import { ConfirmProvider } from "./contexts/ConfirmContext";
import { ClinicDataProvider } from "./contexts/ClinicDataContext";
import { OwnersProvider } from "./contexts/OwnersContext";
import { PetsProvider } from "./contexts/PetsContext";
import { IPDProvider } from "./contexts/IPDContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { PageLoader } from "./components/PageLoader";

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ClinicDataProvider>
          <OwnersProvider>
            <PetsProvider>
              <IPDProvider>
                <SnackbarProvider>
                  <ConfirmProvider>
                    <PageLoader />
                    <RouterProvider router={router} />
                  </ConfirmProvider>
                </SnackbarProvider>
              </IPDProvider>
            </PetsProvider>
          </OwnersProvider>
        </ClinicDataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}