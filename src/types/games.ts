export interface Prize {
  id: string;
  name: string;
  description: string;
  value?: number;
  image_url?: string;
  prize_type: string;
  address?: string;
  location_name?: string;
  doors: number;
  stock_quantity?: number;
  expires_at?: string;
  created_at: string;
}
