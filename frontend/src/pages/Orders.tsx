import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface OrderItem {
  product: { name: string; price: number };
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  totalAmount: number;
  createdAt: string;
  status: string;
  orderItems: OrderItem[];
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5255/api/orders')
      .then(response => {
        setOrders(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching orders:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center py-16">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white p-4 rounded shadow">
              <h2>Order #{order.id}</h2>
              <p>Total: ${order.totalAmount}</p>
              <p>Status: {order.status}</p>
              <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              <div>
                <h3>Items:</h3>
                {order.orderItems.map((item, index) => (
                  <p key={index}>{item.product.name} x{item.quantity} - ${item.price}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;