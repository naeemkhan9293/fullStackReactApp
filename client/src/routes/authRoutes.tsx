import AuthLayout from "@/layouts/AuthLayout";
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import PublicRoute from "@/components/auth/PublicRoute";

export const authRoutes = [
  {
    path: "/auth",
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "login", element: <LoginPage /> },
          { path: "signup", element: <SignupPage /> },
          { path: "forgot-password", element: <ForgotPassword /> },
          { path: "reset-password", element: <ResetPassword /> },
        ],
      },
    ],
  },
];
