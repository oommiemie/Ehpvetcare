import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Owners } from "./pages/Owners";
import { OwnerDetail } from "./pages/OwnerDetail";
import { Pets } from "./pages/Pets";
import { PetDetail } from "./pages/PetDetail";
import { Visits } from "./pages/Visits";
import { Appointments } from "./pages/Appointments";
import { SlotBuilder } from "./pages/SlotBuilder";
import { Financial } from "./pages/Financial";
import { Grooming } from "./pages/Grooming";
import { Notifications } from "./pages/Notifications";
import { Settings } from "./pages/Settings";
import { Boarding } from "./pages/Boarding";
import { Retail } from "./pages/Retail";
import { Reports } from "./pages/Reports";
import { Stock } from "./pages/Stock";
import { IPDDashboard } from "./pages/IPDDashboard";
import { IPDWard } from "./pages/IPDWard";
import { IPDAdmit } from "./pages/IPDAdmit";
import { IPDPatientDetail } from "./pages/IPDPatientDetail";
import { IPDReports } from "./pages/IPDReports";

// Vite exposes the configured base path via import.meta.env.BASE_URL.
// Locally that's "/", on GitHub Pages it's "/Ehpvetcare/".
const BASENAME = import.meta.env.BASE_URL.replace(/\/$/, "") || undefined;

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: ProtectedRoute,
    children: [
      {
        Component: Layout,
        children: [
          { index: true, Component: Dashboard },
          { path: "owners", Component: Owners },
          { path: "owners/:id", Component: OwnerDetail },
          { path: "pets", Component: Pets },
          { path: "pets/:id", Component: PetDetail },
          { path: "visits", Component: Visits },
          { path: "appointments", Component: Appointments },
          { path: "schedule", Component: SlotBuilder },
          { path: "financial", Component: Financial },
          { path: "grooming", Component: Grooming },
          { path: "boarding", Component: Boarding },
          { path: "retail", Component: Retail },
          { path: "stock", Component: Stock },
          { path: "ipd", Component: IPDDashboard },
          { path: "ipd/ward", Component: IPDWard },
          { path: "ipd/admit", Component: IPDAdmit },
          { path: "ipd/patient/:id", Component: IPDPatientDetail },
          { path: "ipd/reports", Component: IPDReports },
          { path: "reports", Component: Reports },
          { path: "notifications", Component: Notifications },
          { path: "settings", Component: Settings },
        ],
      },
    ],
  },
], { basename: BASENAME });