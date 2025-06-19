import React from "react";
import AppNavigator from "./AppNavigator";
import { DarkModeProvider } from "./app/DarkModeContext";
import { LanguageProvider } from "./app/LanguageContext"; // Thêm dòng này

export default function App() {
  return (
    <LanguageProvider>
      {" "}
      <DarkModeProvider>
        <AppNavigator />
      </DarkModeProvider>
    </LanguageProvider>
  );
}
