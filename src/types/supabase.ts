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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      certifications: {
        Row: {
          certification_name: string
          clinic_id: string
          created_at: string
          id: string
          issued_by: string | null
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          certification_name: string
          clinic_id: string
          created_at?: string
          id?: string
          issued_by?: string | null
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          certification_name?: string
          clinic_id?: string
          created_at?: string
          id?: string
          issued_by?: string | null
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certifications_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_availability: {
        Row: {
          clinic_id: string
          created_at: string
          end_date: string
          id: string
          notes: string | null
          start_date: string
          type: Database["public"]["Enums"]["availability_type"]
          updated_at: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          end_date: string
          id?: string
          notes?: string | null
          start_date: string
          type?: Database["public"]["Enums"]["availability_type"]
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          end_date?: string
          id?: string
          notes?: string | null
          start_date?: string
          type?: Database["public"]["Enums"]["availability_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_availability_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_equipment: {
        Row: {
          category: Database["public"]["Enums"]["equipment_category"]
          clinic_id: string
          created_at: string
          id: string
          manufacturer: string | null
          model: string | null
          name: string
          notes: string | null
          quantity: number
          updated_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["equipment_category"]
          clinic_id: string
          created_at?: string
          id?: string
          manufacturer?: string | null
          model?: string | null
          name: string
          notes?: string | null
          quantity?: number
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["equipment_category"]
          clinic_id?: string
          created_at?: string
          id?: string
          manufacturer?: string | null
          model?: string | null
          name?: string
          notes?: string | null
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_equipment_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          address: string | null
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          country: string | null
          created_at: string
          description: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          num_investigators: number | null
          organization_id: string
          patient_capacity: number | null
          phase_experience: string[] | null
          status: Database["public"]["Enums"]["clinic_status"]
          therapeutic_area_ids: string[] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          num_investigators?: number | null
          organization_id: string
          patient_capacity?: number | null
          phase_experience?: string[] | null
          status?: Database["public"]["Enums"]["clinic_status"]
          therapeutic_area_ids?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          num_investigators?: number | null
          organization_id?: string
          patient_capacity?: number | null
          phase_experience?: string[] | null
          status?: Database["public"]["Enums"]["clinic_status"]
          therapeutic_area_ids?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          created_at: string
          created_by: string
          id: string
          match_result_id: string
          status: Database["public"]["Enums"]["inquiry_status"]
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          match_result_id: string
          status?: Database["public"]["Enums"]["inquiry_status"]
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          match_result_id?: string
          status?: Database["public"]["Enums"]["inquiry_status"]
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_match_result_id_fkey"
            columns: ["match_result_id"]
            isOneToOne: false
            referencedRelation: "match_results"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiry_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          inquiry_id: string
          metadata: Json | null
          sender_id: string
          type: Database["public"]["Enums"]["message_type"]
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          inquiry_id: string
          metadata?: Json | null
          sender_id: string
          type?: Database["public"]["Enums"]["message_type"]
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          inquiry_id?: string
          metadata?: Json | null
          sender_id?: string
          type?: Database["public"]["Enums"]["message_type"]
        }
        Relationships: [
          {
            foreignKeyName: "inquiry_messages_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiry_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_results: {
        Row: {
          algorithm_version: string | null
          clinic_id: string
          created_at: string
          id: string
          overall_score: number | null
          project_id: string
          score_breakdown: Json | null
          status: Database["public"]["Enums"]["match_status"]
          updated_at: string
        }
        Insert: {
          algorithm_version?: string | null
          clinic_id: string
          created_at?: string
          id?: string
          overall_score?: number | null
          project_id: string
          score_breakdown?: Json | null
          status?: Database["public"]["Enums"]["match_status"]
          updated_at?: string
        }
        Update: {
          algorithm_version?: string | null
          clinic_id?: string
          created_at?: string
          id?: string
          overall_score?: number | null
          project_id?: string
          score_breakdown?: Json | null
          status?: Database["public"]["Enums"]["match_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_results_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_results_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "trial_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          type: Database["public"]["Enums"]["organization_type"]
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          type: Database["public"]["Enums"]["organization_type"]
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["organization_type"]
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          organization_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          full_name?: string | null
          id: string
          last_name?: string | null
          organization_id?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      project_requirements: {
        Row: {
          created_at: string
          id: string
          is_hard_filter: boolean
          label: string
          project_id: string
          type: Database["public"]["Enums"]["requirement_type"]
          updated_at: string
          value: Json
          weight: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_hard_filter?: boolean
          label: string
          project_id: string
          type: Database["public"]["Enums"]["requirement_type"]
          updated_at?: string
          value: Json
          weight?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_hard_filter?: boolean
          label?: string
          project_id?: string
          type?: Database["public"]["Enums"]["requirement_type"]
          updated_at?: string
          value?: Json
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_requirements_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "trial_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      therapeutic_areas: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      trial_projects: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          organization_id: string
          phase: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          target_enrollment: number | null
          therapeutic_area_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          organization_id: string
          phase?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          target_enrollment?: number | null
          therapeutic_area_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          organization_id?: string
          phase?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          target_enrollment?: number | null
          therapeutic_area_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trial_projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trial_projects_therapeutic_area_id_fkey"
            columns: ["therapeutic_area_id"]
            isOneToOne: false
            referencedRelation: "therapeutic_areas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      availability_type: "available" | "busy" | "tentative"
      clinic_status: "active" | "inactive" | "pending"
      equipment_category:
        | "imaging"
        | "laboratory"
        | "monitoring"
        | "surgical"
        | "rehabilitation"
        | "diagnostic"
        | "other"
      inquiry_status: "open" | "in_progress" | "closed" | "withdrawn"
      match_status: "pending" | "reviewed" | "accepted" | "rejected"
      message_type: "text" | "document" | "status_update"
      organization_type: "sponsor" | "clinic"
      project_status: "draft" | "active" | "paused" | "completed" | "archived"
      requirement_type:
        | "therapeutic_area"
        | "equipment"
        | "patient_volume"
        | "certification"
        | "geography"
        | "other"
      user_role: "sponsor" | "clinic_admin" | "admin"
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
      availability_type: ["available", "busy", "tentative"],
      clinic_status: ["active", "inactive", "pending"],
      equipment_category: [
        "imaging",
        "laboratory",
        "monitoring",
        "surgical",
        "rehabilitation",
        "diagnostic",
        "other",
      ],
      inquiry_status: ["open", "in_progress", "closed", "withdrawn"],
      match_status: ["pending", "reviewed", "accepted", "rejected"],
      message_type: ["text", "document", "status_update"],
      organization_type: ["sponsor", "clinic"],
      project_status: ["draft", "active", "paused", "completed", "archived"],
      requirement_type: [
        "therapeutic_area",
        "equipment",
        "patient_volume",
        "certification",
        "geography",
        "other",
      ],
      user_role: ["sponsor", "clinic_admin", "admin"],
    },
  },
} as const
