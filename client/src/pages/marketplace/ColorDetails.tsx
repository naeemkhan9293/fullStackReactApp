import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const ColorDetails = () => {
  const { id } = useParams<{ id: string }>();
  
  // Mock data - in a real app, this would come from an API
  const color = {
    id: parseInt(id || "1"),
    name: "Ocean Blue",
    hex: "#1E90FF",
    price: "$25",
    creator: "Alex Smith",
    creatorId: "user123",
    description: "A deep, calming blue reminiscent of the ocean on a clear day. This color brings tranquility and peace to any design.",
    createdAt: "2023-05-15",
    bids: [
      { id: 1, amount: "$22", bidder: "Jamie Lee", time: "2 days ago" },
      { id: 2, amount: "$23", bidder: "Taylor Wong", time: "1 day ago" },
      { id: 3, amount: "$25", bidder: "Jordan Patel", time: "12 hours ago" },
    ],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Color Preview */}
      <div className="lg:col-span-2">
        <div 
          className="w-full h-64 lg:h-96 rounded-lg shadow-md" 
          style={{ backgroundColor: color.hex }}
        ></div>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{color.name}</h1>
            <p className="text-muted-foreground">Created by <Link to={`/user/${color.creatorId}`} className="text-primary hover:underline">{color.creator}</Link></p>
          </div>
          <div className="text-right">
            <p className="text-lg font-medium">Current Price</p>
            <p className="text-3xl font-bold">{color.price}</p>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p>{color.description}</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Color Code</p>
              <p className="font-mono">{color.hex}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Listed On</p>
              <p>{color.createdAt}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bidding Section */}
      <div>
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Place a Bid</h2>
            <p className="mb-6">The minimum bid for this color is {color.price}</p>
            <Button size="lg" className="w-full" asChild>
              <Link to={`/marketplace/bid/${color.id}`}>Place Bid</Link>
            </Button>
          </CardContent>
        </Card>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Bid History</h2>
          {color.bids.length > 0 ? (
            <div className="space-y-4">
              {color.bids.map((bid) => (
                <div key={bid.id} className="flex justify-between items-center p-3 bg-muted rounded-md">
                  <div>
                    <p className="font-medium">{bid.bidder}</p>
                    <p className="text-sm text-muted-foreground">{bid.time}</p>
                  </div>
                  <p className="font-bold">{bid.amount}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No bids yet. Be the first to bid!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ColorDetails;
