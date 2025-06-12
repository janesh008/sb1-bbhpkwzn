import { z } from 'zod';

// User validation schemas
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1, 'Name is required'),
  status: z.enum(['active', 'blocked', 'pending']),
  role: z.enum(['SuperAdmin', 'Admin', 'Moderator', 'User']),
  created_at: z.string(),
});

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['SuperAdmin', 'Admin', 'Moderator', 'User']),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  status: z.enum(['active', 'blocked', 'pending']).optional(),
  role: z.enum(['SuperAdmin', 'Admin', 'Moderator', 'User']).optional(),
});

// Product validation schemas
export const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  images: z.array(z.string().url()).default([]),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  category: z.string().min(1, 'Category is required'),
  status: z.enum(['active', 'inactive', 'draft']),
  created_at: z.string(),
});

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  images: z.array(z.string().url()).default([]),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  category: z.string().min(1, 'Category is required'),
  status: z.enum(['active', 'inactive', 'draft']).default('draft'),
});

export const updateProductSchema = createProductSchema.partial();

// Order validation schemas
export const orderSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  product_ids: z.array(z.string().uuid()),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  total_amount: z.number().positive(),
  created_at: z.string(),
});

export const updateOrderSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
});

// Settings validation schemas
export const settingsSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  company_email: z.string().email('Invalid email address'),
  company_phone: z.string().min(1, 'Phone number is required'),
  company_address: z.string().min(1, 'Address is required'),
  logo_url: z.string().url('Invalid logo URL').optional(),
  api_keys: z.object({
    stripe_public: z.string().optional(),
    stripe_secret: z.string().optional(),
    email_service: z.string().optional(),
  }).optional(),
});

// Activity log validation
export const activityLogSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  action: z.string(),
  details: z.record(z.any()).optional(),
  timestamp: z.string(),
});

export type User = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type Product = z.infer<typeof productSchema>;
export type CreateProduct = z.infer<typeof createProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type Order = z.infer<typeof orderSchema>;
export type UpdateOrder = z.infer<typeof updateOrderSchema>;
export type Settings = z.infer<typeof settingsSchema>;
export type ActivityLog = z.infer<typeof activityLogSchema>;