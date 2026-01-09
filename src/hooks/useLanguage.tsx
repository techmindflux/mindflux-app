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
  logIn: string;
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
  // Reflect page
  reflect: string;
  yourPatterns: string;
  recentCheckIns: string;
  thisWeek: string;
  avgIntensity: string;
  overall: string;
  weeklyTrend: string;
  intensityRising: string;
  intensityFalling: string;
  stayingStable: string;
  needMoreData: string;
  patternsInsights: string;
  thoughtPatternDist: string;
  intensityOverTime: string;
  totalCheckIns: string;
  mostFrequentPattern: string;
  startYourJourney: string;
  startJourneyDesc: string;
  recentHistory: string;
  signInRequired: string;
  signInReflectDesc: string;
  noDataYet: string;
  // Lumina Chat
  luminaGreeting: string;
  shareWhatsOnMind: string;
  luminaDisclaimer: string;
  sources: string;
  signInLuminaDesc: string;
  iFeelStressed: string;
  helpMeReflect: string;
  groundingExercise: string;
  cantSleep: string;
  feelingAnxious: string;
  needMotivation: string;
  exploreThreads: string;
  newChat: string;
  library: string;
  history: string;
  topicsToExplore: string;
  noConversationsYet: string;
  startChatting: string;
  today: string;
  yesterday: string;
  previous7Days: string;
  previous30Days: string;
  older: string;
  // Library topics
  stressManagement: string;
  stressManagementDesc: string;
  anxietyRelief: string;
  anxietyReliefDesc: string;
  betterSleep: string;
  betterSleepDesc: string;
  mindfulness: string;
  mindfulnessDesc: string;
  emotionalWellness: string;
  emotionalWellnessDesc: string;
  mentalResilience: string;
  mentalResilienceDesc: string;
  // Topic cards
  sleepTopic: string;
  sleepTopicDesc: string;
  anxietyTopic: string;
  anxietyTopicDesc: string;
  focusTopic: string;
  focusTopicDesc: string;
  selfCareTopic: string;
  selfCareTopicDesc: string;
  mindfulnessTopic: string;
  mindfulnessTopicDesc: string;
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
    logIn: "Log In",
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
    whatWereDoing: "What are you doing?",
    whichActivity: "Which activity?",
    whoWith: "Who are you with?",
    whereAreYou: "Where are you?",
    howIntense: "How intense is this feeling?",
    mild: "Mild",
    moderate: "Moderate",
    strong: "Strong",
    intense: "Intense",
    reflectionPrompts: "Quick Reflections",
    whatTriggered: "What triggered this thought?",
    whereInBody: "Where do I feel it in my body?",
    whatDoYouNeed: "What do I need right now?",
    familiarPattern: "Is this a familiar pattern?",
    anythingElse: "Anything else on your mind?",
    freeformPlaceholder: "Write freely here...",
    startSession: "Start Coaching Session",
    // Reflect page
    reflect: "Reflect",
    yourPatterns: "Your stress patterns and insights",
    recentCheckIns: "Recent Check-ins",
    thisWeek: "this week",
    avgIntensity: "Average Intensity",
    overall: "overall",
    weeklyTrend: "Weekly Trend",
    intensityRising: "intensity rising",
    intensityFalling: "intensity falling",
    stayingStable: "staying stable",
    needMoreData: "need more data",
    patternsInsights: "Patterns & Insights",
    thoughtPatternDist: "Thought Pattern Distribution",
    intensityOverTime: "Intensity Over Time",
    totalCheckIns: "Total Check-ins",
    mostFrequentPattern: "Most Frequent Pattern",
    startYourJourney: "Start Your Journey",
    startJourneyDesc: "Complete a few thought check-ins to uncover patterns and personalized insights about your mindset.",
    recentHistory: "Recent History",
    signInRequired: "Sign In Required",
    signInReflectDesc: "Log in with your Google account to access your stress patterns and personalized insights.",
    noDataYet: "no data yet",
    // Lumina Chat
    luminaGreeting: "Hello. I'm Lumina, your mental wellness companion. This is a safe space to explore how you're feeling. What's on your mind today?",
    shareWhatsOnMind: "Share what's on your mind...",
    luminaDisclaimer: "Lumina is not a therapist. For crisis support, please contact a professional.",
    sources: "Sources",
    signInLuminaDesc: "Log in with your Google account to chat with Lumina, your AI wellness companion.",
    iFeelStressed: "I feel stressed",
    helpMeReflect: "Help me reflect",
    groundingExercise: "Grounding exercise",
    cantSleep: "Can't sleep",
    feelingAnxious: "Feeling anxious",
    needMotivation: "Need motivation",
    exploreThreads: "Explore threads",
    newChat: "New Chat",
    library: "Library",
    history: "History",
    topicsToExplore: "Topics to Explore",
    noConversationsYet: "No conversations yet",
    startChatting: "Start chatting to save your history",
    today: "Today",
    yesterday: "Yesterday",
    previous7Days: "Previous 7 Days",
    previous30Days: "Previous 30 Days",
    older: "Older",
    // Library topics
    stressManagement: "Stress Management",
    stressManagementDesc: "Techniques to find calm",
    anxietyRelief: "Anxiety Relief",
    anxietyReliefDesc: "Quiet your racing mind",
    betterSleep: "Better Sleep",
    betterSleepDesc: "Rest deeply tonight",
    mindfulness: "Mindfulness",
    mindfulnessDesc: "Be present in the moment",
    emotionalWellness: "Emotional Wellness",
    emotionalWellnessDesc: "Understand your feelings",
    mentalResilience: "Mental Resilience",
    mentalResilienceDesc: "Build inner strength",
    // Topic cards
    sleepTopic: "Improve my sleep quality and wind down for better rest",
    sleepTopicDesc: "Better sleep habits",
    anxietyTopic: "Help me manage anxious thoughts and find calm",
    anxietyTopicDesc: "Anxiety management",
    focusTopic: "Improve my concentration and stay focused",
    focusTopicDesc: "Focus improvement",
    selfCareTopic: "Create a self-care routine that works for me",
    selfCareTopicDesc: "Self-care routine",
    mindfulnessTopic: "Practice being present and reduce overthinking",
    mindfulnessTopicDesc: "Mindfulness practice",
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
    logIn: "लॉग इन",
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
    reflectionPrompts: "त्वरित चिंतन",
    whatTriggered: "इस विचार को किसने ट्रिगर किया?",
    whereInBody: "मैं इसे शरीर में कहां महसूस करता हूं?",
    whatDoYouNeed: "मुझे अभी क्या चाहिए?",
    familiarPattern: "क्या यह एक परिचित पैटर्न है?",
    anythingElse: "कुछ और कहना है?",
    freeformPlaceholder: "यहां स्वतंत्र रूप से लिखें...",
    startSession: "कोचिंग सत्र शुरू करें",
    // Reflect page
    reflect: "प्रतिबिंब",
    yourPatterns: "आपके तनाव पैटर्न और अंतर्दृष्टि",
    recentCheckIns: "हाल के चेक-इन",
    thisWeek: "इस सप्ताह",
    avgIntensity: "औसत तीव्रता",
    overall: "कुल मिलाकर",
    weeklyTrend: "साप्ताहिक रुझान",
    intensityRising: "तीव्रता बढ़ रही है",
    intensityFalling: "तीव्रता घट रही है",
    stayingStable: "स्थिर रह रहा है",
    needMoreData: "और डेटा चाहिए",
    patternsInsights: "पैटर्न और अंतर्दृष्टि",
    thoughtPatternDist: "विचार पैटर्न वितरण",
    intensityOverTime: "समय के साथ तीव्रता",
    totalCheckIns: "कुल चेक-इन",
    mostFrequentPattern: "सबसे सामान्य पैटर्न",
    startYourJourney: "अपनी यात्रा शुरू करें",
    startJourneyDesc: "अपनी मानसिकता के बारे में पैटर्न और व्यक्तिगत अंतर्दृष्टि प्राप्त करने के लिए कुछ विचार चेक-इन पूरे करें।",
    recentHistory: "हाल का इतिहास",
    signInRequired: "साइन इन आवश्यक",
    signInReflectDesc: "अपने तनाव पैटर्न और व्यक्तिगत अंतर्दृष्टि तक पहुंचने के लिए Google खाते से लॉग इन करें।",
    noDataYet: "अभी कोई डेटा नहीं",
    // Lumina Chat
    luminaGreeting: "नमस्ते। मैं लुमिना हूं, आपकी मानसिक स्वास्थ्य साथी। यह आपकी भावनाओं को समझने के लिए एक सुरक्षित स्थान है। आज आपके मन में क्या है?",
    shareWhatsOnMind: "अपने मन की बात साझा करें...",
    luminaDisclaimer: "लुमिना एक थेरेपिस्ट नहीं है। संकट सहायता के लिए, कृपया किसी पेशेवर से संपर्क करें।",
    sources: "स्रोत",
    signInLuminaDesc: "लुमिना, आपके AI वेलनेस साथी से बात करने के लिए Google खाते से लॉग इन करें।",
    iFeelStressed: "मुझे तनाव महसूस हो रहा है",
    helpMeReflect: "मुझे सोचने में मदद करें",
    groundingExercise: "ग्राउंडिंग व्यायाम",
    cantSleep: "नींद नहीं आ रही",
    feelingAnxious: "चिंतित महसूस कर रहा हूं",
    needMotivation: "प्रेरणा चाहिए",
    exploreThreads: "थ्रेड्स देखें",
    newChat: "नई चैट",
    library: "लाइब्रेरी",
    history: "इतिहास",
    topicsToExplore: "एक्सप्लोर करने के लिए विषय",
    noConversationsYet: "अभी कोई बातचीत नहीं",
    startChatting: "इतिहास सहेजने के लिए चैट शुरू करें",
    today: "आज",
    yesterday: "कल",
    previous7Days: "पिछले 7 दिन",
    previous30Days: "पिछले 30 दिन",
    older: "पुराना",
    // Library topics
    stressManagement: "तनाव प्रबंधन",
    stressManagementDesc: "शांत होने की तकनीकें",
    anxietyRelief: "चिंता राहत",
    anxietyReliefDesc: "अपने दौड़ते मन को शांत करें",
    betterSleep: "बेहतर नींद",
    betterSleepDesc: "आज रात गहरी नींद लें",
    mindfulness: "माइंडफुलनेस",
    mindfulnessDesc: "वर्तमान में रहें",
    emotionalWellness: "भावनात्मक स्वास्थ्य",
    emotionalWellnessDesc: "अपनी भावनाओं को समझें",
    mentalResilience: "मानसिक लचीलापन",
    mentalResilienceDesc: "आंतरिक शक्ति बनाएं",
    // Topic cards
    sleepTopic: "मेरी नींद की गुणवत्ता सुधारें और बेहतर आराम के लिए शांत हों",
    sleepTopicDesc: "बेहतर नींद की आदतें",
    anxietyTopic: "चिंतित विचारों को प्रबंधित करने और शांत खोजने में मदद करें",
    anxietyTopicDesc: "चिंता प्रबंधन",
    focusTopic: "मेरी एकाग्रता सुधारें और ध्यान केंद्रित रहें",
    focusTopicDesc: "फोकस सुधार",
    selfCareTopic: "मेरे लिए काम करने वाली सेल्फ-केयर रूटीन बनाएं",
    selfCareTopicDesc: "सेल्फ-केयर रूटीन",
    mindfulnessTopic: "वर्तमान में रहने का अभ्यास करें और अधिक सोचना कम करें",
    mindfulnessTopicDesc: "माइंडफुलनेस अभ्यास",
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
