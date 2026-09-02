import LoginPage from "./pages/Login.tsx";
import RegisterPage from "./pages/Register.tsx";
import CustomerDashboard from "./pages/CustomerDashboard.tsx";
import StaffDashboard from "./pages/StaffDashboard.tsx";
import { createBrowserRouter, Navigate } from "react-router";

// all routes for the application are defined here, and the router is exported to be used in main.tsx
// if the user navigates to a route that does not exist, they will be redirected to the login page
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/customer-dashboard",
    element: <CustomerDashboard />,
  },
  {
    path: "/staff-dashboard",
    element: <StaffDashboard />,
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);
