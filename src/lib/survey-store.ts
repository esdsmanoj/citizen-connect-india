// Local-storage backed draft store for in-progress surveys.
export type LangCode = "en" | "hi" | "as" | "bn" | "brx";

export type CitizenProfile = {
  name: string;
  mobile: string;
  age: string;
  gender: string;
  district: string;
  profession: string;
};

export type AnswerValue = {
  selectedOptionId?: string | null;
  rating?: number | null;
  otherText?: string;
  comment?: string;
  textAnswer?: string;
  updatedAt: string;
};

export type SurveyDraft = {
  surveyId: string;
  language: LangCode;
  profile: CitizenProfile;
  answers: Record<string, AnswerValue>;
  currentIndex: number;
  status: "draft" | "submitted";
  lastUpdated: string;
};

const KEY_PREFIX = "va2047_draft";
export const SURVEY_ID = "00000000-0000-0000-0000-000000000001";

export function emptyProfile(): CitizenProfile {
  return { name: "", mobile: "", age: "", gender: "", district: "", profession: "" };
}

export function emptyDraft(): SurveyDraft {
  return {
    surveyId: SURVEY_ID,
    language: "en",
    profile: emptyProfile(),
    answers: {},
    currentIndex: 0,
    status: "draft",
    lastUpdated: new Date().toISOString(),
  };
}

function key(mobile?: string) {
  return `${KEY_PREFIX}_${SURVEY_ID}_${mobile || "anon"}`;
}

export function loadDraft(mobile?: string): SurveyDraft | null {
  if (typeof window === "undefined") return null;
  try {
    // try keyed by mobile first, fall back to anon draft
    const candidates = [key(mobile), key()];
    for (const k of candidates) {
      const raw = localStorage.getItem(k);
      if (raw) return JSON.parse(raw) as SurveyDraft;
    }
  } catch {}
  return null;
}

export function saveDraft(draft: SurveyDraft) {
  if (typeof window === "undefined") return;
  draft.lastUpdated = new Date().toISOString();
  const k = key(draft.profile.mobile);
  localStorage.setItem(k, JSON.stringify(draft));
  // also keep an anon copy so user can resume even before typing mobile fully
  localStorage.setItem(key(), JSON.stringify(draft));
}

export function clearDraft(mobile?: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key(mobile));
  localStorage.removeItem(key());
}

export function genIdempotencyKey(profile: CitizenProfile) {
  return `${SURVEY_ID}_${profile.mobile}_${Date.now()}`;
}

export const LANGUAGES: { code: LangCode; native: string; english: string }[] = [
  { code: "en", native: "English", english: "English" },
  { code: "as", native: "অসমীয়া", english: "Assamese" },
  { code: "hi", native: "हिन्दी", english: "Hindi" },
  { code: "bn", native: "বাংলা", english: "Bengali" },
  { code: "brx", native: "बड़ो", english: "Bodo" },
];

export const DISTRICTS = [
  "Kamrup (Metro)", "Kamrup", "Dibrugarh", "Jorhat", "Sivasagar", "Tinsukia",
  "Nagaon", "Sonitpur", "Barpeta", "Cachar", "Karimganj", "Hailakandi",
  "Dhubri", "Goalpara", "Golaghat", "Lakhimpur", "Morigaon", "Nalbari",
  "Bongaigaon", "Darrang", "Karbi Anglong", "Dima Hasao", "Baksa", "Chirang",
  "Udalguri", "Kokrajhar", "Dhemaji", "Charaideo", "Hojai", "Majuli",
  "South Salmara-Mankachar", "West Karbi Anglong", "Bajali", "Tamulpur",
];

export const PROFESSIONS = [
  "Student", "Farmer", "Government Employee", "Private Employee",
  "Business Owner", "Self-Employed", "Homemaker", "Retired", "Unemployed", "Other",
];

export const GENDERS = ["Male", "Female", "Other"];

// UI strings (minimal localization for chrome; question text comes from DB)
export const UI: Record<LangCode, Record<string, string>> = {
  en: { participate: "Participate Now", continue: "Continue", next: "Next", back: "Back",
    selectLanguage: "Select Language", tellAbout: "Tell Us About Yourself",
    startSurvey: "Start Survey", review: "Review Your Responses",
    submit: "Submit Feedback", thanks: "Thank You!", viewCert: "View Certificate",
    goHome: "Go to Home", welcome: "Welcome!", optional: "Optional" },
  hi: { participate: "अभी भाग लें", continue: "जारी रखें", next: "अगला", back: "पीछे",
    selectLanguage: "भाषा चुनें", tellAbout: "अपने बारे में बताएं",
    startSurvey: "सर्वेक्षण शुरू करें", review: "अपने उत्तर देखें",
    submit: "प्रतिक्रिया जमा करें", thanks: "धन्यवाद!", viewCert: "प्रमाणपत्र देखें",
    goHome: "होम पर जाएँ", welcome: "स्वागत है!", optional: "वैकल्पिक" },
  as: { participate: "এতিয়াই অংশ লওঁক", continue: "আগবাঢ়ক", next: "পৰৱৰ্তী", back: "পিছলৈ",
    selectLanguage: "ভাষা বাছনি কৰক", tellAbout: "নিজৰ বিষয়ে কওঁক",
    startSurvey: "সমীক্ষা আৰম্ভ কৰক", review: "আপোনাৰ উত্তৰ চাওঁক",
    submit: "মতামত দাখিল কৰক", thanks: "ধন্যবাদ!", viewCert: "প্ৰমাণপত্ৰ চাওঁক",
    goHome: "ঘৰলৈ যাওঁক", welcome: "স্বাগতম!", optional: "ঐচ্ছিক" },
  bn: { participate: "এখনই অংশ নিন", continue: "এগিয়ে যান", next: "পরবর্তী", back: "পিছনে",
    selectLanguage: "ভাষা নির্বাচন করুন", tellAbout: "নিজের সম্পর্কে বলুন",
    startSurvey: "জরিপ শুরু করুন", review: "আপনার উত্তর দেখুন",
    submit: "প্রতিক্রিয়া জমা দিন", thanks: "ধন্যবাদ!", viewCert: "সার্টিফিকেট দেখুন",
    goHome: "হোমে যান", welcome: "স্বাগতম!", optional: "ঐচ্ছিক" },
  brx: { participate: "दानै लाजाब", continue: "थांनाय", next: "उनथिं", back: "फिन",
    selectLanguage: "राव सायख", tellAbout: "निजोरनि सोमोन्दै बुं",
    startSurvey: "जरीप जागायनाय", review: "नोंथांनि फिननाय नाय",
    submit: "बिजिरनाय गथायनाय", thanks: "साबायख्रौ!", viewCert: "बिजाब नाय",
    goHome: "नो थां", welcome: "स्वागतम!", optional: "ऐच्छिक" },
};

export function t(lang: LangCode, key: string): string {
  return UI[lang]?.[key] ?? UI.en[key] ?? key;
}

export function localized(field: Record<string, string> | null | undefined, lang: LangCode): string {
  if (!field) return "";
  return field[lang] || field.en || Object.values(field)[0] || "";
}
