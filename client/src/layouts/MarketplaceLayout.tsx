import { Outlet } from "react-router-dom";

const MarketplaceLayout = () => {
  return (
    <div className="">
      <h1 className="text-3xl font-bold mb-6">Service Marketplace</h1>
      <Outlet />
    </div>
  );
};

export default MarketplaceLayout;
