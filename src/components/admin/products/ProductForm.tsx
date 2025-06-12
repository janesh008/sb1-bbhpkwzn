import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import Button from '../../ui/Button';
import ProductImageUpload from './ProductImageUpload';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import { z } from 'zod';

// Updated schema to match database structure
const createProductSchema = z.object({
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

type CreateProduct = z.infer<typeof createProductSchema>;

interface Category {
  id: string;
  name: string;
  created_at: string;
}

interface MetalColor {
  id: string;
  name: string;
  created_at: string;
}

interface ProductFormProps {
  onSubmit: (data: CreateProduct) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<CreateProduct>;
  isEdit?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEdit = false
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [metalColors, setMetalColors] = useState<MetalColor[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
  const [showNewMetalColorDialog, setShowNewMetalColorDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newMetalColorName, setNewMetalColorName] = useState('');

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm<CreateProduct>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      product_id: '',
      product_name: '',
      product_link: '',
      metal_type: 'Gold',
      category_id: '',
      diamond_color: '',
      diamond_piece_count: 0,
      diamond_weight: 0,
      gross_weight: 0,
      net_weight: 0,
      metal_color_id: '',
      description: '',
      images: [],
      ...initialData
    }
  });

  const watchedImages = watch('images');

  useEffect(() => {
    fetchCategories();
    fetchMetalColors();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  };

  const fetchMetalColors = async () => {
    try {
      const { data, error } = await supabase
        .from('metal_colors')
        .select('*')
        .order('name');

      if (error) throw error;
      setMetalColors(data || []);
    } catch (error) {
      console.error('Error fetching metal colors:', error);
      toast.error('Failed to fetch metal colors');
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: newCategoryName.trim() }])
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => [...prev, data]);
      setValue('category_id', data.id);
      setNewCategoryName('');
      setShowNewCategoryDialog(false);
      toast.success('Category added successfully');
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    }
  };

  const handleAddMetalColor = async () => {
    if (!newMetalColorName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('metal_colors')
        .insert([{ name: newMetalColorName.trim() }])
        .select()
        .single();

      if (error) throw error;

      setMetalColors(prev => [...prev, data]);
      setValue('metal_color_id', data.id);
      setNewMetalColorName('');
      setShowNewMetalColorDialog(false);
      toast.success('Metal color added successfully');
    } catch (error) {
      console.error('Error adding metal color:', error);
      toast.error('Failed to add metal color');
    }
  };

  const handleFormSubmit = async (data: CreateProduct) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="product_id">Product ID *</Label>
              <Input
                id="product_id"
                {...register('product_id')}
                placeholder="e.g., RING-001"
              />
              {errors.product_id && (
                <p className="text-sm text-red-600">{errors.product_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="product_name">Product Name *</Label>
              <Input
                id="product_name"
                {...register('product_name')}
                placeholder="e.g., Diamond Solitaire Ring"
              />
              {errors.product_name && (
                <p className="text-sm text-red-600">{errors.product_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="product_link">Product Link</Label>
              <Input
                id="product_link"
                {...register('product_link')}
                placeholder="https://example.com/product"
                type="url"
              />
              {errors.product_link && (
                <p className="text-sm text-red-600">{errors.product_link.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="metal_type">Metal Type *</Label>
              <Controller
                name="metal_type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select metal type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gold">Gold</SelectItem>
                      <SelectItem value="Silver">Silver</SelectItem>
                      <SelectItem value="Platinum">Platinum</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.metal_type && (
                <p className="text-sm text-red-600">{errors.metal_type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">Category *</Label>
              <div className="flex gap-2">
                <Controller
                  name="category_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <Dialog open={showNewCategoryDialog} onOpenChange={setShowNewCategoryDialog}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Category</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-category">Category Name</Label>
                        <Input
                          id="new-category"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="e.g., Pendant"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowNewCategoryDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="button" onClick={handleAddCategory}>
                          Add Category
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              {errors.category_id && (
                <p className="text-sm text-red-600">{errors.category_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="metal_color_id">Metal Color *</Label>
              <div className="flex gap-2">
                <Controller
                  name="metal_color_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select metal color" />
                      </SelectTrigger>
                      <SelectContent>
                        {metalColors.map((color) => (
                          <SelectItem key={color.id} value={color.id}>
                            {color.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <Dialog open={showNewMetalColorDialog} onOpenChange={setShowNewMetalColorDialog}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Metal Color</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-metal-color">Metal Color Name</Label>
                        <Input
                          id="new-metal-color"
                          value={newMetalColorName}
                          onChange={(e) => setNewMetalColorName(e.target.value)}
                          placeholder="e.g., White Gold"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowNewMetalColorDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="button" onClick={handleAddMetalColor}>
                          Add Metal Color
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              {errors.metal_color_id && (
                <p className="text-sm text-red-600">{errors.metal_color_id.message}</p>
              )}
            </div>
          </div>

          {/* Diamond Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="diamond_color">Diamond Color</Label>
              <Input
                id="diamond_color"
                {...register('diamond_color')}
                placeholder="e.g., D, E, F"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diamond_piece_count">Diamond Pieces</Label>
              <Input
                id="diamond_piece_count"
                type="number"
                min="0"
                {...register('diamond_piece_count', { valueAsNumber: true })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diamond_weight">Diamond Weight (ct)</Label>
              <Input
                id="diamond_weight"
                type="number"
                step="0.01"
                min="0"
                {...register('diamond_weight', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Weight Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="gross_weight">Gross Weight (g) *</Label>
              <Input
                id="gross_weight"
                type="number"
                step="0.01"
                min="0"
                {...register('gross_weight', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.gross_weight && (
                <p className="text-sm text-red-600">{errors.gross_weight.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="net_weight">Net Weight (g) *</Label>
              <Input
                id="net_weight"
                type="number"
                step="0.01"
                min="0"
                {...register('net_weight', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.net_weight && (
                <p className="text-sm text-red-600">{errors.net_weight.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Detailed product description..."
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label>Product Images</Label>
            <Controller
              name="images"
              control={control}
              render={({ field }) => (
                <ProductImageUpload
                  images={field.value}
                  onImagesChange={field.onChange}
                />
              )}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isEdit ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductForm;