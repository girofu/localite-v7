import React, { useState } from 'react';
import HomeScreen from './screens/HomeScreen';
import GuideActivationScreen from './screens/GuideActivationScreen';
import QRCodeScannerScreen from './screens/QRCodeScannerScreen';
import MapScreen from './screens/MapScreen';
import PlaceIntroScreen from './screens/PlaceIntroScreen';
import GuideSelectionScreen from './screens/GuideSelectionScreen';
import ChatScreen from './screens/ChatScreen';
import LearningSheetScreen from './screens/LearningSheetScreen';
import JourneyDetailScreen from './screens/JourneyDetailScreen';
import MiniCardPreviewScreen from './screens/MiniCardPreviewScreen';
import ButtonOptionPreviewScreen from './screens/ButtonOptionPreviewScreen';
import ButtonCameraPreviewScreen from './screens/ButtonCameraPreviewScreen';
import ExhibitCardPreviewScreen from './screens/ExhibitCardPreviewScreen';

export default function App() {
  const [screen, setScreen] = useState<'home' | 'guide' | 'qr' | 'map' | 'placeIntro' | 'guideSelect' | 'chat' | 'learningSheet' | 'journeyDetail' | 'miniCardPreview' | 'buttonOptionPreview' | 'buttonCameraPreview' | 'exhibitCardPreview'>('exhibitCardPreview');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<string>('kuron');

  if (screen === 'exhibitCardPreview') {
    return <ExhibitCardPreviewScreen onClose={() => setScreen('home')} />;
  }
  if (screen === 'buttonCameraPreview') {
    return <ButtonCameraPreviewScreen onClose={() => setScreen('home')} />;
  }
  if (screen === 'buttonOptionPreview') {
    return <ButtonOptionPreviewScreen onClose={() => setScreen('home')} />;
  }
  if (screen === 'miniCardPreview') {
    return <MiniCardPreviewScreen onClose={() => setScreen('home')} />;
  }
  if (screen === 'qr') {
    return <QRCodeScannerScreen onClose={() => setScreen('guide')} />;
  }
  if (screen === 'chat') {
    return <ChatScreen guideId={selectedGuide} placeId={selectedPlaceId} onClose={() => setScreen('home')} onNavigate={setScreen} />;
  }
  if (screen === 'guideSelect' && selectedPlaceId) {
    return <GuideSelectionScreen
      placeId={selectedPlaceId}
      onBack={() => setScreen('map')}
      onConfirm={(guideId) => {
        setSelectedGuide(guideId);
        setScreen('chat');
      }}
    />;
  }
  if (screen === 'placeIntro' && selectedPlaceId) {
    return <PlaceIntroScreen placeId={selectedPlaceId} onConfirm={() => setScreen('guideSelect')} onChange={() => setScreen('map')} />;
  }
  if (screen === 'map') {
    return <MapScreen
      onBack={() => setScreen('guide')}
      onPlaceSelect={placeId => {
        setSelectedPlaceId(placeId);
        setScreen('placeIntro');
      }}
    />;
  }
  if (screen === 'guide') {
    return (
      <GuideActivationScreen
        onReturn={() => setScreen('home')}
        onMenu={() => {}}
        onQRCode={() => setScreen('qr')}
        onMap={() => setScreen('map')}
      />
    );
  }
  if (screen === 'learningSheet') {
    return <LearningSheetScreen onClose={() => setScreen('home')} />;
  }
  if (screen === 'journeyDetail') {
    return <JourneyDetailScreen onClose={() => setScreen('home')} />;
  }
  return <HomeScreen onStart={() => setScreen('guide')} />;
}