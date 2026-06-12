
-- Surveys
CREATE TABLE public.surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  supported_languages TEXT[] NOT NULL DEFAULT ARRAY['en','hi','as','bn','brx'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Questions
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL DEFAULT 'single', -- single | rating | text
  text JSONB NOT NULL, -- {en: "...", hi: "..."}
  display_order INT NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT true,
  allow_other BOOLEAN NOT NULL DEFAULT false,
  allow_comment BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_questions_survey ON public.questions(survey_id, display_order);

-- Options
CREATE TABLE public.question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  option_code TEXT NOT NULL,
  label JSONB NOT NULL,
  display_order INT NOT NULL,
  is_other BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_options_question ON public.question_options(question_id, display_order);

-- Citizens
CREATE TABLE public.citizens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  age INT,
  gender TEXT,
  district TEXT,
  profession TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Responses
CREATE TABLE public.survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  citizen_id UUID NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  mobile TEXT NOT NULL,
  selected_language TEXT NOT NULL DEFAULT 'en',
  response_code TEXT NOT NULL UNIQUE,
  idempotency_key TEXT UNIQUE,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(survey_id, mobile)
);
CREATE INDEX idx_responses_survey ON public.survey_responses(survey_id);

-- Answers
CREATE TABLE public.survey_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID NOT NULL REFERENCES public.survey_responses(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_option_id UUID REFERENCES public.question_options(id),
  rating_value INT,
  other_text TEXT,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_answers_response ON public.survey_answers(response_id);
CREATE INDEX idx_answers_question ON public.survey_answers(question_id);

-- Grants
GRANT SELECT ON public.surveys TO anon, authenticated;
GRANT SELECT ON public.questions TO anon, authenticated;
GRANT SELECT ON public.question_options TO anon, authenticated;
GRANT INSERT ON public.citizens TO anon, authenticated;
GRANT INSERT, SELECT ON public.survey_responses TO anon, authenticated;
GRANT INSERT ON public.survey_answers TO anon, authenticated;
GRANT ALL ON public.surveys, public.questions, public.question_options,
  public.citizens, public.survey_responses, public.survey_answers TO service_role;

-- RLS
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone reads published surveys" ON public.surveys FOR SELECT USING (status = 'published');
CREATE POLICY "anyone reads questions" ON public.questions FOR SELECT USING (true);
CREATE POLICY "anyone reads options" ON public.question_options FOR SELECT USING (true);
CREATE POLICY "anyone inserts citizen" ON public.citizens FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone inserts response" ON public.survey_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone reads own response by code" ON public.survey_responses FOR SELECT USING (true);
CREATE POLICY "anyone inserts answer" ON public.survey_answers FOR INSERT WITH CHECK (true);

-- Seed survey
INSERT INTO public.surveys (id, title, subtitle, description)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Viksit Assam 2047',
  'Citizen Feedback Portal',
  'Share Your Vision for Viksit Assam 2047. Your feedback will help in building a developed, progressive, and prosperous Assam.'
);

-- Seed 18 questions
DO $$
DECLARE
  sid UUID := '00000000-0000-0000-0000-000000000001';
  qid UUID;
  qs JSONB := '[
    {"t":"single","q":{"en":"Which sector should receive the highest priority for development in Assam?","hi":"असम में विकास के लिए किस क्षेत्र को सर्वोच्च प्राथमिकता मिलनी चाहिए?","as":"অসমত উন্নয়নৰ বাবে কোনটো খণ্ডক সৰ্বাধিক অগ্ৰাধিকাৰ দিব লাগে?"},"opts":["Agriculture","Education","Healthcare","Tourism","Infrastructure"],"other":true},
    {"t":"rating","q":{"en":"Rate the current condition of road infrastructure in your area.","hi":"अपने क्षेत्र में सड़क बुनियादी ढांचे की वर्तमान स्थिति का मूल्यांकन करें।","as":"আপোনাৰ অঞ্চলৰ ৰাস্তা আন্তঃগাঁথনিৰ বৰ্তমান অৱস্থা মূল্যায়ন কৰক।"}},
    {"t":"single","q":{"en":"Are you satisfied with the availability of quality healthcare services?","hi":"क्या आप गुणवत्तापूर्ण स्वास्थ्य सेवाओं की उपलब्धता से संतुष्ट हैं?","as":"আপুনি মানসন্পন্ন স্বাস্থ্যসেৱাৰ উপলব্ধতাৰ প্ৰতি সন্তুষ্ট নেকি?"},"opts":["Yes","No","Somewhat"],"comment":true},
    {"t":"single","q":{"en":"How accessible is quality school education in your district?","hi":"आपके जिले में गुणवत्तापूर्ण स्कूली शिक्षा कितनी सुलभ है?"},"opts":["Very accessible","Accessible","Limited","Not accessible"]},
    {"t":"rating","q":{"en":"Rate the cleanliness and waste management in your locality.","hi":"अपने इलाके में स्वच्छता और कचरा प्रबंधन का मूल्यांकन करें।"}},
    {"t":"single","q":{"en":"Which area needs the most improvement for employment generation?","hi":"रोजगार सृजन के लिए किस क्षेत्र में सबसे अधिक सुधार की आवश्यकता है?"},"opts":["Skill development","Industries","Startups","Agro-based jobs","Government jobs"],"other":true},
    {"t":"single","q":{"en":"Is electricity supply reliable in your area?","hi":"क्या आपके क्षेत्र में बिजली की आपूर्ति विश्वसनीय है?"},"opts":["Always reliable","Mostly reliable","Frequent cuts","Very poor"]},
    {"t":"single","q":{"en":"How safe do you feel in your city or village?","hi":"आप अपने शहर या गांव में कितना सुरक्षित महसूस करते हैं?"},"opts":["Very safe","Safe","Unsafe","Very unsafe"]},
    {"t":"rating","q":{"en":"Rate the quality of public transportation in your area.","hi":"अपने क्षेत्र में सार्वजनिक परिवहन की गुणवत्ता का मूल्यांकन करें।"}},
    {"t":"single","q":{"en":"How would you rate the government''s initiatives for skill development?","hi":"कौशल विकास के लिए सरकार की पहल का आप कैसे मूल्यांकन करेंगे?"},"opts":["Excellent","Good","Average","Poor"],"comment":true},
    {"t":"single","q":{"en":"Should the government focus more on digital services for citizens?","hi":"क्या सरकार को नागरिकों के लिए डिजिटल सेवाओं पर अधिक ध्यान देना चाहिए?"},"opts":["Strongly agree","Agree","Disagree","Strongly disagree"]},
    {"t":"single","q":{"en":"Which environmental issue concerns you the most?","hi":"कौन सी पर्यावरणीय समस्या आपको सबसे अधिक चिंतित करती है?"},"opts":["Flooding","Deforestation","Air pollution","Water pollution"],"other":true},
    {"t":"single","q":{"en":"How effective are flood relief and rehabilitation measures in Assam?","hi":"असम में बाढ़ राहत और पुनर्वास उपाय कितने प्रभावी हैं?"},"opts":["Very effective","Somewhat effective","Not effective"]},
    {"t":"rating","q":{"en":"Rate the availability of clean drinking water in your area.","hi":"अपने क्षेत्र में स्वच्छ पेयजल की उपलब्धता का मूल्यांकन करें।"}},
    {"t":"single","q":{"en":"How well are local cultural and tourism initiatives promoted?","hi":"स्थानीय सांस्कृतिक और पर्यटन पहलों को कितनी अच्छी तरह बढ़ावा दिया जाता है?"},"opts":["Very well","Well","Average","Poorly"]},
    {"t":"single","q":{"en":"Which group needs the most government support?","hi":"किस समूह को सरकार से सबसे अधिक सहयोग की आवश्यकता है?"},"opts":["Farmers","Women","Youth","Senior citizens","Differently-abled"],"other":true},
    {"t":"single","q":{"en":"Are you aware of major government welfare schemes?","hi":"क्या आप प्रमुख सरकारी कल्याण योजनाओं से अवगत हैं?"},"opts":["Fully aware","Partially aware","Not aware"]},
    {"t":"text","q":{"en":"Any other suggestions for Viksit Assam 2047?","hi":"विकसित असम 2047 के लिए कोई अन्य सुझाव?","as":"বিকশিত অসম ২০৪৭ৰ বাবে আন কোনো পৰামৰ্শ?"}}
  ]'::jsonb;
  q JSONB;
  o TEXT;
  i INT := 0;
  j INT;
BEGIN
  FOR q IN SELECT * FROM jsonb_array_elements(qs)
  LOOP
    i := i + 1;
    INSERT INTO public.questions (survey_id, question_type, text, display_order, allow_other, allow_comment, is_required)
    VALUES (
      sid,
      q->>'t',
      q->'q',
      i,
      COALESCE((q->>'other')::boolean, false),
      COALESCE((q->>'comment')::boolean, false),
      i < 18
    ) RETURNING id INTO qid;

    IF q->>'t' = 'single' THEN
      j := 0;
      FOR o IN SELECT jsonb_array_elements_text(q->'opts')
      LOOP
        j := j + 1;
        INSERT INTO public.question_options (question_id, option_code, label, display_order)
        VALUES (qid, chr(64+j), jsonb_build_object('en', o), j);
      END LOOP;
      IF COALESCE((q->>'other')::boolean, false) THEN
        j := j + 1;
        INSERT INTO public.question_options (question_id, option_code, label, display_order, is_other)
        VALUES (qid, 'OTHER', jsonb_build_object('en','Other'), j, true);
      END IF;
    END IF;
  END LOOP;
END $$;
