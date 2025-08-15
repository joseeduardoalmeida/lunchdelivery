
import { supabase } from '../integrations/supabase/client';

export class BaseService {
  // Helper method to check if current user is admin
  async isAdmin(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return false;

      const { data, error } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in isAdmin check:', error);
      return false;
    }
  }

  // Generate unique order ID using UUID
  generateOrderId(): string {
    return crypto.randomUUID();
  }

  // Helper method to get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    return user;
  }
}
