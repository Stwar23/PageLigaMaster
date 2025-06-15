import { supabase } from '@/lib/supabaseClient';

export const createNotification = async (userId, type, title, message, urlRelated = null) => {
  try {
    const { data, error } = await supabase
      .from('notificaciones')
      .insert({
        usuario_id: userId,
        tipo: type,
        titulo: title,
        mensaje: message,
        url_relacionada: urlRelated,
      });

    if (error) {
      console.error('Error creating notification:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error creating notification:', error);
    return { success: false, error };
  }
};

export const createMultipleNotifications = async (notificationsArray) => {
  try {
    const { data, error } = await supabase
      .from('notificaciones')
      .insert(notificationsArray);

    if (error) {
      console.error('Error creating multiple notifications:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error creating multiple notifications:', error);
    return { success: false, error };
  }
};