import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const MyBids = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock bid data
  const activeBids = [
    { 
      id: 1, 
      colorName: "Ocean Blue", 
      colorHex: "#1E90FF", 
      bidAmount: "$25", 
      currentHighestBid: "$27",
      status: "outbid", 
      owner: "Alex Smith",
      bidDate: "2 days ago",
      endsIn: "1 day"
    },
    { 
      id: 2, 
      colorName: "Sunset Orange", 
      colorHex: "#FF4500", 
      bidAmount: "$30", 
      currentHighestBid: "$30",
      status: "highest", 
      owner: "Jamie Lee",
      bidDate: "1 day ago",
      endsIn: "3 days"
    },
    { 
      id: 3, 
      colorName: "Forest Green", 
      colorHex: "#228B22", 
      bidAmount: "$22", 
      currentHighestBid: "$22",
      status: "highest", 
      owner: "Taylor Wong",
      bidDate: "12 hours ago",
      endsIn: "2 days"
    },
  ];

  const wonBids = [
    { 
      id: 4, 
      colorName: "Royal Purple", 
      colorHex: "#8A2BE2", 
      bidAmount: "$35", 
      owner: "Jordan Patel",
      wonDate: "Last week"
    },
    { 
      id: 5, 
      colorName: "Ruby Red", 
      colorHex: "#E0115F", 
      bidAmount: "$28", 
      owner: "Casey Johnson",
      wonDate: "2 weeks ago"
    },
  ];

  const lostBids = [
    { 
      id: 6, 
      colorName: "Turquoise", 
      colorHex: "#40E0D0", 
      bidAmount: "$32", 
      finalPrice: "$38",
      owner: "Riley Garcia",
      lostDate: "3 days ago"
    },
    { 
      id: 7, 
      colorName: "Sunshine Yellow", 
      colorHex: "#FFD700", 
      bidAmount: "$20", 
      finalPrice: "$25",
      owner: "Morgan Chen",
      lostDate: "1 week ago"
    },
  ];

  // Filter bids based on search term
  const filteredActive = activeBids.filter(bid => 
    bid.colorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bid.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredWon = wonBids.filter(bid => 
    bid.colorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bid.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredLost = lostBids.filter(bid => 
    bid.colorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bid.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Bids</h1>
        <p className="text-muted-foreground">Track your bids on colors</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search bids..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button asChild>
          <Link to="/marketplace">Browse Marketplace</Link>
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active ({filteredActive.length})</TabsTrigger>
          <TabsTrigger value="won">Won ({filteredWon.length})</TabsTrigger>
          <TabsTrigger value="lost">Lost ({filteredLost.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-6">
          {filteredActive.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredActive.map((bid) => (
                <Card key={bid.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{bid.colorName}</CardTitle>
                        <CardDescription>Owned by {bid.owner}</CardDescription>
                      </div>
                      <Badge variant={bid.status === "highest" ? "default" : "secondary"}>
                        {bid.status === "highest" ? "Highest Bid" : "Outbid"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="w-full h-32 rounded-md" 
                      style={{ backgroundColor: bid.colorHex }}
                    ></div>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Your bid</span>
                        <span className="font-medium">{bid.bidAmount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Current highest</span>
                        <span className="font-medium">{bid.currentHighestBid}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Ends in</span>
                        <span className="font-medium">{bid.endsIn}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button className="flex-1" asChild>
                      <Link to={`/marketplace/color/${bid.id}`}>View Listing</Link>
                    </Button>
                    {bid.status === "outbid" && (
                      <Button variant="outline" className="flex-1" asChild>
                        <Link to={`/marketplace/bid/${bid.id}`}>Increase Bid</Link>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No active bids</h3>
              <p className="text-muted-foreground mb-6">Browse the marketplace to place bids on colors</p>
              <Button asChild>
                <Link to="/marketplace">Browse Marketplace</Link>
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="won" className="mt-6">
          {filteredWon.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWon.map((bid) => (
                <Card key={bid.id}>
                  <CardHeader className="pb-3">
                    <CardTitle>{bid.colorName}</CardTitle>
                    <CardDescription>Won {bid.wonDate}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="w-full h-32 rounded-md" 
                      style={{ backgroundColor: bid.colorHex }}
                    ></div>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Winning bid</span>
                      <span className="font-medium">{bid.bidAmount}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">View in My Colors</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No won bids</h3>
              <p className="text-muted-foreground mb-6">Keep bidding to win colors</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="lost" className="mt-6">
          {filteredLost.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLost.map((bid) => (
                <Card key={bid.id}>
                  <CardHeader className="pb-3">
                    <CardTitle>{bid.colorName}</CardTitle>
                    <CardDescription>Lost {bid.lostDate}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="w-full h-32 rounded-md" 
                      style={{ backgroundColor: bid.colorHex }}
                    ></div>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Your bid</span>
                        <span className="font-medium">{bid.bidAmount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Final price</span>
                        <span className="font-medium">{bid.finalPrice}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/marketplace">Find Similar</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No lost bids</h3>
              <p className="text-muted-foreground mb-6">Your lost bids will appear here</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyBids;
