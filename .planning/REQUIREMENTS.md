# TrialMatch MVP Requirements

## R1: Domain Model
- **R1.1** Define `Clinic` entity: name, city, address, description, contactEmail, contactPhone, website
- **R1.2** Define `ClinicSpecialization` entity linking clinics to therapeutic areas they handle (oncology, cardiology, neurology, etc.)
- **R1.3** Define `Equipment` entity linked to a clinic: equipmentType (enum or catalog), name, quantity, isAvailable
- **R1.4** Define `ClinicAvailability` entity: clinic reference, availableFrom, availableTo, maxConcurrentTrials, currentTrialCount
- **R1.5** Define `TrialProject` entity: title, description, therapeuticArea, phase (Phase1-Phase4), sponsorOrganization, requiredPatientCount, startDate, endDate, geographicPreference (city/region text), status (Draft/Searching/Matched/InProgress/Completed)
- **R1.6** Define `TrialRequirement` entity linked to a trial project: requirementType (Equipment/Certification/Specialization/Capacity), description, value, priority (Required/Preferred/NiceToHave)
- **R1.7** Define `MatchResult` entity: trialProjectId, clinicId, overallScore (0-100), breakdown (JSON or related scores), matchedAt, status (Pending/Reviewed/InquirySent/Accepted/Declined)
- **R1.8** Define `PartnershipInquiry` entity: matchResultId, senderUserId, message, status (Pending/Accepted/Declined), responseMessage, createdAt, respondedAt
- **R1.9** Define `ContactInquiry` entity for non-logged-in visitors: name, email, organizationType (Clinic/Sponsor/Other), message, createdAt
- **R1.10** Define `TherapeuticArea` catalog entity: name, description (used by both clinics and trial projects)
- **R1.11** Define `Certification` entity linked to a clinic: certificationName, issuedBy, validUntil (e.g., GCP, ISO, ethics board approval)

## R2: Seed Data
- **R2.1** Seed 10-15 clinics across Bulgarian cities (Sofia, Plovdiv, Varna, Burgas, Stara Zagora) with varied specializations and equipment
- **R2.2** Seed a therapeutic area catalog (~15 areas: Oncology, Cardiology, Neurology, Endocrinology, Pulmonology, Rheumatology, Gastroenterology, Dermatology, Psychiatry, Ophthalmology, Immunology, Infectious Disease, Orthopedics, Hematology, Nephrology)
- **R2.3** Seed equipment types: MRI, CT Scanner, PET Scanner, Ultrasound, ECG, Spirometer, Lab (basic), Lab (advanced), Biobank Storage, Patient Monitoring System, Infusion Pump, etc.
- **R2.4** Seed 3-5 sample trial projects with varied requirements to demonstrate matching
- **R2.5** Seed 2-3 sponsor/CRO accounts and 3-4 clinic admin accounts for demo
- **R2.6** Seed certifications for clinics (GCP, ISO 9001, local ethics board approval)

## R3: Clinic Profile Management
- **R3.1** Clinic admin can create/update their clinic profile
- **R3.2** Clinic admin can manage equipment inventory (add/remove/update availability)
- **R3.3** Clinic admin can set specializations (multi-select from therapeutic area catalog)
- **R3.4** Clinic admin can manage certifications
- **R3.5** Clinic admin can set availability windows and capacity

## R4: Trial Project Management
- **R4.1** Sponsor/CRO can create a trial project with basic info (title, description, therapeutic area, phase, timeline, patient count, geographic preference)
- **R4.2** Sponsor/CRO can add requirements to a trial project (equipment, certifications, specializations, capacity)
- **R4.3** Each requirement has a priority level: Required, Preferred, NiceToHave
- **R4.4** Sponsor/CRO can view and edit their trial projects

## R5: Matching Algorithm
- **R5.1** Rule-based weighted scoring algorithm that matches a trial project to registered clinics
- **R5.2** Scoring dimensions: therapeutic area match, equipment availability, certification compliance, capacity/availability, geographic proximity (city match), past experience (specialization count)
- **R5.3** Required criteria are hard filters -- clinic is excluded if any Required criterion is unmet
- **R5.4** Preferred and NiceToHave criteria contribute to the score with different weights
- **R5.5** Results are ranked by overall score (0-100) with per-dimension breakdown
- **R5.6** Match results are persisted and viewable by the sponsor/CRO

## R6: Partnership Inquiries
- **R6.1** Sponsor/CRO can send a partnership inquiry to a matched clinic from the match results page
- **R6.2** Inquiry includes a message from the sponsor
- **R6.3** Clinic admin sees incoming inquiries in their inbox
- **R6.4** Clinic admin can accept (with optional message) or decline (with reason)
- **R6.5** Sponsor/CRO can track inquiry status on their trial project page

## R7: Contact Form (Visitors)
- **R7.1** Non-logged-in visitors can submit a contact form (name, email, organization type, message)
- **R7.2** Stored as ContactInquiry -- no status tracking, no login required
- **R7.3** Confirmation shown after submission

## R8: TypeScript Types
- **R8.1** Generate Supabase TypeScript types after schema is finalized: `npx supabase gen types typescript --local > web/types/supabase.ts`
- **R8.2** Define local TypeScript types in `web/types/` for any non-database shapes (e.g. match scoring breakdown, API request/response bodies)
- **R8.3** All data access goes through the Supabase client -- no custom API wrappers or service layers needed

## R9: Roles & Auth Updates
- **R9.1** UserRole enum: Patient removed, add Sponsor and ClinicAdmin roles
- **R9.2** Role is selected at registration (Sponsor or ClinicAdmin)
- **R9.3** Role-based route protection on frontend and backend
