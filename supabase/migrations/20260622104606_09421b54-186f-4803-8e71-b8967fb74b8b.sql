-- Remove overly permissive public SELECT policies on PII tables
DROP POLICY IF EXISTS "anyone reads citizens" ON public.citizens;
DROP POLICY IF EXISTS "anyone reads own response by code" ON public.survey_responses;
DROP POLICY IF EXISTS "anyone reads answers" ON public.survey_answers;

-- Revoke anon SELECT (anon retains INSERT via existing policies + table grants)
REVOKE SELECT ON public.citizens FROM anon, authenticated;
REVOKE SELECT ON public.survey_responses FROM anon, authenticated;
REVOKE SELECT ON public.survey_answers FROM anon, authenticated;

-- Ensure service_role retains full access for trusted server-side reads
GRANT ALL ON public.citizens TO service_role;
GRANT ALL ON public.survey_responses TO service_role;
GRANT ALL ON public.survey_answers TO service_role;
