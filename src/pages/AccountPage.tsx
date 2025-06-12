import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User, Settings, Package, CreditCard, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface ProfileForm {
  name: string;
  email: string;
  phone: string;
}

interface Address {
  id: string;
  address: string;
  type: string;
  is_default: boolean;
}

const AccountPage = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState([]);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileForm>();
  
  useEffect(() => {
    document.title = 'My Account | AXELS';
    fetchUserData();
  }, []);
  
  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', user?.id)
        .single();
        
      if (profile) {
        setValue('name', profile.full_name || '');
        setValue('email', profile.email || '');
        setValue('phone', profile.phone || '');
      }
      
      // Fetch addresses
      const { data: addressData } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user?.id);
        
      if (addressData) {
        setAddresses(addressData);
      }
      
      // Fetch orders - Updated query to use customer_id and proper relationships
      const { data: orderData } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              *,
              product_images (*)
            )
          )
        `)
        .eq('customer_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (orderData) {
        setOrders(orderData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load account data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const onSubmit = async (data: ProfileForm) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: data.name,
          phone: data.phone
        })
        .eq('auth_user_id', user?.id);
        
      if (error) throw error;
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-serif text-3xl md:text-4xl text-charcoal-800 mb-8">My Account</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 space-y-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'profile'
                  ? 'bg-gold-400 text-white'
                  : 'hover:bg-cream-100 text-charcoal-600'
              }`}
            >
              <User className="h-5 w-5" />
              <span>Profile</span>
            </button>
            
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'orders'
                  ? 'bg-gold-400 text-white'
                  : 'hover:bg-cream-100 text-charcoal-600'
              }`}
            >
              <Package className="h-5 w-5" />
              <span>Orders</span>
            </button>
            
            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'addresses'
                  ? 'bg-gold-400 text-white'
                  : 'hover:bg-cream-100 text-charcoal-600'
              }`}
            >
              <CreditCard className="h-5 w-5" />
              <span>Addresses</span>
            </button>
            
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'settings'
                  ? 'bg-gold-400 text-white'
                  : 'hover:bg-cream-100 text-charcoal-600'
              }`}
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </button>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-error-500 hover:bg-error-100 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </aside>
          
          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <div className="bg-white p-6 rounded-lg shadow-soft">
                <h2 className="text-xl font-medium text-charcoal-800 mb-6">Profile Information</h2>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal-600 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      {...register('name')}
                      className="w-full px-4 py-2 rounded-md border border-cream-200 focus:outline-none focus:ring-2 focus:ring-gold-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-charcoal-600 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      {...register('email')}
                      disabled
                      className="w-full px-4 py-2 rounded-md border border-cream-200 bg-cream-50 cursor-not-allowed"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-charcoal-600 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      {...register('phone')}
                      className="w-full px-4 py-2 rounded-md border border-cream-200 focus:outline-none focus:ring-2 focus:ring-gold-400"
                    />
                  </div>
                  
                  <Button type="submit" className="mt-4">
                    Save Changes
                  </Button>
                </form>
              </div>
            )}
            
            {activeTab === 'orders' && (
              <div className="bg-white p-6 rounded-lg shadow-soft">
                <h2 className="text-xl font-medium text-charcoal-800 mb-6">Order History</h2>
                
                {orders.length === 0 ? (
                  <p className="text-charcoal-500">No orders found.</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order: any) => (
                      <div
                        key={order.id}
                        className="border border-cream-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="font-medium text-charcoal-800">
                              Order #{order.order_number}
                            </p>
                            <p className="text-sm text-charcoal-500">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-charcoal-800">
                              ${order.total_amount.toFixed(2)}
                            </p>
                            <p className="text-sm text-charcoal-500 capitalize">
                              {order.status}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {order.order_items?.map((item: any) => (
                            <div
                              key={item.id}
                              className="flex items-center space-x-4"
                            >
                              <img
                                src={item.products?.product_images?.[0]?.image_url}
                                alt={item.products?.name || item.products?.product_name}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div>
                                <p className="font-medium text-charcoal-800">
                                  {item.products?.name || item.products?.product_name}
                                </p>
                                <p className="text-sm text-charcoal-500">
                                  Quantity: {item.quantity}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'addresses' && (
              <div className="bg-white p-6 rounded-lg shadow-soft">
                <h2 className="text-xl font-medium text-charcoal-800 mb-6">Saved Addresses</h2>
                
                {addresses.length === 0 ? (
                  <p className="text-charcoal-500">No addresses found.</p>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className="border border-cream-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-charcoal-800 capitalize">
                              {address.type}
                            </p>
                            <p className="text-charcoal-600 mt-1">
                              {address.address}
                            </p>
                          </div>
                          {address.is_default && (
                            <span className="text-sm text-gold-400 font-medium">
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <Button className="mt-6">
                  Add New Address
                </Button>
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div className="bg-white p-6 rounded-lg shadow-soft">
                <h2 className="text-xl font-medium text-charcoal-800 mb-6">Account Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-charcoal-800 mb-2">
                      Email Preferences
                    </h3>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded text-gold-400 focus:ring-gold-400" />
                        <span className="text-charcoal-600">Order updates</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded text-gold-400 focus:ring-gold-400" />
                        <span className="text-charcoal-600">Promotional emails</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded text-gold-400 focus:ring-gold-400" />
                        <span className="text-charcoal-600">New product launches</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-charcoal-800 mb-2">
                      Password
                    </h3>
                    <Button variant="outline">
                      Change Password
                    </Button>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-charcoal-800 mb-2">
                      Delete Account
                    </h3>
                    <p className="text-charcoal-500 text-sm mb-2">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button variant="outline" className="text-error-500 border-error-500 hover:bg-error-50">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;