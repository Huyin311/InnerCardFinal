import React, { createContext, useContext, useState } from "react";

type Lang = "vi" | "en";
const LanguageContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
}>({
  lang: "vi",
  setLang: () => {},
});

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [lang, setLang] = useState<Lang>("vi");
  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};
export const useLanguage = () => useContext(LanguageContext);
