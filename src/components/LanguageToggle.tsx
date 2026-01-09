import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "hi" : "en");
  };

  return (
    <Button
      variant="glass"
      size="icon"
      onClick={toggleLanguage}
      className="rounded-full font-medium text-sm"
      aria-label={language === "en" ? "Switch to Hindi" : "Switch to English"}
    >
      {language === "en" ? "हि" : "EN"}
    </Button>
  );
}
