import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/Navbar/index";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "@/store/slices/authSlice";
import { useGetCurrentUserQuery } from "@/store/api/authApi";

const RootLayout = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Fetch current user data if authenticated
  const { data, error, isLoading, refetch } = useGetCurrentUserQuery(
    undefined,
    {
      skip: !isAuthenticated,
    }
  );

  useEffect(() => {
    if (isAuthenticated) {
      console.log("Token in localStorage:", localStorage.getItem("token"));
      refetch()
        .then((result) => {
          console.log("getCurrentUser result:", result);
        })
        .catch((err) => {
          console.error("getCurrentUser refetch error:", err);
        });
    }
  }, [isAuthenticated, refetch]);

  // Log authentication state for debugging
  useEffect(() => {
    console.log("Auth state:", {
      isAuthenticated,
      userData: data?.data,
      error,
      isLoading,
    });
  }, [isAuthenticated, data, error, isLoading]);
  return (
    <div className="flex min-h-screen w-full">
      <div className="flex-1 flex flex-col max-w-screen">
        <Navbar />
        <main className="flex-1 p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default RootLayout;
