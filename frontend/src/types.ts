export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  category?: Category;
  size: string;
  color: string;
  stock: number;
  imageUrl?: string;
  isDeleted?: boolean;
}

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product?: Product;
}

export interface Cart {
  id: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  cartItems: CartItem[];
}

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Order {
  id: number;
  user: { id: number; email: string };
  totalAmount: number;
  createdAt: string;
  status: string;
  orderItems: OrderItem[];
}

export interface User {
  id: number;
  email: string;
  role: string;
}