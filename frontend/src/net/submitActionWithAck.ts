import { apiClient } from '@/lib/apiClient';

export interface ActionPayload {
  matchId: string;
  uci: string;
  clientActionId?: string;
}

export interface ActionAckResult {
  ok: boolean;
  fen?: string;
  san?: string;
  error?: string;
}

/**
 * Submits a server-validated move to FastAPI with one automatic idempotent retry on transient network failure.
 */
export async function submitActionWithAck(payload: ActionPayload): Promise<ActionAckResult> {
  const attempt = async () => {
    const resp = await apiClient.post<{ fen: string; san: string }>(
      `/api/v1/matches/${payload.matchId}/move`,
      {
        uci: payload.uci,
        client_action_id: payload.clientActionId,
      }
    );
    return { ok: true, fen: resp.fen, san: resp.san };
  };

  try {
    return await attempt();
  } catch (firstErr: unknown) {
    // Retry once on transient network errors (not 4xx validation rejections)
    const status = (firstErr as { status?: number })?.status;
    if (status && status >= 400 && status < 500) {
      return {
        ok: false,
        error: firstErr instanceof Error ? firstErr.message : 'Move rejected by server.',
      };
    }
    try {
      return await attempt();
    } catch (retryErr: unknown) {
      return {
        ok: false,
        error: retryErr instanceof Error ? retryErr.message : 'Network error submitting move.',
      };
    }
  }
}
