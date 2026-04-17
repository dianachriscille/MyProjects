export enum Role { ADMIN = 'admin', REGISTRAR = 'registrar', FINANCE = 'finance' }
export enum EnrollmentStatus { DRAFT = 'draft', SUBMITTED = 'submitted', APPROVED = 'approved', REJECTED = 'rejected', ENROLLED = 'enrolled' }
export enum BillingStatus { UNPAID = 'unpaid', PARTIALLY_PAID = 'partially_paid', FULLY_PAID = 'fully_paid' }
export enum StudentStatus { APPLICANT = 'applicant', ENROLLED = 'enrolled', WITHDRAWN = 'withdrawn', GRADUATED = 'graduated' }
export const GRADE_LEVELS = ['K', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10', 'G11', 'G12'] as const;
export type GradeLevel = typeof GRADE_LEVELS[number];
