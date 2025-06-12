import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  X,
  ChevronLeft,
  ChevronRight,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Download,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import Button from '../../components/ui/Button';
import { useDebounce } from '../../hooks/useDebounce';
import { supabase } from '../../lib/supabase';
import { useAdminAuth } from '../../context/AdminAuthContext';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_address: any;
  billing_address: any;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  stripe_payment_intent_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  customers?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  order_items?: Array<{
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    products?: {
      id: string;
      product_name: string;
      name: string;
      product_images?: Array<{
        image_url: string;
      }>;
    };
  }>;
}

interface OrderTimeline {
  id: string;
  order_id: string;
  status: string;
  timestamp: string;
  notes?: string;
}

const AdminOrdersPage = () => {
  const { hasRole } = useAdminAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [orderTimeline, setOrderTimeline] = useState<OrderTimeline[]>([]);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const ordersPerPage = 10;
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, debouncedSearchTerm, statusFilter, paymentStatusFilter, dateFilter]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('orders')
        .select(`
          *,
          customers:customer_id(id, first_name, last_name, email, phone),
          order_items(
            *,
            products(
              id,
              product_name,
              name,
              product_images(image_url)
            )
          )
        `)
        .order('created_at', { ascending: false });

      // Apply search filter
      if (debouncedSearchTerm) {
        query = query.or(`order_number.ilike.%${debouncedSearchTerm}%`);
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // Apply payment status filter
      if (paymentStatusFilter !== 'all') {
        query = query.eq('payment_status', paymentStatusFilter);
      }

      // Apply date filter
      if (dateFilter !== 'all') {
        const now = new Date();
        let startDate: Date;
        
        switch (dateFilter) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          default:
            startDate = new Date(0);
        }
        
        query = query.gte('created_at', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to fetch orders');
        return;
      }

      setOrders(data || []);
      setTotalPages(Math.ceil((data?.length || 0) / ordersPerPage));
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrderTimeline = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('order_timeline')
        .select('*')
        .eq('order_id', orderId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      setOrderTimeline(data || []);
    } catch (error) {
      console.error('Error fetching order timeline:', error);
    }
  };

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
    await fetchOrderTimeline(order.id);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!hasRole('Moderator')) {
      toast.error('Insufficient permissions to update order status');
      return;
    }

    try {
      setIsUpdatingStatus(true);
      
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Add to timeline
      await supabase
        .from('order_timeline')
        .insert([{
          order_id: orderId,
          status: newStatus,
          timestamp: new Date().toISOString()
        }]);

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus as any, updated_at: new Date().toISOString() }
          : order
      ));

      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as any });
        await fetchOrderTimeline(orderId);
      }

      toast.success('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!hasRole('Admin')) {
      toast.error('Insufficient permissions to cancel orders');
      return;
    }

    if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    await handleUpdateOrderStatus(orderId, 'cancelled');
  };

  const handleRefund = async (orderId: string) => {
    if (!hasRole('Admin')) {
      toast.error('Insufficient permissions to process refunds');
      return;
    }

    if (!confirm('Are you sure you want to process a refund for this order?')) {
      return;
    }

    try {
      // In a real implementation, this would integrate with Stripe/Razorpay
      await supabase
        .from('orders')
        .update({ payment_status: 'refunded' })
        .eq('id', orderId);

      toast.success('Refund processed successfully');
      fetchOrders();
    } catch (error) {
      console.error('Error processing refund:', error);
      toast.error('Failed to process refund');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'warning' as const, icon: Clock },
      processing: { variant: 'secondary' as const, icon: Package },
      shipped: { variant: 'default' as const, icon: Truck },
      delivered: { variant: 'success' as const, icon: CheckCircle },
      cancelled: { variant: 'error' as const, icon: X }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'warning' as const },
      completed: { variant: 'success' as const },
      failed: { variant: 'error' as const },
      refunded: { variant: 'secondary' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Badge variant={config.variant}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ordersPerPage;
    return orders.slice(startIndex, startIndex + ordersPerPage);
  }, [orders, currentPage, ordersPerPage]);

  const getOrderProgress = (status: string) => {
    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = steps.indexOf(status);
    return currentIndex >= 0 ? ((currentIndex + 1) / steps.length) * 100 : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600">Manage customer orders and track fulfillment</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchOrders}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Order Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({orders.length})</CardTitle>
          <CardDescription>
            Manage and track all customer orders
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
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="font-medium">{order.order_number}</div>
                        <div className="text-sm text-gray-500">#{order.id.slice(0, 8)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {order.customers?.first_name} {order.customers?.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{order.customers?.email}</div>
                          <div className="text-sm text-gray-500">{order.customers?.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span>{order.order_items?.length || 0} items</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatCurrency(order.total_amount)}</div>
                      </TableCell>
                      <TableCell>
                        {getPaymentStatusBadge(order.payment_status)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {getStatusBadge(order.status)}
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${getOrderProgress(order.status)}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {hasRole('Moderator') && (
                            <Select
                              value={order.status}
                              onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                              disabled={isUpdatingStatus}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * ordersPerPage) + 1} to {Math.min(currentPage * ordersPerPage, orders.length)} of {orders.length} orders
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

      {/* Order Details Modal */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Order Details - {selectedOrder?.order_number}</span>
              <div className="flex items-center space-x-2">
                {selectedOrder && getStatusBadge(selectedOrder.status)}
                {selectedOrder && getPaymentStatusBadge(selectedOrder.payment_status)}
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Progress */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-4">Order Progress</h3>
                <div className="flex items-center justify-between">
                  {['pending', 'processing', 'shipped', 'delivered'].map((step, index) => {
                    const isActive = ['pending', 'processing', 'shipped', 'delivered'].indexOf(selectedOrder.status) >= index;
                    const isCurrent = selectedOrder.status === step;
                    
                    return (
                      <div key={step} className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                        } ${isCurrent ? 'ring-2 ring-blue-300' : ''}`}>
                          {step === 'pending' && <Clock className="h-4 w-4" />}
                          {step === 'processing' && <Package className="h-4 w-4" />}
                          {step === 'shipped' && <Truck className="h-4 w-4" />}
                          {step === 'delivered' && <CheckCircle className="h-4 w-4" />}
                        </div>
                        <span className="text-xs mt-1 capitalize">{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{selectedOrder.customers?.first_name} {selectedOrder.customers?.last_name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{selectedOrder.customers?.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{selectedOrder.customers?.phone}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Payment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Payment Method:</span>
                      <span className="font-medium">{selectedOrder.payment_method || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Status:</span>
                      {getPaymentStatusBadge(selectedOrder.payment_status)}
                    </div>
                    <div className="flex justify-between">
                      <span>Total Amount:</span>
                      <span className="font-medium text-lg">{formatCurrency(selectedOrder.total_amount)}</span>
                    </div>
                    {selectedOrder.stripe_payment_intent_id && (
                      <div className="flex justify-between">
                        <span>Payment ID:</span>
                        <span className="font-mono text-sm">{selectedOrder.stripe_payment_intent_id}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shipping_address && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      {typeof selectedOrder.shipping_address === 'string' 
                        ? selectedOrder.shipping_address 
                        : JSON.stringify(selectedOrder.shipping_address, null, 2)}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Order Items ({selectedOrder.order_items?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedOrder.order_items?.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          {item.products?.product_images?.[0]?.image_url ? (
                            <img
                              src={item.products.product_images[0].image_url}
                              alt={item.products.product_name || item.products.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.products?.product_name || item.products?.name}</h4>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                          <p className="text-sm text-gray-500">Unit Price: {formatCurrency(item.unit_price)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(item.total_price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Order Timeline */}
              {orderTimeline.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Order Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {orderTimeline.map((event, index) => (
                        <div key={event.id} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium capitalize">{event.status}</p>
                                {event.notes && (
                                  <p className="text-sm text-gray-500">{event.notes}</p>
                                )}
                              </div>
                              <span className="text-sm text-gray-500">
                                {formatDate(event.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                {hasRole('Admin') && selectedOrder.payment_status === 'completed' && (
                  <Button
                    variant="outline"
                    onClick={() => handleRefund(selectedOrder.id)}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Process Refund
                  </Button>
                )}
                {hasRole('Admin') && selectedOrder.status !== 'cancelled' && (
                  <Button
                    variant="outline"
                    onClick={() => handleCancelOrder(selectedOrder.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel Order
                  </Button>
                )}
                <Button onClick={() => setShowOrderDetails(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrdersPage;