export type GenerationOperation =
  | "generate_prompts"
  | "generate_batch"
  | "remove_background"
  | "package_result";

export type GenerationStatus =
  | "CREATED"
  | "QUEUED"
  | "RUNNING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELLED";

export type GenerationJobStatus =
  | "QUEUED"
  | "RUNNING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELLED";

export type GenerationArtifactKind =
  | "image"
  | "html"
  | "css"
  | "json"
  | "zip"
  | "single_file_html";

export interface CreateGenerationRequestInput {
  userId: string;
  operation: GenerationOperation;
  input: unknown;
  idempotencyKey?: string;
  creditReservationId?: string;
}

