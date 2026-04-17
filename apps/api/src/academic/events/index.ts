export class EnrollmentApprovedEvent {
  constructor(
    public readonly enrollmentId: string,
    public readonly studentId: string,
    public readonly gradeLevel: string,
    public readonly schoolYearId: string,
  ) {}
}

export class StudentDeletedEvent {
  constructor(
    public readonly studentId: string,
    public readonly orgId: string,
    public readonly reason: string,
  ) {}
}
