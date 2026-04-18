export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          created_at: string
          details: string | null
          id: string
          status: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          status?: string
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          created_at: string
          date: string
          id: string
          provider: string | null
          route: string
          status: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          provider?: string | null
          route: string
          status?: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          provider?: string | null
          route?: string
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_logs: {
        Row: {
          bot_response: string
          created_at: string
          feedback: string | null
          id: string
          matched: boolean
          session_id: string
          user_id: string | null
          user_message: string
          user_name: string
        }
        Insert: {
          bot_response: string
          created_at?: string
          feedback?: string | null
          id?: string
          matched?: boolean
          session_id: string
          user_id?: string | null
          user_message: string
          user_name?: string
        }
        Update: {
          bot_response?: string
          created_at?: string
          feedback?: string | null
          id?: string
          matched?: boolean
          session_id?: string
          user_id?: string | null
          user_message?: string
          user_name?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id: string
          user_id: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          session_title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          session_title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          session_title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chatbot_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      chatbot_training: {
        Row: {
          active: boolean
          category: string
          created_at: string
          id: string
          keywords: string[]
          response: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: string
          created_at?: string
          id?: string
          keywords?: string[]
          response: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          id?: string
          keywords?: string[]
          response?: string
          updated_at?: string
        }
        Relationships: []
      }
      consultations: {
        Row: {
          created_at: string
          date: string
          duration: number
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          notes: string | null
          phone: string | null
          price: number
          status: string
          time: string
          timezone: string
          topic: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          duration?: number
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          price: number
          status?: string
          time: string
          timezone?: string
          topic?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          duration?: number
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          price?: number
          status?: string
          time?: string
          timezone?: string
          topic?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      destinations: {
        Row: {
          active: boolean
          category: string
          country: string
          created_at: string
          currency: string
          description: string | null
          featured: boolean
          highlights: string[]
          id: string
          image_url: string | null
          name: string
          price_from: number | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: string
          country: string
          created_at?: string
          currency?: string
          description?: string | null
          featured?: boolean
          highlights?: string[]
          id?: string
          image_url?: string | null
          name: string
          price_from?: number | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          country?: string
          created_at?: string
          currency?: string
          description?: string | null
          featured?: boolean
          highlights?: string[]
          id?: string
          image_url?: string | null
          name?: string
          price_from?: number | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: string
          created_at: string
          file_path: string | null
          file_size: string | null
          file_type: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          file_path?: string | null
          file_size?: string | null
          file_type?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          file_path?: string | null
          file_size?: string | null
          file_type?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      flight_offers: {
        Row: {
          active: boolean
          airline: string
          arrival_time: string
          baggage: string | null
          cabin: string
          created_at: string
          departure_time: string
          destination: string
          duration: string
          featured: boolean
          id: string
          logo: string | null
          origin: string
          price: number
          refundable: boolean
          sort_order: number
          stop_city: string | null
          stops: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          airline: string
          arrival_time: string
          baggage?: string | null
          cabin?: string
          created_at?: string
          departure_time: string
          destination: string
          duration: string
          featured?: boolean
          id?: string
          logo?: string | null
          origin: string
          price: number
          refundable?: boolean
          sort_order?: number
          stop_city?: string | null
          stops?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          airline?: string
          arrival_time?: string
          baggage?: string | null
          cabin?: string
          created_at?: string
          departure_time?: string
          destination?: string
          duration?: string
          featured?: boolean
          id?: string
          logo?: string | null
          origin?: string
          price?: number
          refundable?: boolean
          sort_order?: number
          stop_city?: string | null
          stops?: number
          updated_at?: string
        }
        Relationships: []
      }
      hotel_offers: {
        Row: {
          active: boolean
          amenities: string[]
          created_at: string
          featured: boolean
          id: string
          location: string
          name: string
          original_price: number | null
          price: number
          rating: number
          reviews: number
          room_types: Json
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          amenities?: string[]
          created_at?: string
          featured?: boolean
          id?: string
          location: string
          name: string
          original_price?: number | null
          price: number
          rating?: number
          reviews?: number
          room_types?: Json
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          amenities?: string[]
          created_at?: string
          featured?: boolean
          id?: string
          location?: string
          name?: string
          original_price?: number | null
          price?: number
          rating?: number
          reviews?: number
          room_types?: Json
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          id: string
          invoice_number: string
          issued_at: string
          payment_id: string | null
          payment_method: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          invoice_number: string
          issued_at?: string
          payment_id?: string | null
          payment_method?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          invoice_number?: string
          issued_at?: string
          payment_id?: string | null
          payment_method?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          id: string
          payment_method: string | null
          reference: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          payment_method?: string | null
          reference?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          payment_method?: string | null
          reference?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      refund_requests: {
        Row: {
          admin_note: string | null
          created_at: string
          email: string
          id: string
          method: string
          original_amount: number
          phone: string | null
          processed_at: string | null
          reason: string
          refund_amount: number
          refund_id: string
          requested_at: string
          service: string
          status: string
          transaction_reference: string | null
          updated_at: string
          user_id: string | null
          user_name: string
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          email: string
          id?: string
          method: string
          original_amount?: number
          phone?: string | null
          processed_at?: string | null
          reason: string
          refund_amount?: number
          refund_id: string
          requested_at?: string
          service: string
          status?: string
          transaction_reference?: string | null
          updated_at?: string
          user_id?: string | null
          user_name: string
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          email?: string
          id?: string
          method?: string
          original_amount?: number
          phone?: string | null
          processed_at?: string | null
          reason?: string
          refund_amount?: number
          refund_id?: string
          requested_at?: string
          service?: string
          status?: string
          transaction_reference?: string | null
          updated_at?: string
          user_id?: string | null
          user_name?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          content: string
          created_at: string
          email: string
          id: string
          name: string
          rating: number
          role: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          content: string
          created_at?: string
          email: string
          id?: string
          name: string
          rating?: number
          role?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          content?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          rating?: number
          role?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      shipment_events: {
        Row: {
          created_at: string
          description: string
          id: string
          location: string
          occurred_at: string
          shipment_id: string
          sort_order: number
          status: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          location: string
          occurred_at?: string
          shipment_id: string
          sort_order?: number
          status: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          location?: string
          occurred_at?: string
          shipment_id?: string
          sort_order?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipment_events_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          created_at: string
          destination: string
          eta: string | null
          id: string
          origin: string
          progress: number
          status: string
          tracking_number: string
          updated_at: string
          user_id: string
          weight: string | null
        }
        Insert: {
          created_at?: string
          destination: string
          eta?: string | null
          id?: string
          origin: string
          progress?: number
          status?: string
          tracking_number: string
          updated_at?: string
          user_id: string
          weight?: string | null
        }
        Update: {
          created_at?: string
          destination?: string
          eta?: string | null
          id?: string
          origin?: string
          progress?: number
          status?: string
          tracking_number?: string
          updated_at?: string
          user_id?: string
          weight?: string | null
        }
        Relationships: []
      }
      site_content: {
        Row: {
          id: string
          key: string
          section: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          section: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          section?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          file_path: string | null
          id: string
          sort_order: number
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_type: string
          video_url: string | null
          visible: boolean
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_path?: string | null
          id?: string
          sort_order?: number
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_type?: string
          video_url?: string | null
          visible?: boolean
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_path?: string | null
          id?: string
          sort_order?: number
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_type?: string
          video_url?: string | null
          visible?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      public_reviews: {
        Row: {
          approved_at: string | null
          content: string | null
          created_at: string | null
          id: string | null
          name: string | null
          rating: number | null
          role: string | null
        }
        Insert: {
          approved_at?: string | null
          content?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          rating?: number | null
          role?: string | null
        }
        Update: {
          approved_at?: string | null
          content?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          rating?: number | null
          role?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_shipment_by_tracking: {
        Args: { p_tracking: string }
        Returns: {
          destination: string
          eta: string
          origin: string
          progress: number
          status: string
          tracking_number: string
          updated_at: string
        }[]
      }
      get_shipment_events_by_tracking: {
        Args: { p_tracking: string }
        Returns: {
          description: string
          location: string
          occurred_at: string
          sort_order: number
          status: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
