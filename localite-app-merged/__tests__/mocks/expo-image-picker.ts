// Mock for expo-image-picker
export const launchImageLibraryAsync = jest.fn().mockResolvedValue({
  canceled: false,
  assets: [{
    uri: 'mock-image-uri',
    width: 800,
    height: 600,
    type: 'image',
    fileName: 'mock-image.jpg',
  }],
});

export const launchCameraAsync = jest.fn().mockResolvedValue({
  canceled: false,
  assets: [{
    uri: 'mock-camera-image-uri',
    width: 800,
    height: 600,
    type: 'image',
    fileName: 'mock-camera-image.jpg',
  }],
});

export const MediaTypeOptions = {
  All: 'All',
  Videos: 'Videos',
  Images: 'Images',
};

export const requestMediaLibraryPermissionsAsync = jest.fn().mockResolvedValue({
  granted: true,
  status: 'granted',
});

export const requestCameraPermissionsAsync = jest.fn().mockResolvedValue({
  granted: true,
  status: 'granted',
});
