import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AuthButtons = () => {
  return (
    <>
      <Button variant="outline" asChild>
        <Link to="/auth/login">Login</Link>
      </Button>
      <Button asChild>
        <Link to="/auth/signup">Sign Up</Link>
      </Button>
    </>
  );
};

export default AuthButtons;
