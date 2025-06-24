import { supabase } from './supabase/client';

export class FavoritesService {
  // Add a favorite
  async addFavorite(userId: string, prizeId: string) {
    const { data, error } = await supabase
      .from('user_favorites')
      .insert([{ user_id: userId, prize_id: prizeId }]);
    return { data, error };
  }

  // Remove a favorite
  async removeFavorite(userId: string, prizeId: string) {
    const { data, error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('prize_id', prizeId);
    return { data, error };
  }

  // Check if a prize is favorited by the user
  async isFavorited(userId: string, prizeId: string) {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('prize_id', prizeId)
      .single();
    return { favorited: !!data, error };
  }

  // Get all favorited prize IDs for the user
  async getFavoritePrizeIds(userId: string) {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('prize_id')
      .eq('user_id', userId);
    return { ids: data?.map((row: any) => row.prize_id) || [], error };
  }
}

export const favoritesService = new FavoritesService(); 