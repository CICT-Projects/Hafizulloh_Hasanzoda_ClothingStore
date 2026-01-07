import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface CartItem {
  id: number;
  product: { name: string; price: number };
  quantity: number;
}

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5255/api/cart')
      .then(response => {
        setCartItems(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching cart:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center py-16">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {cartItems.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-4 rounded shadow"
            >
              <h2>{item.product.name}</h2>
              <p>Quantity: {item.quantity}</p>
              <p>Price: ${item.product.price * item.quantity}</p>
            </motion.div>
          ))}
          <Link to="/checkout" className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition">
            Proceed to Checkout
          </Link>
        </div>
      )}
    </div>
  );
};

export default Cart;