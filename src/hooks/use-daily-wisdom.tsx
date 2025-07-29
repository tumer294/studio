
"use client";

import React, { createContext, useContext, useState } from 'react';

interface DailyWisdomContextType {
    language: string;
    setLanguage: (language: string) => void;
}

const DailyWisdomContext = createContext<DailyWisdomContextType | undefined>(undefined);

export const DailyWisdomProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState('en');

  return (
    <DailyWisdomContext.Provider value={{ language, setLanguage }}>
      {children}
    </DailyWisdomContext.Provider>
  );
};

export const useDailyWisdom = (): DailyWisdomContextType => {
  const context = useContext(DailyWisdomContext);
  if (context === undefined) {
    throw new Error('useDailyWisdom must be used within a DailyWisdomProvider');
  }
  return context;
};
