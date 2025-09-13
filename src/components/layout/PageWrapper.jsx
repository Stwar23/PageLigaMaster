import React from 'react';
import { motion } from 'framer-motion';

const PageWrapper = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5 }}
    className={`container px-3 lg:px-8 pt-2 ${className}`}
  >
    {children}
  </motion.div>
);

export default PageWrapper;