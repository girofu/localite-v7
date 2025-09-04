// Mock for react-native/Libraries/Utilities/Platform
export const OS = 'ios';
export const select = (obj: { [key: string]: any }) => obj.ios || obj.default;
export const Version = 13;
export const isPad = false;
export const isTV = false;
export const isTesting = true;
