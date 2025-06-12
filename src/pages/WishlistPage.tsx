import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/products/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Product } from '../types';

const WishlistPage = () => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    document.title = 'My Wishlist | AXELS';
    
    const fetchWishlist = async () => {
      try {
        if (!user) return;
        
        const { data: wishlistData, error: wishlistError } = await supabase
          .from('wishlists')
          .select(`
            product_id,
            products!inner (
              *,
              product_images!fk_product(*)
            )
          `)
          .eq('user_id', user.id);
          
        if (wishlistError) throw wishlistError;
        
        const products = wishlistData
          ?.map(item => item.products)
          .filter(product => product !== null) as Product[];
          
        setWishlistItems(products || []);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWishlist();
  }, [user]);
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl text-charcoal-800">My Wishlist</h1>
        <p className="mt-2 text-charcoal-500">
          {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
        </p>
      </div>
      
      {wishlistItems.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-charcoal-800 mb-2">Your wishlist is empty</h3>
          <p className="text-charcoal-500">Browse our collections and add your favorite pieces.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;