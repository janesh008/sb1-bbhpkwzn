import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Info,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Package,
  Image as ImageIcon
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Checkbox } from '../../components/ui/checkbox';
import Button from '../../components/ui/Button';
import ProductForm from '../../components/admin/products/ProductForm';
import ProductInfoModal from '../../components/admin/products/ProductInfoModal';
import { useDebounce } from '../../hooks/useDebounce';
import { supabase } from '../../lib/supabase';
import { useAdminAuth } from '../../context/AdminAuthContext';
import toast from 'react-hot-toast';

interface DatabaseProduct {
  id: string;
  product_id?: string;
  product_name?: string;
  name?: string;
  product_link?: string;
  metal_type?: string;
  metal?: string;
  category_id?: string;
  category?: string;
  diamond_color?: string;
  diamond_piece_count?: number;
  diamond_weight?: number;
  gross_weight?: number;
  net_weight?: number;
  metal_color_id?: string;
  description?: string;
  price?: number;
  availability?: boolean;
  created_at: string;
  updated_at?: string;
  categories?: { id: string; name: string; created_at: string };
  metal_colors?: { id: string; name: string; created_at: string };
  product_images?: Array<{
    id: string;
    product_id: string;
    image_url: string;
    alt_text?: string;
    is_primary?: boolean;
    created_at: string;
  }>;
}

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

const AdminProductsPage = () => {
  const { hasRole } = useAdminAuth();
  const [products, setProducts] = useState<DatabaseProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [metalColors, setMetalColors] = useState<MetalColor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [metalTypeFilter, setMetalTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DatabaseProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedProductInfo, setSelectedProductInfo] = useState<DatabaseProduct | null>(null);

  const productsPerPage = 10;
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchMetalColors();
  }, [currentPage, debouncedSearchTerm, categoryFilter, metalTypeFilter]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      
      // Build the query
      let query = supabase
        .from('products')
        .select(`
          *,
          categories:category_id(id, name, created_at),
          metal_colors:metal_color_id(id, name, created_at),
          product_images(*)
        `)
        .order('created_at', { ascending: false });

      // Apply search filter
      if (debouncedSearchTerm) {
        query = query.or(`product_name.ilike.%${debouncedSearchTerm}%,name.ilike.%${debouncedSearchTerm}%,product_id.ilike.%${debouncedSearchTerm}%`);
      }

      // Apply category filter
      if (categoryFilter !== 'all') {
        query = query.eq('category_id', categoryFilter);
      }

      // Apply metal type filter
      if (metalTypeFilter !== 'all') {
        query = query.or(`metal_type.eq.${metalTypeFilter},metal.eq.${metalTypeFilter}`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to fetch products from database');
        return;
      }

      console.log('Fetched products from database:', data);
      setProducts(data || []);
      setTotalPages(Math.ceil((data?.length || 0) / productsPerPage));
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchMetalColors = async () => {
    try {
      const { data, error } = await supabase
        .from('metal_colors')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching metal colors:', error);
        return;
      }

      setMetalColors(data || []);
    } catch (error) {
      console.error('Error fetching metal colors:', error);
    }
  };

  const handleCreateProduct = async (data: any) => {
    try {
      const { error } = await supabase
        .from('products')
        .insert([{
          product_id: data.product_id,
          product_name: data.product_name,
          product_link: data.product_link || null,
          metal_type: data.metal_type,
          category_id: data.category_id,
          diamond_color: data.diamond_color || null,
          diamond_piece_count: data.diamond_piece_count || 0,
          diamond_weight: data.diamond_weight || 0,
          gross_weight: data.gross_weight,
          net_weight: data.net_weight,
          metal_color_id: data.metal_color_id,
          description: data.description,
          availability: true
        }]);

      if (error) throw error;
      
      toast.success('Product created successfully');
      setShowProductForm(false);
      fetchProducts();
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    }
  };

  const handleEditProduct = (product: DatabaseProduct) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleUpdateProduct = async (data: any) => {
    try {
      if (!editingProduct) return;

      const { error } = await supabase
        .from('products')
        .update({
          product_id: data.product_id,
          product_name: data.product_name,
          product_link: data.product_link || null,
          metal_type: data.metal_type,
          category_id: data.category_id,
          diamond_color: data.diamond_color || null,
          diamond_piece_count: data.diamond_piece_count || 0,
          diamond_weight: data.diamond_weight || 0,
          gross_weight: data.gross_weight,
          net_weight: data.net_weight,
          metal_color_id: data.metal_color_id,
          description: data.description
        })
        .eq('id', editingProduct.id);

      if (error) throw error;
      
      toast.success('Product updated successfully');
      setShowProductForm(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  const handleShowProductInfo = (product: DatabaseProduct) => {
    setSelectedProductInfo(product);
    setShowInfoModal(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!hasRole('Admin')) {
      toast.error('Insufficient permissions to delete products');
      return;
    }

    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      
      setProducts(products.filter(product => product.id !== productId));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!hasRole('Admin')) {
      toast.error('Insufficient permissions to delete products');
      return;
    }

    if (selectedProducts.length === 0) {
      toast.error('No products selected');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedProducts.length} products? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', selectedProducts);

      if (error) throw error;
      
      setProducts(products.filter(product => !selectedProducts.includes(product.id)));
      setSelectedProducts([]);
      toast.success(`${selectedProducts.length} products deleted successfully`);
    } catch (error) {
      console.error('Error bulk deleting products:', error);
      toast.error('Failed to delete products');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(product => product.id));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getProductName = (product: DatabaseProduct) => {
    return product.product_name || product.name || 'Unnamed Product';
  };

  const getProductMetal = (product: DatabaseProduct) => {
    return product.metal_type || product.metal || 'Unknown';
  };

  const getCategoryName = (product: DatabaseProduct) => {
    if (product.categories) {
      return product.categories.name;
    }
    return product.category || 'Uncategorized';
  };

  const getMetalColorName = (product: DatabaseProduct) => {
    if (product.metal_colors) {
      return product.metal_colors.name;
    }
    return 'Unknown';
  };

  const getProductImage = (product: DatabaseProduct) => {
    if (product.product_images && product.product_images.length > 0) {
      return product.product_images[0].image_url;
    }
    return null;
  };

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    return products.slice(startIndex, startIndex + productsPerPage);
  }, [products, currentPage, productsPerPage]);

  if (showProductForm) {
    return (
      <ProductForm
        onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
        onCancel={() => {
          setShowProductForm(false);
          setEditingProduct(null);
        }}
        initialData={editingProduct ? {
          product_id: editingProduct.product_id || '',
          product_name: getProductName(editingProduct),
          product_link: editingProduct.product_link || '',
          metal_type: getProductMetal(editingProduct) as 'Gold' | 'Silver' | 'Platinum',
          category_id: editingProduct.category_id || '',
          diamond_color: editingProduct.diamond_color || '',
          diamond_piece_count: editingProduct.diamond_piece_count || 0,
          diamond_weight: editingProduct.diamond_weight || 0,
          gross_weight: editingProduct.gross_weight || 0,
          net_weight: editingProduct.net_weight || 0,
          metal_color_id: editingProduct.metal_color_id || '',
          description: editingProduct.description || '',
          images: editingProduct.product_images?.map(img => img.image_url) || [],
        } : undefined}
        isEdit={!!editingProduct}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your jewelry product catalog</p>
        </div>
        {hasRole('Moderator') && (
          <Button onClick={() => setShowProductForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={metalTypeFilter} onValueChange={setMetalTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Metal Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Metals</SelectItem>
                <SelectItem value="Gold">Gold</SelectItem>
                <SelectItem value="Silver">Silver</SelectItem>
                <SelectItem value="Platinum">Platinum</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProducts([])}
                >
                  Clear Selection
                </Button>
                {hasRole('Admin') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkDelete}
                    isLoading={isDeleting}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete Selected
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({products.length})</CardTitle>
          <CardDescription>
            Manage your jewelry product inventory with detailed specifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex space-x-4">
                  <div className="rounded bg-gray-200 h-16 w-16"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedProducts.length === products.length && products.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Metal</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Diamond</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={() => handleSelectProduct(product.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                            {getProductImage(product) ? (
                              <img
                                src={getProductImage(product)!}
                                alt={getProductName(product)}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{getProductName(product)}</div>
                            <div className="text-sm text-gray-500">{product.product_id || product.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{getCategoryName(product)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{getProductMetal(product)}</div>
                          <div className="text-gray-500">{getMetalColorName(product)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {product.gross_weight ? (
                            <>
                              <div>Gross: {product.gross_weight}g</div>
                              <div className="text-gray-500">Net: {product.net_weight || 0}g</div>
                            </>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.diamond_weight ? (
                          <div className="text-sm">
                            <div>{product.diamond_weight}ct</div>
                            <div className="text-gray-500">{product.diamond_piece_count || 0} pcs</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(product.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {hasRole('Moderator') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShowProductInfo(product)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * productsPerPage) + 1} to {Math.min(currentPage * productsPerPage, products.length)} of {products.length} products
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Product Info Modal */}
      <ProductInfoModal
        isOpen={showInfoModal}
        onClose={() => {
          setShowInfoModal(false);
          setSelectedProductInfo(null);
        }}
        product={selectedProductInfo}
      />
    </div>
  );
};

export default AdminProductsPage;