import { Outlet, useLocation } from "react-router-dom";

const MarketplaceLayout = () => {
  const { pathname } = useLocation();
  return (
    <div className="">
      {pathname === "/marketplace" && (
        <h1 className="text-3xl font-bold mb-6">Service Marketplace</h1>
      )}
      <Outlet />
    </div>
  );
};

export default MarketplaceLayout;
