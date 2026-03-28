export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      certifications: {
        Row: {
          certification_name: string
          clinic_id: string
          created_at: string
          id: string
          issued_by: string | null
          valid_until: string | null
        }
        Insert: {
          certification_name: string
          clinic_id: string
          created_at?: string
          id?: string
          issued_by?: string | null
          valid_until?: string | null
        }
        Update: {
          certification_name?: string
          clinic_id?: string
          created_at?: string
          id?: string
          issued_by?: string | null
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
          available_from: string
          available_to: string
          clinic_id: string
          created_at: string
          current_trial_count: number
          id: string
          max_concurrent_trials: number
        }
        Insert: {
          available_from: string
          available_to: string
          clinic_id: string
          created_at?: string
          current_trial_count?: number
          id?: string
          max_concurrent_trials?: number
        }
        Update: {
          available_from?: string
          available_to?: string
          clinic_id?: string
          created_at?: string
          current_trial_count?: number
          id?: string
          max_concurrent_trials?: number
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
      clinic_specializations: {
        Row: {
          clinic_id: string
          therapeutic_area_id: string
        }
        Insert: {
          clinic_id: string
          therapeutic_area_id: string
        }
        Update: {
          clinic_id?: string
          therapeutic_area_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_specializations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_specializations_therapeutic_area_id_fkey"
            columns: ["therapeutic_area_id"]
            isOneToOne: false
            referencedRelation: "therapeutic_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          active_trial_count: number
          address: string | null
          avg_contract_execution_days: number | null
          avg_enrollment_rate_per_month: number | null
          avg_query_response_days: number | null
          avg_screen_failure_rate: number | null
          catchment_area_population: number | null
          city: string
          contact_email: string | null
          contact_phone: string | null
          country: string
          created_at: string
          description: string | null
          id: string
          irb_avg_review_days: number | null
          irb_type: string | null
          last_fda_inspection_outcome:
            | Database["public"]["Enums"]["fda_inspection_outcome"]
            | null
          max_concurrent_trials: number
          molecule_type_experience:
            | Database["public"]["Enums"]["molecule_type"][]
            | null
          name: string
          nci_designated: boolean
          patient_population: Json | null
          phase_experience: Database["public"]["Enums"]["trial_phase"][] | null
          protocol_deviation_rate: number | null
          referral_network_size: number | null
          site_type: Database["public"]["Enums"]["site_type"]
          updated_at: string
          user_id: string | null
          website: string | null
        }
        Insert: {
          active_trial_count?: number
          address?: string | null
          avg_contract_execution_days?: number | null
          avg_enrollment_rate_per_month?: number | null
          avg_query_response_days?: number | null
          avg_screen_failure_rate?: number | null
          catchment_area_population?: number | null
          city: string
          contact_email?: string | null
          contact_phone?: string | null
          country?: string
          created_at?: string
          description?: string | null
          id?: string
          irb_avg_review_days?: number | null
          irb_type?: string | null
          last_fda_inspection_outcome?:
            | Database["public"]["Enums"]["fda_inspection_outcome"]
            | null
          max_concurrent_trials?: number
          molecule_type_experience?:
            | Database["public"]["Enums"]["molecule_type"][]
            | null
          name: string
          nci_designated?: boolean
          patient_population?: Json | null
          phase_experience?: Database["public"]["Enums"]["trial_phase"][] | null
          protocol_deviation_rate?: number | null
          referral_network_size?: number | null
          site_type?: Database["public"]["Enums"]["site_type"]
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Update: {
          active_trial_count?: number
          address?: string | null
          avg_contract_execution_days?: number | null
          avg_enrollment_rate_per_month?: number | null
          avg_query_response_days?: number | null
          avg_screen_failure_rate?: number | null
          catchment_area_population?: number | null
          city?: string
          contact_email?: string | null
          contact_phone?: string | null
          country?: string
          created_at?: string
          description?: string | null
          id?: string
          irb_avg_review_days?: number | null
          irb_type?: string | null
          last_fda_inspection_outcome?:
            | Database["public"]["Enums"]["fda_inspection_outcome"]
            | null
          max_concurrent_trials?: number
          molecule_type_experience?:
            | Database["public"]["Enums"]["molecule_type"][]
            | null
          name?: string
          nci_designated?: boolean
          patient_population?: Json | null
          phase_experience?: Database["public"]["Enums"]["trial_phase"][] | null
          protocol_deviation_rate?: number | null
          referral_network_size?: number | null
          site_type?: Database["public"]["Enums"]["site_type"]
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      contact_inquiries: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          organization_type: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          organization_type?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          organization_type?: string | null
        }
        Relationships: []
      }
      equipment: {
        Row: {
          clinic_id: string
          created_at: string
          equipment_type: string
          id: string
          is_available: boolean
          name: string
          quantity: number
        }
        Insert: {
          clinic_id: string
          created_at?: string
          equipment_type: string
          id?: string
          is_available?: boolean
          name: string
          quantity?: number
        }
        Update: {
          clinic_id?: string
          created_at?: string
          equipment_type?: string
          id?: string
          is_available?: boolean
          name?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "equipment_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      match_results: {
        Row: {
          breakdown: Json | null
          clinic_id: string
          id: string
          matched_at: string
          overall_score: number
          status: Database["public"]["Enums"]["match_status"]
          trial_project_id: string
        }
        Insert: {
          breakdown?: Json | null
          clinic_id: string
          id?: string
          matched_at?: string
          overall_score?: number
          status?: Database["public"]["Enums"]["match_status"]
          trial_project_id: string
        }
        Update: {
          breakdown?: Json | null
          clinic_id?: string
          id?: string
          matched_at?: string
          overall_score?: number
          status?: Database["public"]["Enums"]["match_status"]
          trial_project_id?: string
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
            foreignKeyName: "match_results_trial_project_id_fkey"
            columns: ["trial_project_id"]
            isOneToOne: false
            referencedRelation: "trial_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      partnership_inquiries: {
        Row: {
          created_at: string
          decline_reason: string | null
          id: string
          match_result_id: string
          message: string
          notes: string | null
          responded_at: string | null
          response_message: string | null
          sender_user_id: string
          status: Database["public"]["Enums"]["inquiry_status"]
        }
        Insert: {
          created_at?: string
          decline_reason?: string | null
          id?: string
          match_result_id: string
          message: string
          notes?: string | null
          responded_at?: string | null
          response_message?: string | null
          sender_user_id: string
          status?: Database["public"]["Enums"]["inquiry_status"]
        }
        Update: {
          created_at?: string
          decline_reason?: string | null
          id?: string
          match_result_id?: string
          message?: string
          notes?: string | null
          responded_at?: string | null
          response_message?: string | null
          sender_user_id?: string
          status?: Database["public"]["Enums"]["inquiry_status"]
        }
        Relationships: [
          {
            foreignKeyName: "partnership_inquiries_match_result_id_fkey"
            columns: ["match_result_id"]
            isOneToOne: false
            referencedRelation: "match_results"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string
          id: string
          last_name: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          first_name: string
          id: string
          last_name: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      therapeutic_areas: {
        Row: {
          description: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
        }
        Update: {
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
          geographic_preference: string | null
          id: string
          irb_type_preference: string | null
          molecule_type: Database["public"]["Enums"]["molecule_type"] | null
          phase: Database["public"]["Enums"]["trial_phase"] | null
          required_patient_count: number | null
          sponsor_user_id: string
          start_date: string | null
          status: Database["public"]["Enums"]["trial_status"]
          sub_indication: string | null
          target_enrollment_rate_per_month: number | null
          therapeutic_area_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          geographic_preference?: string | null
          id?: string
          irb_type_preference?: string | null
          molecule_type?: Database["public"]["Enums"]["molecule_type"] | null
          phase?: Database["public"]["Enums"]["trial_phase"] | null
          required_patient_count?: number | null
          sponsor_user_id: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["trial_status"]
          sub_indication?: string | null
          target_enrollment_rate_per_month?: number | null
          therapeutic_area_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          geographic_preference?: string | null
          id?: string
          irb_type_preference?: string | null
          molecule_type?: Database["public"]["Enums"]["molecule_type"] | null
          phase?: Database["public"]["Enums"]["trial_phase"] | null
          required_patient_count?: number | null
          sponsor_user_id?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["trial_status"]
          sub_indication?: string | null
          target_enrollment_rate_per_month?: number | null
          therapeutic_area_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trial_projects_therapeutic_area_id_fkey"
            columns: ["therapeutic_area_id"]
            isOneToOne: false
            referencedRelation: "therapeutic_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      trial_requirements: {
        Row: {
          created_at: string
          description: string
          id: string
          priority: Database["public"]["Enums"]["requirement_priority"]
          requirement_type: Database["public"]["Enums"]["requirement_type"]
          trial_project_id: string
          value: string | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          priority?: Database["public"]["Enums"]["requirement_priority"]
          requirement_type: Database["public"]["Enums"]["requirement_type"]
          trial_project_id: string
          value?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          priority?: Database["public"]["Enums"]["requirement_priority"]
          requirement_type?: Database["public"]["Enums"]["requirement_type"]
          trial_project_id?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trial_requirements_trial_project_id_fkey"
            columns: ["trial_project_id"]
            isOneToOne: false
            referencedRelation: "trial_projects"
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
      fda_inspection_outcome:
        | "no_action"
        | "voluntary_action"
        | "official_action"
        | "never_inspected"
      inquiry_status: "pending" | "accepted" | "declined"
      match_status: "pending" | "inquiry_sent" | "accepted" | "declined"
      molecule_type:
        | "small_molecule"
        | "biologic"
        | "cell_therapy"
        | "gene_therapy"
        | "vaccine"
        | "device"
      requirement_priority: "required" | "preferred" | "nice_to_have"
      requirement_type:
        | "equipment"
        | "certification"
        | "specialization"
        | "capacity"
        | "phase_experience"
        | "molecule_experience"
      site_type:
        | "academic_medical_center"
        | "community_hospital"
        | "dedicated_research"
        | "private_practice"
        | "va_medical_center"
      trial_phase: "I" | "Ia" | "Ib" | "II" | "IIa" | "IIb" | "III" | "IV"
      trial_status: "draft" | "searching" | "matched" | "closed"
      user_role: "sponsor" | "clinic_admin"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      fda_inspection_outcome: [
        "no_action",
        "voluntary_action",
        "official_action",
        "never_inspected",
      ],
      inquiry_status: ["pending", "accepted", "declined"],
      match_status: ["pending", "inquiry_sent", "accepted", "declined"],
      molecule_type: [
        "small_molecule",
        "biologic",
        "cell_therapy",
        "gene_therapy",
        "vaccine",
        "device",
      ],
      requirement_priority: ["required", "preferred", "nice_to_have"],
      requirement_type: [
        "equipment",
        "certification",
        "specialization",
        "capacity",
        "phase_experience",
        "molecule_experience",
      ],
      site_type: [
        "academic_medical_center",
        "community_hospital",
        "dedicated_research",
        "private_practice",
        "va_medical_center",
      ],
      trial_phase: ["I", "Ia", "Ib", "II", "IIa", "IIb", "III", "IV"],
      trial_status: ["draft", "searching", "matched", "closed"],
      user_role: ["sponsor", "clinic_admin"],
    },
  },
} as const

