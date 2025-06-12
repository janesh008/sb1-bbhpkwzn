export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          phone: string | null
          profile_image: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          phone?: string | null
          profile_image?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          phone?: string | null
          profile_image?: string | null
          created_at?: string
        }
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          address: string
          type: string
          is_default: boolean
        }
        Insert: {
          id?: string
          user_id: string
          address: string
          type: string
          is_default?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          address?: string
          type?: string
          is_default?: boolean
        }
      }
      products: {
        Row: {
          id: string
          name: string
          category: string
          price: number
          metal: string
          tags: string[] | null
          certification_info: Json | null
          description: string
          availability: boolean
          model_3d_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          price: number
          metal: string
          tags?: string[] | null
          certification_info?: Json | null
          description: string
          availability?: boolean
          model_3d_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          price?: number
          metal?: string
          tags?: string[] | null
          certification_info?: Json | null
          description?: string
          availability?: boolean
          model_3d_url?: string | null
          created_at?: string
        }
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          image_url: string
          angle: string | null
        }
        Insert: {
          id?: string
          product_id: string
          image_url: string
          angle?: string | null
        }
        Update: {
          id?: string
          product_id?: string
          image_url?: string
          angle?: string | null
        }
      }
      wishlists: {
        Row: {
          id: string
          user_id: string
          product_id: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          total_price: number
          status: string
          payment_mode: string
          payment_id: string | null
          placed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_price: number
          status: string
          payment_mode: string
          payment_id?: string | null
          placed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_price?: number
          status?: string
          payment_mode?: string
          payment_id?: string | null
          placed_at?: string
        }
      }
    }
  }
}