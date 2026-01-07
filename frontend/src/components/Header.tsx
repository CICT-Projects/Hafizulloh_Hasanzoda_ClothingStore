import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from './AuthContext';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white shadow-lg sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Link to="/" className="text-2xl font-bold text-purple-600">Clothing Store</Link>
        </motion.div>
        <nav className="space-x-4 flex items-center">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Link to="/" className="text-gray-700 hover:text-purple-600 transition">Home</Link>
          </motion.div>
          {isAuthenticated && (
            <>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Link to="/cart" className="text-gray-700 hover:text-purple-600 transition">Cart</Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Link to="/orders" className="text-gray-700 hover:text-purple-600 transition">Orders</Link>
              </motion.div>
              {user?.role === 'Admin' && (
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/admin" className="text-gray-700 hover:text-purple-600 transition">Admin</Link>
                </motion.div>
              )}
              <motion.button 
                onClick={logout} 
                className="text-gray-700 hover:text-purple-600 transition"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                Logout
              </motion.button>
            </>
          )}
          {!isAuthenticated && (
            <>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Link to="/login" className="text-gray-700 hover:text-purple-600 transition">Login</Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Link to="/register" className="text-gray-700 hover:text-purple-600 transition">Register</Link>
              </motion.div>
            </>
          )}
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;