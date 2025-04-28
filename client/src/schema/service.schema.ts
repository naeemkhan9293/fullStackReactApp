import { z } from "zod";

// Schema for service option
export const serviceOptionSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, { message: "Option name is required" }),
  description: z.string().min(1, { message: "Option description is required" }),
  price: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    { message: "Price must be greater than 0" }
  ),
});

// Schema for service
export const serviceSchema = z.object({
  name: z.string().min(1, { message: "Service name is required" }),
  category: z.string().min(1, { message: "Category is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  basePrice: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    { message: "Base price must be greater than 0" }
  ),
  options: z.array(serviceOptionSchema).min(1, { message: "At least one service option is required" }),
  images: z.array(z.string()).optional(),
});

// Types derived from the schema
export type ServiceFormValues = z.infer<typeof serviceSchema>;
export type ServiceOptionFormValues = z.infer<typeof serviceOptionSchema>;
