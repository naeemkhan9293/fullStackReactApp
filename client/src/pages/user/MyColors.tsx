import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MyColors = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Mock color data
  const ownedColors = [
    { id: 1, name: "Ocean Blue", hex: "#1E90FF", price: "$25", status: "owned", purchaseDate: "May 15, 2023" },
    { id: 2, name: "Sunset Orange", hex: "#FF4500", price: "$30", status: "owned", purchaseDate: "June 2, 2023" },
    { id: 3, name: "Forest Green", hex: "#228B22", price: "$22", status: "owned", purchaseDate: "July 10, 2023" },
    { id: 4, name: "Royal Purple", hex: "#8A2BE2", price: "$35", status: "owned", purchaseDate: "August 5, 2023" },
  ];

  const sellingColors = [
    { id: 5, name: "Ruby Red", hex: "#E0115F", price: "$28", status: "selling", listDate: "September 1, 2023", bids: 7 },
    { id: 6, name: "Turquoise", hex: "#40E0D0", price: "$32", status: "selling", listDate: "September 15, 2023", bids: 4 },
  ];

  const soldColors = [
    { id: 7, name: "Sunshine Yellow", hex: "#FFD700", price: "$20", status: "sold", saleDate: "August 20, 2023" },
    { id: 8, name: "Lavender", hex: "#E6E6FA", price: "$18", status: "sold", saleDate: "July 25, 2023" },
  ];

  // Filter colors based on search term
  const filteredOwned = ownedColors.filter(color => 
    color.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredSelling = sellingColors.filter(color => 
    color.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredSold = soldColors.filter(color => 
    color.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Colors</h1>
        <p className="text-muted-foreground">Manage your color collection</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search colors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button asChild>
          <Link to="/user/create-listing">Create Listing</Link>
        </Button>
      </div>

      <Tabs defaultValue="owned" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="owned">Owned ({filteredOwned.length})</TabsTrigger>
          <TabsTrigger value="selling">Selling ({filteredSelling.length})</TabsTrigger>
          <TabsTrigger value="sold">Sold ({filteredSold.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="owned" className="mt-6">
          {filteredOwned.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOwned.map((color) => (
                <Card key={color.id}>
                  <CardHeader className="pb-3">
                    <CardTitle>{color.name}</CardTitle>
                    <CardDescription>Purchased on {color.purchaseDate}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="w-full h-32 rounded-md" 
                      style={{ backgroundColor: color.hex }}
                    ></div>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="font-medium">{color.hex}</span>
                      <span className="text-sm text-muted-foreground">Paid {color.price}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">List for Sale</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No colors found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your search or browse the marketplace</p>
              <Button asChild>
                <Link to="/marketplace">Browse Marketplace</Link>
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="selling" className="mt-6">
          {filteredSelling.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSelling.map((color) => (
                <Card key={color.id}>
                  <CardHeader className="pb-3">
                    <CardTitle>{color.name}</CardTitle>
                    <CardDescription>Listed on {color.listDate}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="w-full h-32 rounded-md" 
                      style={{ backgroundColor: color.hex }}
                    ></div>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="font-medium">{color.price}</span>
                      <span className="text-sm text-muted-foreground">{color.bids} bids</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button variant="outline" className="flex-1">Edit</Button>
                    <Button variant="destructive" className="flex-1">Cancel</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No colors listed for sale</h3>
              <p className="text-muted-foreground mb-6">List some of your colors to start selling</p>
              <Button asChild>
                <Link to="/user/create-listing">Create Listing</Link>
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="sold" className="mt-6">
          {filteredSold.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSold.map((color) => (
                <Card key={color.id}>
                  <CardHeader className="pb-3">
                    <CardTitle>{color.name}</CardTitle>
                    <CardDescription>Sold on {color.saleDate}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="w-full h-32 rounded-md" 
                      style={{ backgroundColor: color.hex }}
                    ></div>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="font-medium">{color.hex}</span>
                      <span className="text-sm text-muted-foreground">Sold for {color.price}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No colors sold yet</h3>
              <p className="text-muted-foreground mb-6">Your sold colors will appear here</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyColors;
