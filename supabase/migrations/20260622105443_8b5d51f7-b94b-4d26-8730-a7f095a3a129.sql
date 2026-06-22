GRANT INSERT ON public.citizens TO anon, authenticated;
GRANT INSERT ON public.survey_responses TO anon, authenticated;
GRANT INSERT ON public.survey_answers TO anon, authenticated;
GRANT ALL ON public.citizens TO service_role;
GRANT ALL ON public.survey_responses TO service_role;
GRANT ALL ON public.survey_answers TO service_role;