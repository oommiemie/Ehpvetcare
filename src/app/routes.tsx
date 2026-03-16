import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Owners } from "./pages/Owners";
import { Pets } from "./pages/Pets";
import { Visits } from "./pages/Visits";
import { Appointments } from "./pages/Appointments";
import { Financial } from "./pages/Financial";
import { Grooming } from "./pages/Grooming";
import { Notifications } from "./pages/Notifications";
import { Settings } from "./pages/Settings";
import { Boarding } from "./pages/Boarding";
import { Retail } from "./pages/Retail";
import { Reports } from "./pages/Reports";
import { Stock } from "./pages/Stock";

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
          { path: "pets", Component: Pets },
          { path: "visits", Component: Visits },
          { path: "appointments", Component: Appointments },
          { path: "financial", Component: Financial },
          { path: "grooming", Component: Grooming },
          { path: "boarding", Component: Boarding },
          { path: "retail", Component: Retail },
          { path: "stock", Component: Stock },
          { path: "reports", Component: Reports },
          { path: "notifications", Component: Notifications },
          { path: "settings", Component: Settings },
        ],
      },
    ],
  },
]);