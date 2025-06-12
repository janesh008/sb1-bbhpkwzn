import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Product } from '../../types';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Get the first image for the product
  const productImage = product.product_images && product.product_images.length > 0
    ? product.product_images[0].image_url
    : 'https://images.pexels.com/photos/10018318/pexels-photo-10018318.jpeg?auto=compress&cs=tinysrgb&w=1600';
  
  const handleAddToWishlist = async () => {
    if (!user) {
      toast.error('Please log in to add items to your wishlist');
      return;
    }
    
    try {
      if (isWishlisted) {
        // Remove from wishlist
        await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', product.id);
          
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        // Add to wishlist
        await supabase
          .from('wishlists')
          .insert([{ user_id: user.id, product_id: product.id }]);
          
        setIsWishlisted(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error('Failed to update wishlist');
    }
  };
  
  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: productImage,
      quantity: 1
    });
    toast.success('Added to cart');
  };
  
  return (
    <div 
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden rounded-md bg-cream-100 aspect-square">
        <Link to={`/product/${product.id}`}>
          <img 
            src={productImage} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        
        {/* Hover actions */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 py-3 px-4 flex justify-between items-center"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: isHovered ? 0 : 100, opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            onClick={handleAddToWishlist}
            className="p-2 rounded-full bg-cream-100 hover:bg-gold-100 transition-colors"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-gold-400 text-gold-400' : 'text-charcoal-600'}`} />
          </button>
          
          <button
            onClick={handleAddToCart}
            className="p-2 rounded-full bg-cream-100 hover:bg-gold-100 transition-colors"
            aria-label="Add to cart"
          >
            <ShoppingBag className="h-5 w-5 text-charcoal-600" />
          </button>
        </motion.div>
        
        {/* Category tag */}
        <div className="absolute top-3 left-3">
          <span className="text-xs px-2 py-1 bg-white bg-opacity-80 rounded-full text-charcoal-700 capitalize">
            {product.category}
          </span>
        </div>
      </div>
      
      <div className="mt-4">
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="font-medium text-charcoal-800 hover:text-gold-500 transition-colors">
            {product.name}
          </h3>
          <p className="mt-1 font-medium text-gold-500">
            ${product.price.toLocaleString()}
          </p>
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;