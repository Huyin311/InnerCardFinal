import React from "react";
import { DarkModeProvider } from "./app/DarkModeContext";
import { LanguageProvider } from "./app/LanguageContext";
import AppNavigator from "./AppNavigator";

export default function App() {
  return (
    <LanguageProvider>
      <DarkModeProvider>
        <AppNavigator />
      </DarkModeProvider>
    </LanguageProvider>
  );
}
