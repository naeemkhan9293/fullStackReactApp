import { z } from "zod";

export const loginSchema = z.object({
  email: z.string()
    .email({ message: "Please enter a valid email address" }),
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export const signupSchema = z.object({
  name: z.string()
    .min(2, { message: "Name must be at least 2 characters" }),
  email: z.string()
    .email({ message: "Please enter a valid email address" }),
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string()
    .min(6, { message: "Password must be at least 6 characters" }),
  userType: z.enum(["customer", "provider"], {
    required_error: "Please select a user type",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string()
    .email({ message: "Please enter a valid email address" }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
