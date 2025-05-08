import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectCurrentUser } from "@/store/slices/authSlice";
import {
  Logo,
  NavigationLinks,
  UserCredits,
  UserProfile,
  AuthButtons
} from "@/components/Navbar";

const Navbar = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Logo />
          <NavigationLinks />
        </div>
        <div className="flex items-center gap-5">
          {isAuthenticated && user ? (
            <>
              <UserCredits />
              <UserProfile />
            </>
          ) : (
            <AuthButtons />
          )}
        </div>
      </div>
    </header>
  );
};



export default Navbar;
