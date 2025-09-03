/**
 * 語音播報鉤子
 *
 * 提供方便的語音播報功能
 */

import { useState, useEffect } from 'react';
import { ExpoSpeechService, SpeechOptions, SpeechState } from '../services/ExpoSpeechService';

const speechService = new ExpoSpeechService();

export const useSpeech = () => {
  const [state, setState] = useState<SpeechState>(speechService.getState());

  useEffect(() => {
    const unsubscribe = speechService.subscribe(setState);
    return unsubscribe;
  }, []);

  const speak = async (text: string, options?: SpeechOptions) => {
    return speechService.speak(text, options);
  };

  const stop = async () => {
    return speechService.stop();
  };

  const pause = async () => {
    return speechService.pause();
  };

  const resume = async () => {
    return speechService.resume();
  };

  const testSpeech = async (text?: string) => {
    return speechService.testSpeech(text);
  };

  const findBestVoice = (language: string, gender?: 'MALE' | 'FEMALE') => {
    return speechService.findBestVoice(language, gender);
  };

  const getSupportedLanguages = () => {
    return speechService.getSupportedLanguages();
  };

  return {
    // 狀態
    isSpeaking: state.isSpeaking,
    currentText: state.currentText,
    voices: state.voices,

    // 方法
    speak,
    stop,
    pause,
    resume,
    testSpeech,
    findBestVoice,
    getSupportedLanguages,
  };
};
