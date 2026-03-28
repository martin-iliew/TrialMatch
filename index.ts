import type { Database } from './supabase'

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]

export type Clinic = Tables<'clinics'>
export type TrialProject = Tables<'trial_projects'>
export type TrialRequirement = Tables<'trial_requirements'>
export type MatchResult = Tables<'match_results'>
export type PartnershipInquiry = Tables<'partnership_inquiries'>
export type TherapeuticArea = Tables<'therapeutic_areas'>
export type Profile = Tables<'profiles'>

export type UserRole = Enums<'user_role'>
export type TrialPhase = Enums<'trial_phase'>
export type MoleculeType = Enums<'molecule_type'>
export type SiteType = Enums<'site_type'>
export type TrialStatus = Enums<'trial_status'>
export type InquiryStatus = Enums<'inquiry_status'>
export type MatchStatus = Enums<'match_status'>
export type RequirementPriority = Enums<'requirement_priority'>
export type RequirementType = Enums<'requirement_type'>
