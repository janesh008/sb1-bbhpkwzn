import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Filter, Grid, List, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/products/ProductCard';
import ProductFilter from '../components/products/ProductFilter';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Product } from '../types';

const ProductsPage = () => {
  const { category } = useParams<{ category?: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>({
    categories: [],
    metals: [],
    priceRange: [0, 10000]
  });
  
  useEffect(() => {
    document.title = category 
      ? `${category.charAt(0).toUpperCase() + category.slice(1)} Jewelry | AXELS` 
      : 'Shop All Jewelry | AXELS';
      
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        
        let query = supabase
          .from('products')
          .select(`
            *,
            product_images!fk_product(*)
          `);
          
        if (category) {
          query = query.eq('product_type', category.toLowerCase());
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback to mock data if Supabase isn't connected yet
        setProducts(mockProducts);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, [category]);
  
  const handleFilterChange = (filters: any) => {
    setActiveFilters(filters);
  };
  
  const filteredProducts = products.filter(product => {
    // Filter by category
    if (activeFilters.categories.length > 0 && !activeFilters.categories.includes(product.product_type)) {
      return false;
    }
    
    // Filter by metal
    if (activeFilters.metals.length > 0 && !activeFilters.metals.includes(product.metal.toLowerCase())) {
      return false;
    }
    
    // Filter by price
    if (
      product.price < activeFilters.priceRange[0] || 
      product.price > activeFilters.priceRange[1]
    ) {
      return false;
    }
    
    return true;
  });
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl text-charcoal-800">
          {category 
            ? `${category.charAt(0).toUpperCase() + category.slice(1)} Jewelry` 
            : 'All Jewelry'
          }
        </h1>
        <p className="mt-2 text-charcoal-500">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} available
        </p>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <button 
          className="flex items-center text-sm font-medium text-charcoal-600 md:hidden"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 text-sm text-charcoal-600">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Sort by:</span>
          </div>
          <select className="text-sm border border-cream-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-gold-400">
            <option>Featured</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Newest</option>
          </select>
          
          <div className="hidden md:flex items-center space-x-2">
            <button className="p-1.5 rounded border border-cream-200 hover:border-gold-400 transition-colors">
              <Grid className="h-4 w-4 text-charcoal-600" />
            </button>
            <button className="p-1.5 rounded border border-cream-200 hover:border-gold-400 transition-colors">
              <List className="h-4 w-4 text-charcoal-600" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row">
        <AnimatePresence>
          {(showFilters || window.innerWidth >= 768) && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full md:w-64 md:pr-6 mb-6 md:mb-0 md:block"
            >
              <ProductFilter onFilterChange={handleFilterChange} />
            </motion.aside>
          )}
        </AnimatePresence>
        
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-charcoal-800 mb-2">No products found</h3>
              <p className="text-charcoal-500">Try adjusting your filters to find what you're looking for.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Mock data for preview without Supabase connection
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Elegant Diamond Necklace',
    product_type: 'diamond',
    price: 2999,
    metal: 'Gold',
    description: 'A stunning diamond necklace with 18K gold setting.',
    availability: true,
    created_at: new Date().toISOString(),
    product_images: [
      {
        id: '1',
        product_id: '1',
        image_url: 'https://images.pexels.com/photos/10018318/pexels-photo-10018318.jpeg?auto=compress&cs=tinysrgb&w=1600',
        angle: 'front'
      }
    ]
  },
  {
    id: '2',
    name: 'Classic Gold Bracelet',
    product_type: 'gold',
    price: 1299,
    metal: 'Gold',
    description: 'Timeless 18K gold bracelet with intricate detailing.',
    availability: true,
    created_at: new Date().toISOString(),
    product_images: [
      {
        id: '2',
        product_id: '2',
        image_url: 'https://images.pexels.com/photos/9953682/pexels-photo-9953682.jpeg?auto=compress&cs=tinysrgb&w=1600',
        angle: 'front'
      }
    ]
  },
  {
    id: '3',
    name: 'Diamond Stud Earrings',
    product_type: 'diamond',
    price: 899,
    metal: 'White Gold',
    description: 'Brilliant diamond stud earrings set in white gold.',
    availability: true,
    created_at: new Date().toISOString(),
    product_images: [
      {
        id: '3',
        product_id: '3',
        image_url: 'https://images.pexels.com/photos/10922931/pexels-photo-10922931.jpeg?auto=compress&cs=tinysrgb&w=1600',
        angle: 'front'
      }
    ]
  },
  {
    id: '4',
    name: 'Vintage Silver Ring',
    product_type: 'silver',
    price: 499,
    metal: 'Silver',
    description: 'Elegant vintage-inspired silver ring with floral pattern.',
    availability: true,
    created_at: new Date().toISOString(),
    product_images: [
      {
        id: '4',
        product_id: '4',
        image_url: 'https://images.pexels.com/photos/11144577/pexels-photo-11144577.jpeg?auto=compress&cs=tinysrgb&w=1600',
        angle: 'front'
      }
    ]
  },
  {
    id: '5',
    name: 'Platinum Engagement Ring',
    product_type: 'platinum',
    price: 3499,
    metal: 'Platinum',
    description: 'Exquisite platinum engagement ring with center diamond.',
    availability: true,
    created_at: new Date().toISOString(),
    product_images: [
      {
        id: '5',
        product_id: '5',
        image_url: 'https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg?auto=compress&cs=tinysrgb&w=1600',
        angle: 'front'
      }
    ]
  },
  {
    id: '6',
    name: 'Gold Hoop Earrings',
    product_type: 'gold',
    price: 799,
    metal: 'Gold',
    description: 'Classic gold hoop earrings, perfect for any occasion.',
    availability: true,
    created_at: new Date().toISOString(),
    product_images: [
      {
        id: '6',
        product_id: '6',
        image_url: 'https://images.pexels.com/photos/12004392/pexels-photo-12004392.jpeg?auto=compress&cs=tinysrgb&w=1600',
        angle: 'front'
      }
    ]
  }
];

export default ProductsPage;