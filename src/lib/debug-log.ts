const ENDPOINT = 'http://127.0.0.1:7299/ingest/9293efd6-de4c-469b-b99f-738ca26efee2';
const SESSION = '845b89';

export function debugLog(
  location: string,
  message: string,
  data: Record<string, unknown> = {},
  hypothesisId?: string,
  runId = 'uat',
) {
  if (__DEV__) {
    console.log(`[debug:${hypothesisId ?? '?'}] ${location} — ${message}`, data);
  }
  // #region agent log
  fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': SESSION,
    },
    body: JSON.stringify({
      sessionId: SESSION,
      runId,
      hypothesisId,
      location,
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
}
