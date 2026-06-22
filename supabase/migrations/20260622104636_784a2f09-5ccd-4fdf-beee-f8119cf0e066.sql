-- Replace permissive WITH CHECK (true) policies with minimum-field validation
DROP POLICY IF EXISTS "anyone inserts citizen" ON public.citizens;
CREATE POLICY "anyone inserts citizen" ON public.citizens
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(btrim(name)) > 0
    AND length(btrim(mobile)) >= 10
  );

DROP POLICY IF EXISTS "anyone inserts response" ON public.survey_responses;
CREATE POLICY "anyone inserts response" ON public.survey_responses
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    survey_id IS NOT NULL
    AND citizen_id IS NOT NULL
    AND length(btrim(mobile)) >= 10
    AND length(btrim(response_code)) > 0
  );

DROP POLICY IF EXISTS "anyone inserts answer" ON public.survey_answers;
CREATE POLICY "anyone inserts answer" ON public.survey_answers
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    response_id IS NOT NULL
    AND question_id IS NOT NULL
  );
