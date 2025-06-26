import React, { useRef, useState } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import {
  Box,
  Text,
  Pressable,
  Heading,
  useColorModeValue,
  HStack,
  Icon,
  IconButton,
} from 'native-base';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { FontAwesome5 } from '@expo/vector-icons';

// Interface untuk props komponen
interface FlashCardProps {
  front: string;
  back: string;
  onRating?: (rating: number) => void;
  onNext?: () => void;
  showControls?: boolean;
}

// Ukuran layar untuk animasi
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

const FlashCard: React.FC<FlashCardProps> = ({
  front,
  back,
  onRating,
  onNext,
  showControls = true,
}) => {
  // State untuk melacak apakah kartu dibalik
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Nilai animasi untuk swipe
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  
  // Fungsi untuk menangani flip kartu
  const handleFlip = () => {
    rotate.value = withTiming(isFlipped ? 0 : 180, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    });
    setIsFlipped(!isFlipped);
  };
  
  // Fungsi untuk menangani rating (Easy, Medium, Hard)
  const handleRating = (rating: number) => {
    if (onRating) {
      onRating(rating);
    }
    
    // Animasi slide out ke kanan
    translateX.value = withTiming(SCREEN_WIDTH, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    }, () => {
      if (onNext) {
        runOnJS(onNext)();
      }
      // Reset posisi untuk kartu berikutnya
      translateX.value = 0;
    });
  };
  
  // Gesture untuk swipe
  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        // Swipe kiri (hard) atau kanan (easy)
        const direction = event.translationX > 0 ? 1 : -1;
        translateX.value = withTiming(direction * SCREEN_WIDTH, {
          duration: 300,
          easing: Easing.inOut(Easing.ease),
        }, () => {
          // 0 = hard, 2 = medium (default), 3 = easy
          const rating = direction > 0 ? 3 : 0;
          if (onRating) {
            runOnJS(onRating)(rating);
          }
          if (onNext) {
            runOnJS(onNext)();
          }
          // Reset posisi untuk kartu berikutnya
          translateX.value = 0;
        });
      } else {
        // Snap back to center
        translateX.value = withTiming(0);
      }
    });
  
  // Style untuk animasi swipe
  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { rotateY: `${interpolate(rotate.value, [0, 180], [0, 180])}deg` },
      ],
    };
  });
  
  // Style untuk sisi depan dan belakang
  const frontStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(rotate.value, [0, 90, 180], [1, 0, 0]),
      backfaceVisibility: 'hidden' as const,
    };
  });
  
  const backStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(rotate.value, [0, 90, 180], [0, 0, 1]),
      backfaceVisibility: 'hidden' as const,
      transform: [{ rotateY: '180deg' }],
    };
  });
  
  // Warna untuk mode gelap/terang
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  
  return (
    <Box width="100%" alignItems="center" justifyContent="center">
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.cardContainer, cardStyle]}>
          <Pressable onPress={handleFlip} style={styles.card}>
            <Animated.View style={[styles.cardSide, frontStyle]}>
              <Box
                bg={bgColor}
                p={6}
                rounded="lg"
                shadow={3}
                width="100%"
                height="100%"
                justifyContent="center"
                alignItems="center"
              >
                <Heading color={textColor} textAlign="center" mb={4}>
                  {front}
                </Heading>
                <Text color="gray.500" textAlign="center">
                  Tap untuk melihat jawaban
                </Text>
              </Box>
            </Animated.View>
            
            <Animated.View
              style={[
                styles.cardSide,
                styles.cardBack,
                backStyle,
              ]}
            >
              <Box
                bg={bgColor}
                p={6}
                rounded="lg"
                shadow={3}
                width="100%"
                height="100%"
                justifyContent="center"
                alignItems="center"
              >
                <Heading color={textColor} textAlign="center" mb={4}>
                  {back}
                </Heading>
                <Text color="gray.500" textAlign="center">
                  Tap untuk kembali
                </Text>
              </Box>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </GestureDetector>
      
      {showControls && (
        <HStack space={4} mt={6} alignItems="center" justifyContent="center">
          <IconButton
            icon={
              <Icon
                as={FontAwesome5}
                name="frown"
                size="lg"
                color="red.500"
              />
            }
            onPress={() => handleRating(0)} // Hard
            variant="ghost"
            _pressed={{ bg: 'red.100' }}
            rounded="full"
          />
          <IconButton
            icon={
              <Icon
                as={FontAwesome5}
                name="meh"
                size="lg"
                color="yellow.500"
              />
            }
            onPress={() => handleRating(2)} // Medium
            variant="ghost"
            _pressed={{ bg: 'yellow.100' }}
            rounded="full"
          />
          <IconButton
            icon={
              <Icon
                as={FontAwesome5}
                name="smile"
                size="lg"
                color="green.500"
              />
            }
            onPress={() => handleRating(3)} // Easy
            variant="ghost"
            _pressed={{ bg: 'green.100' }}
            rounded="full"
          />
        </HStack>
      )}
    </Box>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 0.9 * 1.4, // Aspek rasio kartu 1.4:1
    overflow: 'hidden',
  },
  card: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  cardSide: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  cardBack: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});

export default FlashCard; 