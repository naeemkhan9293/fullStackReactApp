import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ServiceDetailsVariant1 from "./ServiceDetailsVariant1";
import ServiceDetailsVariant2 from "./ServiceDetailsVariant2";

// This is a wrapper component that allows switching between the two variants
const ServiceDetails = () => {
  const [variant, setVariant] = useState<"variant1" | "variant2">("variant1");

  return (
    <div className="bg-white min-h-screen">
      {/* Variant Switcher - Only visible in development */}
      {process.env.NODE_ENV !== "production" && (
        <div className="bg-muted/30 border-b p-2 flex justify-center">
          <Tabs value={variant} onValueChange={(v) => setVariant(v as "variant1" | "variant2")}>
            <TabsList>
              <TabsTrigger value="variant1">Variant 1: Full-width Hero</TabsTrigger>
              <TabsTrigger value="variant2">Variant 2: Side-by-Side Layout</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* Render the selected variant */}
      {variant === "variant1" ? <ServiceDetailsVariant1 /> : <ServiceDetailsVariant2 />}
    </div>
  );
};

export default ServiceDetails;
