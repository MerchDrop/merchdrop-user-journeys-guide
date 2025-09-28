import { z } from 'zod';

// Auth validation schemas for input security
export const signUpSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(128, { message: "Password must be less than 128 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    }),
  displayName: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || val.length <= 100, {
      message: "Display name must be less than 100 characters"
    })
});

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .max(128, { message: "Password must be less than 128 characters" })
});

export const roleAssignmentSchema = z.object({
  userId: z
    .string()
    .uuid({ message: "Invalid user ID format" }),
  role: z
    .enum(['admin', 'moderator', 'artist', 'user', 'designer'], {
      errorMap: () => ({ message: "Invalid role" })
    })
});

export const profileUpdateSchema = z.object({
  display_name: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || val.length <= 100, {
      message: "Display name must be less than 100 characters"
    }),
  first_name: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || val.length <= 50, {
      message: "First name must be less than 50 characters"
    }),
  last_name: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || val.length <= 50, {
      message: "Last name must be less than 50 characters"
    }),
  bio: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || val.length <= 500, {
      message: "Bio must be less than 500 characters"
    }),
  website_url: z
    .string()
    .trim()
    .url({ message: "Invalid URL format" })
    .optional()
    .or(z.literal('')),
  social_links: z.any().optional()
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type RoleAssignmentInput = z.infer<typeof roleAssignmentSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;