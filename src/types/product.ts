import { z } from 'zod';

// Product validation schemas
export const productSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().min(1, 'Product ID is required'),
  product_name: z.string().min(1, 'Product name is required'),
  product_link: z.string().url('Invalid product URL').optional(),
  metal_type: z.enum(['Gold', 'Silver', 'Platinum']),
  category_id: z.string().uuid('Category is required'),
  diamond_color: z.string().optional(),
  diamond_piece_count: z.number().int().min(0).optional(),
  diamond_weight: z.number().min(0).optional(),
  gross_weight: z.number().min(0, 'Gross weight must be positive'),
  net_weight: z.number().min(0, 'Net weight must be positive'),
  metal_color_id: z.string().uuid('Metal color is required'),
  description: z.string().min(1, 'Description is required'),
  created_at: z.string(),
  updated_at: z.string(),
});

export const createProductSchema = z.object({
  product_id: z.string().min(1, 'Product ID is required'),
  product_name: z.string().min(1, 'Product name is required'),
  product_link: z.string().url('Invalid product URL').optional().or(z.literal('')),
  metal_type: z.enum(['Gold', 'Silver', 'Platinum']),
  category_id: z.string().min(1, 'Category is required'),
  diamond_color: z.string().optional(),
  diamond_piece_count: z.coerce.number().int().min(0).optional(),
  diamond_weight: z.coerce.number().min(0).optional(),
  gross_weight: z.coerce.number().min(0, 'Gross weight must be positive'),
  net_weight: z.coerce.number().min(0, 'Net weight must be positive'),
  metal_color_id: z.string().min(1, 'Metal color is required'),
  description: z.string().min(1, 'Description is required'),
  images: z.array(z.string().url()).default([]),
});

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().uuid(),
});

// Category schemas
export const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Category name is required'),
  created_at: z.string(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
});

// Metal color schemas
export const metalColorSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Metal color name is required'),
  created_at: z.string(),
});

export const createMetalColorSchema = z.object({
  name: z.string().min(1, 'Metal color name is required'),
});

// Product image schemas
export const productImageSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  image_url: z.string().url(),
  display_order: z.number().int().min(0),
  created_at: z.string(),
});

// Product model schemas
export const productModelSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  model_url: z.string().url(),
  type: z.enum(['3D', 'AR', 'VR']),
  created_at: z.string(),
});

// Type exports
export type Product = z.infer<typeof productSchema>;
export type CreateProduct = z.infer<typeof createProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type Category = z.infer<typeof categorySchema>;
export type CreateCategory = z.infer<typeof createCategorySchema>;
export type MetalColor = z.infer<typeof metalColorSchema>;
export type CreateMetalColor = z.infer<typeof createMetalColorSchema>;
export type ProductImage = z.infer<typeof productImageSchema>;
export type ProductModel = z.infer<typeof productModelSchema>;

// Extended product type with relations
export interface ProductWithRelations extends Product {
  category: Category;
  metal_color: MetalColor;
  product_images: ProductImage[];
  product_models: ProductModel[];
}