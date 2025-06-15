import React from 'react';
import { motion } from 'framer-motion';

const PageWrapper = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5 }}
    className={`container mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}
  >
    {children}
  </motion.div>
);

export default PageWrapper;