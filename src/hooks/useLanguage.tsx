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
  // Suggestions
  suggestion1: string;
  suggestion2: string;
  suggestion3: string;
  suggestion4: string;
  // Common
  signOut: string;
  back: string;
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
    suggestion1: "I'm not good enough for this",
    suggestion2: "Everyone is judging me",
    suggestion3: "I'll never be successful",
    suggestion4: "Something bad is going to happen",
    signOut: "Sign out",
    back: "back",
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
    suggestion1: "मैं इसके लिए काफी अच्छा नहीं हूं",
    suggestion2: "हर कोई मुझे जज कर रहा है",
    suggestion3: "मैं कभी सफल नहीं होऊंगा",
    suggestion4: "कुछ बुरा होने वाला है",
    signOut: "साइन आउट",
    back: "वापस",
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
