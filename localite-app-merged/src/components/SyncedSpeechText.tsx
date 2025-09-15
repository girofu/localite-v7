/**
 * 同步語音文字播放組件
 *
 * 實現文字和語音的完美同步播放體驗
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useSpeechContext } from '../contexts/SpeechContext';

interface SyncedSpeechTextProps {
  text: string;
  autoPlay?: boolean;
  showControls?: boolean;
  highlightColor?: string;
  textStyle?: any;
  onComplete?: () => void;
  onWordHighlight?: (word: string, index: number) => void;
}

interface WordSegment {
  word: string;
  startTime: number;
  endTime: number;
  isHighlighted: boolean;
}

export const SyncedSpeechText: React.FC<SyncedSpeechTextProps> = ({
  text,
  autoPlay = false,
  showControls = true,
  highlightColor = '#4299E1',
  textStyle = {},
  onComplete,
  onWordHighlight,
}) => {
  const { speak, stop, pause, resume, isSpeaking } = useSpeechContext();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [wordSegments, setWordSegments] = useState<WordSegment[]>([]);
  const startTimeRef = useRef<number>(0);
  const animationRef = useRef<Animated.Value>(new Animated.Value(0));

  // 分割文字為單詞
  useEffect(() => {
    if (text) {
      const words = text.split(/(\s+)/).filter(word => word.trim().length > 0);
      const segments: WordSegment[] = words.map((word, index) => ({
        word,
        startTime: index * 300, // 估算每個詞的播放時間
        endTime: (index + 1) * 300,
        isHighlighted: false,
      }));
      setWordSegments(segments);
    }
  }, [text]);

  // 自動播放
  useEffect(() => {
    if (autoPlay && text && !isPlaying) {
      handlePlay();
    }
  }, [autoPlay, text]);

  // 語音播放進度監聽
  useEffect(() => {
    if (isSpeaking && isPlaying) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const currentIndex = wordSegments.findIndex(
          segment => elapsed >= segment.startTime && elapsed < segment.endTime
        );

        if (currentIndex !== -1 && currentIndex !== currentWordIndex) {
          setCurrentWordIndex(currentIndex);

          // 觸發高亮動畫
          Animated.timing(animationRef.current, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
          }).start(() => {
            Animated.timing(animationRef.current, {
              toValue: 0,
              duration: 200,
              delay: 100,
              useNativeDriver: false,
            }).start();
          });

          // 回調
          if (onWordHighlight && wordSegments[currentIndex]) {
            onWordHighlight(wordSegments[currentIndex].word, currentIndex);
          }
        }
      }, 50);

      return () => clearInterval(interval);
    } else if (!isSpeaking && isPlaying) {
      // 播放完成
      setIsPlaying(false);
      setCurrentWordIndex(-1);
      if (onComplete) {
        onComplete();
      }
    }
  }, [isSpeaking, isPlaying, currentWordIndex, wordSegments, onWordHighlight, onComplete]);

  const handlePlay = async () => {
    if (!text) return;

    try {
      setIsPlaying(true);
      startTimeRef.current = Date.now();

      await speak(text, {
        language: 'zh-TW',
        pitch: 1.0,
        rate: 0.8,
        volume: 1.0,
      });
    } catch (error) {
      console.error('語音播放失敗:', error);
      setIsPlaying(false);
    }
  };

  const handlePause = async () => {
    try {
      await pause();
      setIsPlaying(false);
    } catch (error) {
      console.error('語音暫停失敗:', error);
    }
  };

  const handleResume = async () => {
    try {
      setIsPlaying(true);
      startTimeRef.current = Date.now() - (currentWordIndex * 300); // 恢復播放進度
      await resume();
    } catch (error) {
      console.error('語音恢復失敗:', error);
      setIsPlaying(false);
    }
  };

  const handleStop = async () => {
    try {
      await stop();
      setIsPlaying(false);
      setCurrentWordIndex(-1);
      animationRef.current.setValue(0);
    } catch (error) {
      console.error('語音停止失敗:', error);
    }
  };

  const renderWord = (segment: WordSegment, index: number) => {
    const isCurrentWord = index === currentWordIndex;
    const backgroundColor = animationRef.current.interpolate({
      inputRange: [0, 1],
      outputRange: ['transparent', highlightColor],
    });

    return (
      <Animated.Text
        key={index}
        style={[
          styles.word,
          textStyle,
          isCurrentWord && {
            backgroundColor,
            borderRadius: 4,
            paddingHorizontal: 2,
            paddingVertical: 1,
          },
        ]}
      >
        {segment.word}
      </Animated.Text>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={[styles.text, textStyle]}>
          {wordSegments.map((segment, index) => renderWord(segment, index))}
        </Text>
      </View>

      {showControls && (
        <View style={styles.controlsContainer}>
          {!isPlaying ? (
            <TouchableOpacity
              style={[styles.controlButton, styles.playButton]}
              onPress={handlePlay}
            >
              <Text style={styles.controlButtonText}>▶️</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.controlButton, styles.pauseButton]}
              onPress={handlePause}
            >
              <Text style={styles.controlButtonText}>⏸️</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.controlButton, styles.stopButton]}
            onPress={handleStop}
          >
            <Text style={styles.controlButtonText}>⏹️</Text>
          </TouchableOpacity>
        </View>
      )}

      {isPlaying && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: animationRef.current.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  textContainer: {
    marginBottom: 16,
  },
  text: {
    fontSize: 18,
    lineHeight: 28,
    color: '#FFFFFF',
    textAlign: 'left',
  },
  word: {
    marginRight: 4,
    marginBottom: 4,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  playButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
  },
  pauseButton: {
    backgroundColor: 'rgba(255, 193, 7, 0.8)',
  },
  stopButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
  },
  controlButtonText: {
    fontSize: 20,
  },
  progressContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4299E1',
    borderRadius: 2,
  },
});
