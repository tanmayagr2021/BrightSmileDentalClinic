-- ai_chat_logs was defined alongside medical_histories in 20260630000001 but
-- never created remotely (that migration was applied to prod out-of-band and
-- only medical_histories landed). Add it here, idempotently.
CREATE TABLE IF NOT EXISTS public.ai_chat_logs (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id  text        NOT NULL,
    role        text        NOT NULL CHECK (role IN ('user', 'assistant')),
    content     text        NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_ai_chat_logs_session_id  ON public.ai_chat_logs (session_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_logs_created_at  ON public.ai_chat_logs (created_at DESC);

COMMENT ON TABLE public.ai_chat_logs IS 'Bright AI conversation log for analytics. No PII stored beyond session scope.';

ALTER TABLE public.ai_chat_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_ai_chat_logs" ON public.ai_chat_logs;
CREATE POLICY "public_insert_ai_chat_logs"
    ON public.ai_chat_logs FOR INSERT
    WITH CHECK (true);
