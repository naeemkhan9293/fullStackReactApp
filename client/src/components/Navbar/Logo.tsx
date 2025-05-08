import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link
      to="/"
      className="text-xl font-bold hover:text-primary transition-colors"
    >
      <img src="/logo.png" alt="logo" className="w-32 h-10" />
    </Link>
  );
};

export default Logo;
