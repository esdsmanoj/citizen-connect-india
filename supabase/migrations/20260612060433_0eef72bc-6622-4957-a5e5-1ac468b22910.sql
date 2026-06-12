GRANT SELECT ON public.citizens TO anon, authenticated;
GRANT SELECT ON public.survey_answers TO anon, authenticated;
CREATE POLICY "anyone reads citizens" ON public.citizens FOR SELECT USING (true);
CREATE POLICY "anyone reads answers" ON public.survey_answers FOR SELECT USING (true);