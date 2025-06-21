import React from "react";
import { DarkModeProvider } from "./app/DarkModeContext";
import { LanguageProvider } from "./app/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import AppNavigator from "./AppNavigator";

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <DarkModeProvider>
          <AppNavigator />
        </DarkModeProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
