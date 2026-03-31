export type CreditOperation =
  | "generate_batch"
  | "generate_prompts"
  | "remove_background"
  | "package_result";

export const OPERATION_COSTS: Record<CreditOperation, number> = {
  generate_batch: 10,
  generate_prompts: 2,
  remove_background: 5,
  package_result: 1,
};

export type ReservationStatus = "PENDING" | "FINALIZED" | "ROLLED_BACK";

export interface CreditBalance {
  id: string;
  userId: string;
  credits: number;
  updatedAt: Date;
}

export interface CreditReservation {
  id: string;
  userId: string;
  amount: number;
  status: ReservationStatus;
  createdAt: Date;
  expiresAt: Date;
  finalizedAt: Date | null;
}

export interface ReserveCreditsResult {
  reservationId: string;
}

export type CreditCostInput =
  | { batchSize?: number }
  | { imagesRequested?: number }
  | Record<string, unknown>
  | undefined;

export class InsufficientCreditsError extends Error {
  public readonly currentBalance: number;
  public readonly required: number;

  constructor(currentBalance: number, required: number) {
    super(
      `Insufficient credits: required ${required}, available ${currentBalance}`
    );
    this.name = "InsufficientCreditsError";
    this.currentBalance = currentBalance;
    this.required = required;
  }
}

export class ReservationNotFoundError extends Error {
  public readonly reservationId: string;

  constructor(reservationId: string) {
    super(`Credit reservation not found: ${reservationId}`);
    this.name = "ReservationNotFoundError";
    this.reservationId = reservationId;
  }
}

export class ReservationAlreadySettledError extends Error {
  public readonly reservationId: string;
  public readonly currentStatus: ReservationStatus;

  constructor(reservationId: string, currentStatus: ReservationStatus) {
    super(
      `Reservation ${reservationId} is already settled with status: ${currentStatus}`
    );
    this.name = "ReservationAlreadySettledError";
    this.reservationId = reservationId;
    this.currentStatus = currentStatus;
  }
}
