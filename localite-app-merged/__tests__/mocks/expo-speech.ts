// Mock for expo-speech
export const speak = jest.fn().mockResolvedValue(undefined);
export const stop = jest.fn();
export const pause = jest.fn();
export const resume = jest.fn();
export const isSpeaking = jest.fn().mockReturnValue(false);
export const getAvailableVoices = jest.fn().mockResolvedValue([]);
export const setOnSpeechStart = jest.fn();
export const setOnSpeechDone = jest.fn();
export const setOnSpeechError = jest.fn();
export const setOnSpeechProgress = jest.fn();
