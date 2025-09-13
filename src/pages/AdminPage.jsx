import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { AuthContext } from '@/App';
import { Link, useNavigate } from 'react-router-dom';

const AdminPage = () => {
  const { toast } = useToast();
  const { session, loadingAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const userRoles = session?.user?.user_metadata?.roles || [];

    if (!loadingAuth && (!session || !userRoles.includes('Administrador'))) {
      toast({
        variant: "destructive",
        title: "Acceso Denegado",
        description: "Esta sección es solo para administradores."
      });
      navigate('/');
    }
  }, [session, loadingAuth, toast, navigate]);



  return (
    <>
      <h1>HOLA MUNDO</h1>
    </>
  );
};

const AdminCard = ({ title, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card p-6"
  >
    <h2 className="text-2xl font-semibold text-primary mb-4 font-orbitron">{title}</h2>
    {children}
  </motion.div>
);

export default AdminPage;