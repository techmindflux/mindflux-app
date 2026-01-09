import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "hi";

interface Translations {
  // Home page
  welcome: string;
  helloGuest: string;
  yourSanctuary: string;
  whatsYourMindflux: string;
  discoverRoots: string;
  shareThought: string;
  listening: string;
  commonPatterns: string;
  discoverClarity: string;
  // Suggestions
  suggestion1: string;
  suggestion2: string;
  suggestion3: string;
  suggestion4: string;
  // Navigation
  navHome: string;
  navCheckIn: string;
  navReflect: string;
  navLumina: string;
  // App Guide
  askAnything: string;
  appGuide: string;
  askMeAnything: string;
  howCanIHelp: string;
  guideDescription: string;
  typeQuestion: string;
  whatCanIDo: string;
  howDoICheckIn: string;
  whoIsLumina: string;
  // Check-in page
  natureOfThoughts: string;
  tapResonates: string;
  helpsUnderstand: string;
  whatsMindDoing: string;
  selectAllApply: string;
  selectThoughtsAbove: string;
  thoughtsSelected: string;
  thinking: string;
  // Categories
  ruminating: string;
  ruminatingDesc: string;
  anxious: string;
  anxiousDesc: string;
  critical: string;
  criticalDesc: string;
  clear: string;
  clearDesc: string;
  // Thought bubbles - Ruminating
  replaying: string;
  regretting: string;
  dwelling: string;
  looping: string;
  rehashing: string;
  overanalyzing: string;
  wishing: string;
  blaming: string;
  secondGuessing: string;
  fixating: string;
  brooding: string;
  mulling: string;
  obsessing: string;
  haunted: string;
  stuck: string;
  // Thought bubbles - Anxious
  worrying: string;
  catastrophizing: string;
  whatIfs: string;
  spiraling: string;
  overthinking: string;
  fearing: string;
  anticipating: string;
  dreading: string;
  racing: string;
  scattered: string;
  restless: string;
  panicking: string;
  hypervigilant: string;
  projecting: string;
  doomScrolling: string;
  // Thought bubbles - Critical
  judging: string;
  comparing: string;
  criticizing: string;
  doubting: string;
  shaming: string;
  notEnough: string;
  failing: string;
  imposter: string;
  perfectionist: string;
  selfAttacking: string;
  belittling: string;
  harsh: string;
  unworthy: string;
  dismissive: string;
  inadequate: string;
  // Thought bubbles - Clear
  present: string;
  calm: string;
  focused: string;
  grounded: string;
  peaceful: string;
  accepting: string;
  curious: string;
  open: string;
  grateful: string;
  hopeful: string;
  content: string;
  balanced: string;
  centered: string;
  flowing: string;
  aware: string;
  // Common
  signOut: string;
  back: string;
  continue: string;
  // Context step
  addContext: string;
  whatWereDoing: string;
  whichActivity: string;
  whoWith: string;
  whereAreYou: string;
  howIntense: string;
  mild: string;
  moderate: string;
  strong: string;
  intense: string;
  reflectionPrompts: string;
  whatTriggered: string;
  whereInBody: string;
  whatDoYouNeed: string;
  familiarPattern: string;
  anythingElse: string;
  freeformPlaceholder: string;
  startSession: string;
}

const translations: Record<Language, Translations> = {
  en: {
    welcome: "Welcome",
    helloGuest: "Hello, Guest",
    yourSanctuary: "Your Sanctuary",
    whatsYourMindflux: "What's your MindFlux?",
    discoverRoots: "Discover Roots",
    shareThought: "Share a thought that's been weighing on you...",
    listening: "Listening... speak your thoughts",
    commonPatterns: "Common thought patterns",
    discoverClarity: "Let's discover the roots of your thoughts and find clarity together.",
    suggestion1: "I'm not good enough for this",
    suggestion2: "Everyone is judging me",
    suggestion3: "I'll never be successful",
    suggestion4: "Something bad is going to happen",
    signOut: "Sign out",
    back: "back",
    continue: "Continue",
    // Navigation
    navHome: "Home",
    navCheckIn: "Check-in",
    navReflect: "Reflect",
    navLumina: "Lumina AI",
    // App Guide
    askAnything: "Ask anything about MindFlux...",
    appGuide: "App Guide",
    askMeAnything: "Ask me anything about MindFlux",
    howCanIHelp: "How can I help?",
    guideDescription: "I can guide you through MindFlux's features and help you get started",
    typeQuestion: "Type your question...",
    whatCanIDo: "What can I do here?",
    howDoICheckIn: "How do I check in?",
    whoIsLumina: "Who is Lumina?",
    // Check-in
    natureOfThoughts: "What's the nature of your thoughts?",
    tapResonates: "Tap the one that resonates most",
    helpsUnderstand: "This helps us understand your thought patterns",
    whatsMindDoing: "What's your mind doing right now?",
    selectAllApply: "Select all that apply",
    selectThoughtsAbove: "Select thoughts above",
    thoughtsSelected: "thoughts selected",
    thinking: "thinking",
    // Categories
    ruminating: "Ruminating",
    ruminatingDesc: "Stuck in the past, replaying",
    anxious: "Anxious",
    anxiousDesc: "Worrying about what's next",
    critical: "Critical",
    criticalDesc: "Harsh inner voice, judging",
    clear: "Clear",
    clearDesc: "Present, calm, focused",
    // Thought bubbles - Ruminating
    replaying: "Replaying",
    regretting: "Regretting",
    dwelling: "Dwelling",
    looping: "Looping",
    rehashing: "Rehashing",
    overanalyzing: "Overanalyzing",
    wishing: "Wishing",
    blaming: "Blaming",
    secondGuessing: "Second-guessing",
    fixating: "Fixating",
    brooding: "Brooding",
    mulling: "Mulling",
    obsessing: "Obsessing",
    haunted: "Haunted",
    stuck: "Stuck",
    // Thought bubbles - Anxious
    worrying: "Worrying",
    catastrophizing: "Catastrophizing",
    whatIfs: "What-ifs",
    spiraling: "Spiraling",
    overthinking: "Overthinking",
    fearing: "Fearing",
    anticipating: "Anticipating",
    dreading: "Dreading",
    racing: "Racing",
    scattered: "Scattered",
    restless: "Restless",
    panicking: "Panicking",
    hypervigilant: "Hypervigilant",
    projecting: "Projecting",
    doomScrolling: "Doom-scrolling",
    // Thought bubbles - Critical
    judging: "Judging",
    comparing: "Comparing",
    criticizing: "Criticizing",
    doubting: "Doubting",
    shaming: "Shaming",
    notEnough: "Not enough",
    failing: "Failing",
    imposter: "Imposter",
    perfectionist: "Perfectionist",
    selfAttacking: "Self-attacking",
    belittling: "Belittling",
    harsh: "Harsh",
    unworthy: "Unworthy",
    dismissive: "Dismissive",
    inadequate: "Inadequate",
    // Thought bubbles - Clear
    present: "Present",
    calm: "Calm",
    focused: "Focused",
    grounded: "Grounded",
    peaceful: "Peaceful",
    accepting: "Accepting",
    curious: "Curious",
    open: "Open",
    grateful: "Grateful",
    hopeful: "Hopeful",
    content: "Content",
    balanced: "Balanced",
    centered: "Centered",
    flowing: "Flowing",
    aware: "Aware",
    // Context step
    addContext: "Add Context",
    whatWereDoing: "What were you doing?",
    whichActivity: "Which activity?",
    whoWith: "Who are you with?",
    whereAreYou: "Where are you?",
    howIntense: "How intense is this feeling?",
    mild: "Mild",
    moderate: "Moderate",
    strong: "Strong",
    intense: "Intense",
    reflectionPrompts: "Reflection Prompts",
    whatTriggered: "What triggered this thought?",
    whereInBody: "Where do I feel it in my body?",
    whatDoYouNeed: "What do I need right now?",
    familiarPattern: "Is this a familiar pattern?",
    anythingElse: "Anything else on your mind?",
    freeformPlaceholder: "Write freely here...",
    startSession: "Start Coaching Session",
  },
  hi: {
    welcome: "स्वागत है",
    helloGuest: "नमस्ते, अतिथि",
    yourSanctuary: "आपका आश्रय",
    whatsYourMindflux: "आपका MindFlux क्या है?",
    discoverRoots: "जड़ खोजें",
    shareThought: "कोई विचार साझा करें जो आपको परेशान कर रहा है...",
    listening: "सुन रहे हैं... अपने विचार बोलें",
    commonPatterns: "सामान्य विचार पैटर्न",
    discoverClarity: "आइए अपने विचारों की जड़ों को खोजें और मिलकर स्पष्टता पाएं।",
    suggestion1: "मैं इसके लिए काफी अच्छा नहीं हूं",
    suggestion2: "हर कोई मुझे जज कर रहा है",
    suggestion3: "मैं कभी सफल नहीं होऊंगा",
    suggestion4: "कुछ बुरा होने वाला है",
    signOut: "साइन आउट",
    back: "वापस",
    continue: "जारी रखें",
    // Navigation
    navHome: "होम",
    navCheckIn: "चेक-इन",
    navReflect: "प्रतिबिंब",
    navLumina: "लुमिना AI",
    // App Guide
    askAnything: "MindFlux के बारे में कुछ भी पूछें...",
    appGuide: "ऐप गाइड",
    askMeAnything: "MindFlux के बारे में मुझसे कुछ भी पूछें",
    howCanIHelp: "मैं कैसे मदद कर सकता हूं?",
    guideDescription: "मैं आपको MindFlux की सुविधाओं के बारे में बता सकता हूं",
    typeQuestion: "अपना प्रश्न लिखें...",
    whatCanIDo: "मैं यहां क्या कर सकता हूं?",
    howDoICheckIn: "चेक-इन कैसे करें?",
    whoIsLumina: "लुमिना कौन है?",
    // Check-in
    natureOfThoughts: "आपके विचारों की प्रकृति क्या है?",
    tapResonates: "जो सबसे ज्यादा गूंजता है उसे चुनें",
    helpsUnderstand: "यह हमें आपके विचार पैटर्न को समझने में मदद करता है",
    whatsMindDoing: "आपका मन अभी क्या कर रहा है?",
    selectAllApply: "सभी लागू होने वाले चुनें",
    selectThoughtsAbove: "ऊपर विचार चुनें",
    thoughtsSelected: "विचार चुने गए",
    thinking: "सोच",
    // Categories
    ruminating: "रूमिनेटिंग",
    ruminatingDesc: "अतीत में फंसे, दोहराते हुए",
    anxious: "चिंतित",
    anxiousDesc: "आगे की चिंता",
    critical: "आलोचनात्मक",
    criticalDesc: "कठोर आंतरिक आवाज़",
    clear: "स्पष्ट",
    clearDesc: "वर्तमान, शांत, केंद्रित",
    // Thought bubbles - Ruminating
    replaying: "दोहराना",
    regretting: "पछतावा",
    dwelling: "सोचते रहना",
    looping: "चक्र में फंसा",
    rehashing: "फिर से सोचना",
    overanalyzing: "ज़्यादा विश्लेषण",
    wishing: "काश",
    blaming: "दोष देना",
    secondGuessing: "संदेह करना",
    fixating: "जुनून",
    brooding: "उदासी",
    mulling: "विचार करना",
    obsessing: "जुनूनी",
    haunted: "परेशान",
    stuck: "अटका हुआ",
    // Thought bubbles - Anxious
    worrying: "चिंता",
    catastrophizing: "सबसे बुरा सोचना",
    whatIfs: "क्या अगर",
    spiraling: "घूमना",
    overthinking: "अधिक सोचना",
    fearing: "डर",
    anticipating: "आशंका",
    dreading: "भय",
    racing: "तेज़ विचार",
    scattered: "बिखरा हुआ",
    restless: "बेचैन",
    panicking: "घबराहट",
    hypervigilant: "अति सतर्क",
    projecting: "कल्पना",
    doomScrolling: "नकारात्मक",
    // Thought bubbles - Critical
    judging: "न्याय करना",
    comparing: "तुलना",
    criticizing: "आलोचना",
    doubting: "संदेह",
    shaming: "शर्मिंदा",
    notEnough: "काफी नहीं",
    failing: "असफल",
    imposter: "धोखेबाज़",
    perfectionist: "पूर्णतावादी",
    selfAttacking: "स्व-आलोचना",
    belittling: "छोटा समझना",
    harsh: "कठोर",
    unworthy: "अयोग्य",
    dismissive: "खारिज",
    inadequate: "अपर्याप्त",
    // Thought bubbles - Clear
    present: "वर्तमान",
    calm: "शांत",
    focused: "केंद्रित",
    grounded: "स्थिर",
    peaceful: "शांतिपूर्ण",
    accepting: "स्वीकार",
    curious: "जिज्ञासु",
    open: "खुला",
    grateful: "आभारी",
    hopeful: "आशावान",
    content: "संतुष्ट",
    balanced: "संतुलित",
    centered: "केंद्रित",
    flowing: "बहता हुआ",
    aware: "जागरूक",
    // Context step
    addContext: "संदर्भ जोड़ें",
    whatWereDoing: "आप क्या कर रहे थे?",
    whichActivity: "कौन सी गतिविधि?",
    whoWith: "आप किसके साथ हैं?",
    whereAreYou: "आप कहां हैं?",
    howIntense: "यह भावना कितनी तीव्र है?",
    mild: "हल्की",
    moderate: "मध्यम",
    strong: "तेज़",
    intense: "बहुत तेज़",
    reflectionPrompts: "चिंतन प्रश्न",
    whatTriggered: "इस विचार को किसने ट्रिगर किया?",
    whereInBody: "मैं इसे शरीर में कहां महसूस करता हूं?",
    whatDoYouNeed: "मुझे अभी क्या चाहिए?",
    familiarPattern: "क्या यह एक परिचित पैटर्न है?",
    anythingElse: "कुछ और कहना है?",
    freeformPlaceholder: "यहां स्वतंत्र रूप से लिखें...",
    startSession: "कोचिंग सत्र शुरू करें",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("app-language");
    return (saved as Language) || "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app-language", lang);
  };

  useEffect(() => {
    localStorage.setItem("app-language", language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
