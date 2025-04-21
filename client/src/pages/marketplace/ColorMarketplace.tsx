import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ColorMarketplace = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Sample color data
  const colors = [
    { id: 1, name: "Ocean Blue", hex: "#1E90FF", price: "$25", creator: "Alex Smith", bids: 5 },
    { id: 2, name: "Sunset Orange", hex: "#FF4500", price: "$30", creator: "Jamie Lee", bids: 8 },
    { id: 3, name: "Forest Green", hex: "#228B22", price: "$22", creator: "Taylor Wong", bids: 3 },
    { id: 4, name: "Royal Purple", hex: "#8A2BE2", price: "$35", creator: "Jordan Patel", bids: 12 },
    { id: 5, name: "Ruby Red", hex: "#E0115F", price: "$28", creator: "Casey Johnson", bids: 7 },
    { id: 6, name: "Turquoise", hex: "#40E0D0", price: "$32", creator: "Riley Garcia", bids: 4 },
    { id: 7, name: "Sunshine Yellow", hex: "#FFD700", price: "$20", creator: "Morgan Chen", bids: 6 },
    { id: 8, name: "Lavender", hex: "#E6E6FA", price: "$18", creator: "Quinn Williams", bids: 2 },
  ];

  // Filter colors based on search term
  const filteredColors = colors.filter(color => 
    color.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    color.creator.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort colors based on sort option
  const sortedColors = [...filteredColors].sort((a, b) => {
    if (sortBy === "price-low") {
      return parseInt(a.price.substring(1)) - parseInt(b.price.substring(1));
    } else if (sortBy === "price-high") {
      return parseInt(b.price.substring(1)) - parseInt(a.price.substring(1));
    } else if (sortBy === "popular") {
      return b.bids - a.bids;
    }
    // Default: newest (by id in this mock data)
    return b.id - a.id;
  });

  return (
    <div>
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Input
            placeholder="Search colors or creators..."
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
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Color Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sortedColors.map((color) => (
          <Card key={color.id}>
            <CardHeader>
              <CardTitle>{color.name}</CardTitle>
              <CardDescription>Created by {color.creator}</CardDescription>
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
            <CardFooter>
              <Button className="w-full" asChild>
                <Link to={`/marketplace/color/${color.id}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {sortedColors.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No colors found</h3>
          <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
          <Button onClick={() => {setSearchTerm(""); setSortBy("newest");}}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default ColorMarketplace;
