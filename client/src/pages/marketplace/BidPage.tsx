import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const BidPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Mock data - in a real app, this would come from an API
  const color = {
    id: parseInt(id || "1"),
    name: "Ocean Blue",
    hex: "#1E90FF",
    currentPrice: 25,
    minBidIncrement: 1,
    creator: "Alex Smith",
    creatorId: "user123",
    description: "A deep, calming blue reminiscent of the ocean on a clear day. This color brings tranquility and peace to any design.",
    endsIn: "2 days",
    bids: [
      { id: 1, amount: 22, bidder: "Jamie Lee", time: "2 days ago" },
      { id: 2, amount: 23, bidder: "Taylor Wong", time: "1 day ago" },
      { id: 3, amount: 25, bidder: "Jordan Patel", time: "12 hours ago" },
    ],
  };

  const [bidAmount, setBidAmount] = useState(color.currentPrice + color.minBidIncrement);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bidPlaced, setBidPlaced] = useState(false);

  const handleBidChange = (value: number[]) => {
    setBidAmount(value[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setBidPlaced(true);
    }, 1000);
  };

  if (bidPlaced) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Bid Placed Successfully!</CardTitle>
          <CardDescription>
            You've placed a bid of ${bidAmount} on {color.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className="w-full h-32 rounded-md mb-4" 
            style={{ backgroundColor: color.hex }}
          ></div>
          <p className="mb-4">
            You will be notified if you are outbid or if you win the auction.
          </p>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button asChild className="flex-1">
            <Link to={`/marketplace/color/${id}`}>Back to Listing</Link>
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link to="/user/my-bids">View My Bids</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Place a Bid on {color.name}</CardTitle>
            <CardDescription>
              Current price: ${color.currentPrice} • Auction ends in {color.endsIn}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="w-full h-48 rounded-md mb-6" 
              style={{ backgroundColor: color.hex }}
            ></div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="bidAmount">Your Bid Amount (USD)</Label>
                <div className="flex items-center gap-4">
                  <Input 
                    id="bidAmount" 
                    type="number" 
                    min={color.currentPrice + color.minBidIncrement}
                    step={1}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(parseInt(e.target.value))}
                    required
                  />
                  <span className="text-xl font-bold">${bidAmount}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Min: ${color.currentPrice + color.minBidIncrement}</span>
                  <span>Max: ${color.currentPrice * 2}</span>
                </div>
                <Slider
                  min={color.currentPrice + color.minBidIncrement}
                  max={color.currentPrice * 2}
                  step={1}
                  value={[bidAmount]}
                  onValueChange={handleBidChange}
                />
              </div>
              
              <div className="pt-4 flex gap-2">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? "Placing Bid..." : "Place Bid"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(`/marketplace/color/${id}`)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>About This Color</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{color.description}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Color Code</p>
                <p className="font-mono">{color.hex}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Creator</p>
                <p>{color.creator}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Bid History</CardTitle>
          </CardHeader>
          <CardContent>
            {color.bids.length > 0 ? (
              <div className="space-y-4">
                {color.bids.map((bid) => (
                  <div key={bid.id} className="flex justify-between items-center p-3 bg-muted rounded-md">
                    <div>
                      <p className="font-medium">{bid.bidder}</p>
                      <p className="text-sm text-muted-foreground">{bid.time}</p>
                    </div>
                    <p className="font-bold">${bid.amount}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No bids yet. Be the first to bid!</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Bidding Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 list-disc pl-5">
              <li>The minimum bid increment is ${color.minBidIncrement}</li>
              <li>You will be notified if someone outbids you</li>
              <li>If you win, the color will be added to your collection</li>
              <li>All sales are final</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BidPage;
