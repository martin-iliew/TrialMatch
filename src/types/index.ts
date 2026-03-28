import type { Database } from './supabase'

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]

export type Clinic = Tables<'clinics'>
export type ClinicEquipment = Tables<'clinic_equipment'>
export type ClinicAvailability = Tables<'clinic_availability'>
export type Certification = Tables<'certifications'>
export type TrialProject = Tables<'trial_projects'>
export type ProjectRequirement = Tables<'project_requirements'>
export type MatchResult = Tables<'match_results'>
export type Inquiry = Tables<'inquiries'>
export type InquiryMessage = Tables<'inquiry_messages'>
export type TherapeuticArea = Tables<'therapeutic_areas'>
export type Profile = Tables<'profiles'>
export type Organization = Tables<'organizations'>

export type UserRole = Enums<'user_role'>
export type OrganizationType = Enums<'organization_type'>
export type ClinicStatus = Enums<'clinic_status'>
export type ProjectStatus = Enums<'project_status'>
export type MatchStatus = Enums<'match_status'>
export type InquiryStatus = Enums<'inquiry_status'>
export type RequirementType = Enums<'requirement_type'>
export type EquipmentCategory = Enums<'equipment_category'>
export type AvailabilityType = Enums<'availability_type'>
