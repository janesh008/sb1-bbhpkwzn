import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, ZoomIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) return;

        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            product_images!fk_product(*)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          setProduct(data);
          if (data.product_images && data.product_images.length > 0) {
            setSelectedImage(data.product_images[0].image_url);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        // Fallback to mock data if Supabase isn't connected yet
        setProduct(mockProduct);
        setSelectedImage(mockProduct.product_images[0].image_url);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      document.title = `${product.name} | AXELS`;
    }
  }, [product]);

  const handleAddToWishlist = async () => {
    if (!user) {
      toast.error('Please log in to add items to your wishlist');
      return;
    }

    try {
      if (isWishlisted) {
        await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', product?.id);

        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await supabase
          .from('wishlists')
          .insert([{ user_id: user.id, product_id: product?.id }]);

        setIsWishlisted(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error('Failed to update wishlist');
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: selectedImage,
      quantity: 1
    });
    toast.success('Added to cart');
  };

  if (isLoading) return <LoadingSpinner />;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-cream-100">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-white bg-opacity-90 hover:bg-opacity-100 transition-colors"
              onClick={() => {/* Implement zoom functionality */}}
            >
              <ZoomIn className="h-5 w-5 text-charcoal-600" />
            </button>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            {product.product_images?.map((image) => (
              <button
                key={image.id}
                className={`aspect-square rounded-md overflow-hidden ${
                  selectedImage === image.image_url
                    ? 'ring-2 ring-gold-400'
                    : 'hover:opacity-80'
                }`}
                onClick={() => setSelectedImage(image.image_url)}
              >
                <img
                  src={image.image_url}
                  alt={`${product.name} ${image.angle || ''}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="font-serif text-3xl text-charcoal-800 mb-2">
              {product.name}
            </h1>
            <p className="text-2xl text-gold-500 font-medium">
              ${product.price.toLocaleString()}
            </p>
          </div>

          <div className="prose text-charcoal-600">
            <p>{product.description}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm text-charcoal-600">
              <span className="font-medium">Metal:</span>
              <span>{product.metal}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-charcoal-600">
              <span className="font-medium">Category:</span>
              <span className="capitalize">{product.category}</span>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center"
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Add to Cart
            </Button>
            
            <Button
              variant="outline"
              onClick={handleAddToWishlist}
              className="px-4"
            >
              <Heart
                className={`h-5 w-5 ${
                  isWishlisted ? 'fill-gold-400 text-gold-400' : ''
                }`}
              />
            </Button>
          </div>

          {/* Additional Info */}
          <div className="border-t border-cream-200 pt-6 space-y-4">
            <div>
              <h3 className="font-medium text-charcoal-800 mb-2">
                Product Details
              </h3>
              <ul className="list-disc list-inside text-sm text-charcoal-600 space-y-1">
                <li>Premium quality {product.metal}</li>
                <li>Handcrafted with precision</li>
                <li>Comes with certificate of authenticity</li>
                <li>Free shipping worldwide</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-charcoal-800 mb-2">
                Care Instructions
              </h3>
              <ul className="list-disc list-inside text-sm text-charcoal-600 space-y-1">
                <li>Store in the provided jewelry box</li>
                <li>Avoid contact with perfumes and chemicals</li>
                <li>Clean with a soft, dry cloth</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mock data for preview without Supabase connection
const mockProduct: Product = {
  id: '1',
  name: 'Elegant Diamond Necklace',
  category: 'diamond',
  price: 2999,
  metal: 'Gold',
  description: 'A stunning diamond necklace with 18K gold setting, featuring brilliant-cut diamonds totaling 1.5 carats. The perfect piece for special occasions or to add a touch of luxury to your everyday wear.',
  availability: true,
  created_at: new Date().toISOString(),
  product_images: [
    {
      id: '1',
      product_id: '1',
      image_url: 'https://images.pexels.com/photos/10018318/pexels-photo-10018318.jpeg?auto=compress&cs=tinysrgb&w=1600',
      angle: 'front'
    },
    {
      id: '2',
      product_id: '1',
      image_url: 'https://images.pexels.com/photos/12808501/pexels-photo-12808501.jpeg?auto=compress&cs=tinysrgb&w=1600',
      angle: 'side'
    },
    {
      id: '3',
      product_id: '1',
      image_url: 'https://images.pexels.com/photos/9428842/pexels-photo-9428842.jpeg?auto=compress&cs=tinysrgb&w=1600',
      angle: 'back'
    }
  ]
};

export default ProductDetailPage;