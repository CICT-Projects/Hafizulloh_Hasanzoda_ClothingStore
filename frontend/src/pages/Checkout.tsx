import React from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const Checkout: React.FC = () => {
  const handleCheckout = () => {
    axios.post('http://localhost:5255/api/orders')
      .then(() => alert('Order placed!'))
      .catch(error => console.error('Error placing order:', error));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-md mx-auto bg-white p-8 rounded shadow"
    >
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <p className="mb-4">Confirm your order.</p>
      <button
        onClick={handleCheckout}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        Place Order
      </button>
    </motion.div>
  );
};

export default Checkout;