import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import ListItem from "./ListItem";

const NavigationLinks = () => {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Marketplace</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 w-[400px]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    to="/marketplace"
                  >
                    <div className="mb-2 mt-4 text-lg font-medium">
                      Services Marketplace
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Browse and book local services from trusted
                      providers in your area
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <ListItem to="/marketplace" title="All Services">
                Browse all available services
              </ListItem>
              <ListItem to="/marketplace?sort=trending" title="Trending">
                See what's popular right now
              </ListItem>
              <ListItem
                to="/marketplace?sort=newest"
                title="New Providers"
              >
                The latest service providers to join
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link to="/about" className="px-4 py-2 hover:text-primary">
            About
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link to="/contact" className="px-4 py-2 hover:text-primary">
            Contact
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default NavigationLinks;
