/**
 * 語音播報上下文
 *
 * 提供應用級別的語音播報狀態管理
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useSpeech } from '../hooks/useSpeech';
import { SpeechOptions, SpeechState } from '../services/ExpoSpeechService';

interface SpeechContextType {
  // 狀態
  isSpeaking: boolean;
  currentText: string | null;
  voices: any[];

  // 方法
  speak: (text: string, options?: SpeechOptions) => Promise<void>;
  stop: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  testSpeech: (text?: string) => Promise<void>;
  findBestVoice: (language: string, gender?: 'MALE' | 'FEMALE') => any;
  getSupportedLanguages: () => string[];
}

const SpeechContext = createContext<SpeechContextType | undefined>(undefined);

interface SpeechProviderProps {
  children: ReactNode;
}

export const SpeechProvider: React.FC<SpeechProviderProps> = ({ children }) => {
  const speech = useSpeech();

  const value: SpeechContextType = {
    // 狀態
    isSpeaking: speech.isSpeaking,
    currentText: speech.currentText,
    voices: speech.voices,

    // 方法
    speak: speech.speak,
    stop: speech.stop,
    pause: speech.pause,
    resume: speech.resume,
    testSpeech: speech.testSpeech,
    findBestVoice: speech.findBestVoice,
    getSupportedLanguages: speech.getSupportedLanguages,
  };

  return (
    <SpeechContext.Provider value={value}>
      {children}
    </SpeechContext.Provider>
  );
};

export const useSpeechContext = (): SpeechContextType => {
  const context = useContext(SpeechContext);
  if (context === undefined) {
    throw new Error('useSpeechContext must be used within a SpeechProvider');
  }
  return context;
};
