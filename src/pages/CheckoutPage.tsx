import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { CreditCard, Truck, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { formatCurrency } from '../lib/utils';

interface ShippingFormData {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'shipping' | 'payment'>('shipping');
  
  const { register, handleSubmit, formState: { errors } } = useForm<ShippingFormData>();
  
  const handleShippingSubmit = (data: ShippingFormData) => {
    // In a real app, save shipping info to order
    setCurrentStep('payment');
  };
  
  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear cart and redirect to success page
      clearCart();
      navigate('/account', { state: { message: 'Order placed successfully!' } });
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-medium mb-4">Your cart is empty</h1>
          <Button onClick={() => navigate('/products')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-3xl text-charcoal-800 mb-8">Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main checkout form */}
          <div className="flex-1">
            {currentStep === 'shipping' ? (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="bg-white p-6 rounded-lg shadow-soft mb-6">
                  <h2 className="text-xl font-medium mb-4 flex items-center">
                    <Truck className="h-5 w-5 mr-2" />
                    Shipping Information
                  </h2>
                  
                  <form onSubmit={handleSubmit(handleShippingSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-charcoal-600 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          {...register('firstName', { required: true })}
                          className="w-full px-4 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gold-400"
                        />
                        {errors.firstName && (
                          <span className="text-sm text-error-500">First name is required</span>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-charcoal-600 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          {...register('lastName', { required: true })}
                          className="w-full px-4 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gold-400"
                        />
                        {errors.lastName && (
                          <span className="text-sm text-error-500">Last name is required</span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-charcoal-600 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
                        defaultValue={user?.email || ''}
                        className="w-full px-4 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gold-400"
                      />
                      {errors.email && (
                        <span className="text-sm text-error-500">Valid email is required</span>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-charcoal-600 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        {...register('address', { required: true })}
                        className="w-full px-4 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gold-400"
                      />
                      {errors.address && (
                        <span className="text-sm text-error-500">Address is required</span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-charcoal-600 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          {...register('city', { required: true })}
                          className="w-full px-4 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gold-400"
                        />
                        {errors.city && (
                          <span className="text-sm text-error-500">City is required</span>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-charcoal-600 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          {...register('state', { required: true })}
                          className="w-full px-4 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gold-400"
                        />
                        {errors.state && (
                          <span className="text-sm text-error-500">State is required</span>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-charcoal-600 mb-1">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          {...register('zipCode', { required: true, pattern: /^\d{5}(-\d{4})?$/ })}
                          className="w-full px-4 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gold-400"
                        />
                        {errors.zipCode && (
                          <span className="text-sm text-error-500">Valid ZIP code is required</span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-charcoal-600 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        {...register('phone', { required: true, pattern: /^\d{10}$/ })}
                        className="w-full px-4 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gold-400"
                      />
                      {errors.phone && (
                        <span className="text-sm text-error-500">Valid phone number is required</span>
                      )}
                    </div>
                    
                    <Button type="submit" className="w-full">
                      Continue to Payment
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </form>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="bg-white p-6 rounded-lg shadow-soft mb-6">
                  <h2 className="text-xl font-medium mb-4 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Information
                  </h2>
                  
                  <div className="space-y-4">
                    {/* Payment form would go here - using placeholder for demo */}
                    <div className="border border-cream-200 rounded-md p-4">
                      <p className="text-charcoal-500">
                        Payment integration would be implemented here using Stripe or another payment processor.
                      </p>
                    </div>
                    
                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep('shipping')}
                      >
                        Back to Shipping
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={handlePayment}
                        isLoading={isProcessing}
                      >
                        Place Order
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Order summary */}
          <div className="lg:w-96">
            <div className="bg-white p-6 rounded-lg shadow-soft">
              <h2 className="text-xl font-medium mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-charcoal-500">Quantity: {item.quantity}</p>
                      <p className="text-gold-500">{formatCurrency(item.price)}</p>
                    </div>
                  </div>
                ))}
                
                <div className="border-t border-cream-200 pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-charcoal-500">Subtotal</span>
                    <span className="font-medium">{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-charcoal-500">Shipping</span>
                    <span className="font-medium">Free</span>
                  </div>
                  <div className="flex justify-between text-lg font-medium">
                    <span>Total</span>
                    <span className="text-gold-500">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;