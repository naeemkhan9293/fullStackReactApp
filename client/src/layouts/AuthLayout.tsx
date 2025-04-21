import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-screen px-4">
      <div className="mb-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold">LocalConnect</span>
        </Link>
      </div>
      <Outlet />
    </div>
  );
};

export default AuthLayout;
