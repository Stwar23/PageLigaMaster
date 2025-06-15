import React, { useState, useEffect, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck, X, Info, Award, ShoppingCart, ShieldAlert, Coins as HandCoins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AuthContext } from '@/App';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const NotificationIcon = ({ type }) => {
  switch (type) {
    case 'resultado_partido': return <Award className="text-green-500" />;
    case 'fichaje_completado': return <ShoppingCart className="text-blue-500" />;
    case 'oferta_recibida': return <HandCoins className="text-yellow-500" />;
    case 'ajuste_admin': return <ShieldAlert className="text-red-500" />;
    default: return <Info className="text-gray-500" />;
  }
};

const NotificationsBell = () => {
  const { session } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const fetchNotifications = useCallback(async () => {
    if (!session?.user) return;
    try {
      const { data, error } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('usuario_id', session.user.id)
        .order('fecha_creacion', { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotifications(data || []);
      setUnreadCount(data.filter(n => !n.leido).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar las notificaciones.' });
    }
  }, [session, toast]);

  useEffect(() => {
    fetchNotifications();

    const notificationsChannel = supabase
      .channel(`notifications_user_${session?.user?.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notificaciones', filter: `usuario_id=eq.${session?.user?.id}` },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev].slice(0, 20));
          if (!payload.new.leido) {
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(notificationsChannel);
    };

  }, [session, fetchNotifications]);


  const markAsRead = async (notificationId) => {
    try {
      const { data, error } = await supabase
        .from('notificaciones')
        .update({ leido: true })
        .eq('id', notificationId)
        .eq('leido', false) 
        .select()
        .single();
      
      if (error) throw error;

      if (data) {
        setNotifications(prev => 
          prev.map(n => (n.id === notificationId ? { ...n, leido: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo marcar la notificación como leída.' });
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.leido).map(n => n.id);
      if(unreadIds.length === 0) return;

      const { error } = await supabase
        .from('notificaciones')
        .update({ leido: true })
        .in('id', unreadIds);
      
      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, leido: true })));
      setUnreadCount(0);
      toast({ title: 'Notificaciones Actualizadas', description: 'Todas las notificaciones marcadas como leídas.' });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron marcar todas las notificaciones.' });
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.leido) {
      markAsRead(notification.id);
    }
    // Si la notificación tiene una URL, podríamos navegar a ella
    // if (notification.url_relacionada) navigate(notification.url_relacionada);
    // Por ahora, solo cierra el popover si no hay URL o no se navega.
    // setIsOpen(false); // Esto puede ser molesto si el usuario quiere leer varias
  };

  if (!session) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-foreground hover:text-primary">
          <Bell size={22} />
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 md:w-96 p-0 bg-card/90 backdrop-blur-md border-primary/30 shadow-2xl" sideOffset={10}>
        <div className="p-4 border-b border-primary/20">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold font-orbitron text-primary">Notificaciones</h3>
            {notifications.length > 0 && unreadCount > 0 && (
              <Button variant="link" size="sm" onClick={markAllAsRead} className="text-xs text-primary hover:underline p-0 h-auto">
                Marcar todas como leídas
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="h-[300px] md:h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Bell size={32} className="mx-auto mb-2 opacity-50" />
              No tienes notificaciones nuevas.
            </div>
          ) : (
            <div className="divide-y divide-primary/10">
              {notifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "p-3 hover:bg-primary/5 transition-colors cursor-pointer",
                    !notif.leido && "bg-primary/10"
                  )}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 pt-1">
                      <NotificationIcon type={notif.tipo} />
                    </div>
                    <div className="flex-1">
                      <p className={cn("text-sm font-semibold", !notif.leido && "text-primary")}>
                        {notif.titulo}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{notif.mensaje}</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {new Date(notif.fecha_creacion).toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {!notif.leido && (
                      <motion.div 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex-shrink-0 h-2 w-2 bg-blue-500 rounded-full self-center" 
                        title="No leído"
                      />
                    )}
                  </div>
                  {notif.url_relacionada && (
                    <Link to={notif.url_relacionada} className="text-xs text-blue-500 hover:underline mt-1 block">
                      Ver detalles
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <div className="p-2 border-t border-primary/20 text-center">
            <Link to="/notificaciones" onClick={() => setIsOpen(false)} className="text-xs text-primary hover:underline">
              Ver todas las notificaciones
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsBell;