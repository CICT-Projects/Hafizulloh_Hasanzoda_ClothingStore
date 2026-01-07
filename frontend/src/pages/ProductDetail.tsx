import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Product } from '../types';

interface ProductDetailInfo extends Product {
  size: string;
  color: string;
  stock: number;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:5255/api/products/${id}`)
      .then(response => {
        setProduct(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching product:', error);
        setLoading(false);
      });
  }, [id]);

  const addToCart = () => {
    // Assume user is logged in, add to cart
    axios.post('http://localhost:5255/api/cart', { productId: product?.id, quantity: 1 })
      .then(() => alert('Added to cart!'))
      .catch(error => console.error('Error adding to cart:', error));
  };

  if (loading) return <div className="text-center py-16">Loading...</div>;
  if (!product) return <div className="text-center py-16">Product not found</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <img src={product.imageUrl || 'https://via.placeholder.com/400'} alt={product.name} className="w-full h-96 object-cover rounded-lg shadow-md" />
        </motion.div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <p className="text-2xl font-bold text-purple-600 mb-2">${product.price}</p>
          <p className="text-sm text-gray-500 mb-4">Size: {product.size}, Color: {product.color}, Stock: {product.stock}</p>
          <button
            onClick={addToCart}
            className="bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700 transition"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetail;