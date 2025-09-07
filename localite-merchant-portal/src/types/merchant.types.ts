/**
 * 商家系統類型定義
 */

export interface MerchantProfile {
  uid: string;
  email: string;
  businessName: string;
  businessType: string;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: any;
  verifiedAt?: any;
  contactPhone?: string;
  businessAddress?: string;
  businessDescription?: string;
  businessHours?: string;
  socialLinks?: {
    website?: string;
    facebook?: string;
    instagram?: string;
  };
  images?: string[];
  documents?: string[];
}

export interface Product {
  id: string;
  merchantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface Order {
  id: string;
  merchantId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  products: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  createdAt: any;
  updatedAt: any;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Analytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    orderCount: number;
    revenue: number;
  }>;
  monthlyStats: Array<{
    month: string;
    orders: number;
    revenue: number;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
