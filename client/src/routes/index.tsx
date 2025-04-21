import { createBrowserRouter } from "react-router-dom";
import { authRoutes } from "./authRoutes";
import { marketplaceRoutes } from "./marketplaceRoutes";
import { userRoutes } from "./userRoutes";
import { mainRoutes } from "./mainRoutes";
import ErrorPage404 from "@/pages/error/ErrorPage404";
import UnauthorizedPage from "@/pages/error/UnauthorizedPage";
import RootLayout from "@/layouts/RootLayout";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      ...authRoutes,
      ...mainRoutes,
      ...marketplaceRoutes,
      ...userRoutes,
      { path: "unauthorized", element: <UnauthorizedPage /> },
      { path: "*", element: <ErrorPage404 /> },
    ],
  },
]);
