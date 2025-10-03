import { z } from "zod";

// Goal validation schema
export const goalSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Goal title is required")
    .max(100, "Goal title must be less than 100 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .nullable(),
  category: z
    .string()
    .trim()
    .max(50, "Category must be less than 50 characters")
    .optional()
    .nullable(),
  target_days_per_week: z
    .number()
    .int("Target days must be a whole number")
    .min(1, "Target days must be at least 1")
    .max(7, "Target days cannot exceed 7"),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
});

export type GoalFormData = z.infer<typeof goalSchema>;

// Profile validation schema
export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  reminder_enabled: z.boolean()
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Chat message validation schema
export const chatMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(2000, "Message must be less than 2000 characters")
});

export type ChatMessageFormData = z.infer<typeof chatMessageSchema>;

// Auth validation schema
export const authSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be less than 72 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .optional()
});

export type AuthFormData = z.infer<typeof authSchema>;
