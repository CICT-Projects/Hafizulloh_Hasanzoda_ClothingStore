import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, ArrowDown } from 'lucide-react'; // Не забудь установить lucide-react
import { Product } from '../types';

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5255/api/products')
      .then(response => {
        console.log('Products response:', response.data);
        setProducts(response.data.products || response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }} 
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-xs uppercase tracking-[0.5em] font-light"
        >
          Загрузка...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* 1. HERO SECTION - ВАУ ЭФФЕКТ */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-[#1a1a1a]">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="z-10 text-center text-white px-4"
        >
          <span className="text-xs uppercase tracking-[0.4em] mb-4 block opacity-70">New Season 2026</span>
          <h1 className="text-6xl md:text-8xl font-extralight tracking-tighter mb-8 leading-none">
            COLLECTION <br /> <span className="italic font-serif">Essentials</span>
          </h1>
          <a href="#catalog" className="inline-flex items-center gap-2 border-b border-white pb-2 text-sm uppercase tracking-widest hover:opacity-50 transition">
            Explore Collection <ArrowDown size={14} />
          </a>
        </motion.div>
        
        {/* Фоновое абстрактное изображение или темный градиент */}
        <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1441984969175-ea5e10cf77bd?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
      </section>

      {/* 2. КАТАЛОГ */}
      <main id="catalog" className="max-w-[1600px] mx-auto px-6 py-24">
        <div className="flex justify-between items-end mb-16 border-b border-gray-100 pb-8">
          <div>
            <h2 className="text-2xl font-light uppercase tracking-widest text-gray-900">Catalogue</h2>
            <p className="text-gray-400 text-xs mt-2 italic">Minimalist approach to everyday wear</p>
          </div>
          <div className="text-xs uppercase tracking-widest text-gray-400">
            Items: {products.length}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
          <AnimatePresence>
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="group flex flex-col"
              >
                {/* Image Container */}
                <Link to={`/product/${product.id}`} className="relative overflow-hidden bg-[#f5f5f5] aspect-[3/4]">
                  <img
                    src={product.imageUrl ? product.imageUrl : `https://source.unsplash.com/random/800x1200?clothing,${product.id}`}
                    alt={product.name}
                    className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                  />
                  {/* Quick Action */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="bg-white text-black text-[10px] uppercase tracking-[0.2em] px-6 py-3 shadow-2xl hover:bg-black hover:text-white transition">
                      Quick View
                    </button>
                  </div>
                </Link>

                {/* Details */}
                <div className="mt-6 flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-[13px] uppercase tracking-wider font-medium text-gray-800">
                      {product.name}
                    </h3>
                    <span className="text-[13px] text-gray-900 font-semibold">${product.price}</span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[11px] text-gray-400 uppercase tracking-tighter">
                      {product.color} — {product.size}
                    </span>
                    {product.stock < 5 && (
                      <span className="text-[9px] text-red-500 uppercase font-bold tracking-tighter">
                        Last units
                      </span>
                    )}
                  </div>
                  
                  <Link 
                    to={`/product/${product.id}`} 
                    className="mt-4 flex items-center justify-between text-[10px] uppercase tracking-widest border-t border-gray-100 pt-4 hover:text-gray-500 transition"
                  >
                    View Details <ArrowRight size={12} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Home;