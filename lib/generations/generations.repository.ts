import { prisma } from "../db/client.js";
import type { GenerationOperation } from "./generations.types.js";

export async function createGenerationRequest(params: {
  userId: string;
  operation: GenerationOperation;
  input: unknown;
  idempotencyKey?: string;
  creditReservationId?: string;
}) {
  return prisma.generationRequest.create({
    data: {
      userId: params.userId,
      operation: params.operation,
      status: "CREATED",
      input: params.input as any,
      idempotencyKey: params.idempotencyKey,
      creditReservationId: params.creditReservationId,
    },
  });
}

export async function markGenerationRequestStatus(
  generationRequestId: string,
  status:
    | "CREATED"
    | "QUEUED"
    | "RUNNING"
    | "SUCCEEDED"
    | "FAILED"
    | "CANCELLED"
) {
  return prisma.generationRequest.update({
    where: { id: generationRequestId },
    data: { status },
  });
}

export async function createGenerationJob(params: {
  generationRequestId: string;
  provider: string;
  externalId?: string;
  attempt?: number;
}) {
  return prisma.generationJob.create({
    data: {
      generationRequestId: params.generationRequestId,
      provider: params.provider,
      externalId: params.externalId,
      status: "QUEUED",
      attempt: params.attempt ?? 1,
    },
  });
}

export async function updateGenerationJob(params: {
  jobId: string;
  status?: "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELLED";
  startedAt?: Date | null;
  finishedAt?: Date | null;
  lastHeartbeatAt?: Date | null;
  error?: unknown;
  metrics?: unknown;
}) {
  return prisma.generationJob.update({
    where: { id: params.jobId },
    data: {
      ...(params.status && { status: params.status }),
      ...(params.startedAt !== undefined && { startedAt: params.startedAt }),
      ...(params.finishedAt !== undefined && { finishedAt: params.finishedAt }),
      ...(params.lastHeartbeatAt !== undefined && {
        lastHeartbeatAt: params.lastHeartbeatAt,
      }),
      ...(params.error !== undefined && { error: params.error as any }),
      ...(params.metrics !== undefined && { metrics: params.metrics as any }),
    },
  });
}

export async function createGenerationArtifact(params: {
  generationRequestId: string;
  generationJobId?: string;
  kind: "image" | "html" | "css" | "json" | "zip" | "single_file_html";
  url?: string;
  data?: unknown;
  metadata?: unknown;
}) {
  return prisma.generationArtifact.create({
    data: {
      generationRequestId: params.generationRequestId,
      generationJobId: params.generationJobId,
      kind: params.kind,
      url: params.url,
      data: params.data as any,
      metadata: params.metadata as any,
    },
  });
}

