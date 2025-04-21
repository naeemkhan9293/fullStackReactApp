import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

const CreateListing = () => {
  const navigate = useNavigate();
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#1E90FF");
  const [description, setDescription] = useState("");
  const [startingPrice, setStartingPrice] = useState(25);
  const [duration, setDuration] = useState(7); // days

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission (will be implemented later)
    console.log("Listing created:", {
      colorName,
      colorHex,
      description,
      startingPrice,
      duration,
    });

    // Redirect to my colors page
    navigate("/user/my-colors");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Create Listing</h1>
        <p className="text-muted-foreground">
          List a new color for sale on the marketplace
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Color Information</CardTitle>
            <CardDescription>
              Provide details about the color you want to sell
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="colorName">Color Name</Label>
                <Input
                  id="colorName"
                  placeholder="e.g., Ocean Blue"
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="colorHex">Color Hex Code</Label>
                <div className="flex gap-4">
                  <Input
                    id="colorHex"
                    placeholder="#RRGGBB"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    required
                    pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                    title="Please enter a valid hex color code (e.g., #1E90FF)"
                  />
                  <input
                    type="color"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="w-12 h-10 rounded-md cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your color and what makes it special..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startingPrice">Starting Price (USD)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="startingPrice"
                    type="number"
                    min="1"
                    max="1000"
                    value={startingPrice}
                    onChange={(e) => setStartingPrice(parseInt(e.target.value))}
                    required
                  />
                  <span className="text-xl font-bold">${startingPrice}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Auction Duration (days)</Label>
                <div className="space-y-4">
                  <Slider
                    id="duration"
                    min={1}
                    max={14}
                    step={1}
                    value={[duration]}
                    onValueChange={(value) => setDuration(value[0])}
                  />
                  <div className="flex justify-between">
                    <span>1 day</span>
                    <span className="font-bold">{duration} days</span>
                    <span>14 days</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit">Create Listing</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/user/my-colors")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                This is how your color will appear in the marketplace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div
                  className="w-full h-64 rounded-lg shadow-md"
                  style={{ backgroundColor: colorHex }}
                ></div>
                <div>
                  <h3 className="text-xl font-bold">
                    {colorName || "Color Name"}
                  </h3>
                  <p className="text-muted-foreground">{colorHex}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Starting Price
                  </p>
                  <p className="text-2xl font-bold">${startingPrice}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p>{description || "No description provided."}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Listing Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc pl-5">
                <li>Choose a descriptive and memorable name for your color</li>
                <li>
                  Provide a detailed description that highlights what makes your
                  color unique
                </li>
                <li>Set a reasonable starting price to attract initial bids</li>
                <li>
                  Consider the auction duration carefully - longer auctions may
                  attract more bids
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateListing;
