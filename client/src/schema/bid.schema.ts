import { z } from "zod";

export const bidSchema = z.object({
  bidAmount: z.number()
    .positive({ message: "Bid amount must be positive" })
    .refine((val) => val >= 0, {
      message: "Bid amount must be greater than or equal to the minimum bid",
    }),
});

export type BidFormValues = z.infer<typeof bidSchema>;
