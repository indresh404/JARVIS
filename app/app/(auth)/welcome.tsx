// app/(auth)/welcome.tsx
import { COLORS, SPACING, TYPOGRAPHY } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  FadeInDown,
  runOnJS,
  SlideInRight,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  ZoomIn
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Replace the SmoothTypingText component with this:

const SmoothTypingText = ({ text, style, isActive }: any) => {
  const [displayText, setDisplayText] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Clear any existing interval when slide changes
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (isActive) {
      setDisplayText(''); // Reset text when slide becomes active
      let index = 0;
      
      intervalRef.current = setInterval(() => {
        if (index < text.length) {
          setDisplayText(text.substring(0, index + 1));
          index++;
        } else {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }, 20); // 20ms per character for smooth typing
    } else {
      setDisplayText(''); // Clear text when slide is inactive
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, text]);
  
  return (
    <Text style={style}>
      {displayText}
      {isActive && displayText.length < text.length && (
        <Text style={styles.cursor}>▊</Text>
      )}
    </Text>
  );
};

// Feature slides
const slides = [
  {
    id: '1',
    tag: 'AI HEALTH ASSISTANT',
    headline: 'Your Personal\nHealth Guardian',
    body: 'Advanced AI that understands your health concerns and provides personalized guidance 24/7, right when you need it most.',
    icon: 'medkit-outline',
    gradient: ['#ff3838', '#cb0000'],
  },
  {
    id: '2',
    tag: 'FAMILY CARE',
    headline: 'Track Your\nWhole Family',
    body: 'Monitor health metrics for your entire family in one place. Never miss a health update with real-time notifications.',
    icon: 'people-outline',
    gradient: ['#035bff', '#1900d5'],
  },
  {
    id: '3',
    tag: 'EARLY WARNINGS',
    headline: 'Predict &\nPrevent Risks',
    body: 'Get AI-powered predictions about potential health issues before they become serious. Prevention is better than cure.',
    icon: 'warning-outline',
    gradient: ['#ff943d', '#c66000'],
  },
  {
    id: '4',
    tag: 'MEDICATION TRACKER',
    headline: 'Never Miss\nYour Medicines',
    body: 'Smart reminders and tracking for all your medications. Stay on top of your health routine effortlessly.',
    icon: 'calendar-outline',
    gradient: ['#A855F7', '#5c00b9'],
  },
  {
    id: '5',
    tag: 'GOVERNMENT SCHEMES',
    headline: 'Health Benefits\nAt Your Fingertips',
    body: 'Discover eligible government health schemes and get assistance with applications. Your health, our priority.',
    icon: 'document-text-outline',
    gradient: ['#29fb30', '#058d00'],
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const scrollY = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showContinue, setShowContinue] = useState(false);
  const flatListRef = useRef<Animated.FlatList<any>>(null);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor('transparent');
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      const index = Math.round(event.contentOffset.y / height);
      if (index !== currentIndex) {
        runOnJS(setCurrentIndex)(index);
        if (index === slides.length - 1) {
          runOnJS(setShowContinue)(true);
        } else {
          runOnJS(setShowContinue)(false);
        }
      }
    },
  });

  const goToNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  const navigateToLogin = () => {
    router.push('/(auth)/login');
  };

  const renderSlide = ({ item, index }: { item: typeof slides[0]; index: number }) => {
    return <SlideView slide={item} index={index} isActive={index === currentIndex} />;
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: COLORS.primary }]} />
      
      {/* Top Bar */}
      <Animated.View 
        entering={FadeInDown.delay(200).springify()}
        style={styles.topBar}
      >
        <View style={styles.topBarContent}>
          <View style={styles.logoContainer}>
            <Animated.View entering={ZoomIn.delay(300)} style={styles.logoBox}>
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                style={styles.logoGradient}
              >
                <Ionicons name="heart" size={24} color={COLORS.white} />
              </LinearGradient>
            </Animated.View>
            <Animated.View entering={SlideInRight.delay(400)}>
              <Text style={styles.logoText}>SWASTHYA</Text>
              <Text style={styles.logoSubtext}>AI</Text>
            </Animated.View>
          </View>
          
          {currentIndex < slides.length - 1 && (
            <Animated.View entering={FadeIn.delay(500)}>
              <TouchableOpacity onPress={navigateToLogin} style={styles.skipButton}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </Animated.View>

      {/* Main Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        decelerationRate="fast"
        bounces={false}
      />

      {/* Page Indicator - Fixed */}
      <View style={styles.pageIndicatorContainer}>
        <View style={styles.pageIndicator}>
          {slides.map((_, idx) => {
            const isActive = idx === currentIndex;
            return (
              <View
                key={idx}
                style={[
                  styles.indicatorDot,
                  {
                    height: isActive ? 24 : 6,
                    width: isActive ? 6 : 4,
                    backgroundColor: isActive ? COLORS.white : 'rgba(255,255,255,0.4)',
                  },
                ]}
              />
            );
          })}
        </View>
      </View>

      {/* Bottom Button */}
      <Animated.View 
        entering={FadeInDown.delay(700).springify()}
        style={styles.bottomButton}
      >
        {!showContinue ? (
          currentIndex < slides.length - 1 && (
            <TouchableOpacity onPress={goToNext} activeOpacity={0.8}>
              <Animated.View 
                style={styles.scrollHint}
                entering={FadeIn.delay(800)}
              >
                <Text style={styles.scrollHintText}>Swipe up</Text>
                <Ionicons name="chevron-up" size={20} color="rgba(255,255,255,0.9)" />
              </Animated.View>
            </TouchableOpacity>
          )
        ) : (
          <TouchableOpacity onPress={navigateToLogin} activeOpacity={0.9}>
            <Animated.View 
              style={styles.continueButton}
              entering={ZoomIn.delay(200).springify()}
            >
              <Text style={styles.continueButtonText}>GET STARTED</Text>
              <LinearGradient
                colors={['rgba(37,150,190,0.15)', 'rgba(37,150,190,0.25)']}
                style={styles.continueIcon}
              >
                <Ionicons name="arrow-forward" size={18} color={COLORS.primary} />
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
        )}
      </Animated.View>
    </GestureHandlerRootView>
  );
}

// Slide Component with Smooth Animations
const SlideView: React.FC<{ slide: any; index: number; isActive: boolean }> = ({ 
  slide, 
  index, 
  isActive 
}) => {
  const lottieRef = useRef<LottieView>(null);
  const contentOpacity = useSharedValue(0);
  
  const getLottieSource = () => {
    try {
      const animations = [
        require('@/assets/lottie_animations/login_animation_1.json'),
        require('@/assets/lottie_animations/login_animation_2.json'),
        require('@/assets/lottie_animations/login_animation_3.json'),
        require('@/assets/lottie_animations/login_animation_4.json'),
        require('@/assets/lottie_animations/login_animation_5.json'),
      ];
      return animations[index % animations.length];
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    if (isActive) {
      contentOpacity.value = withTiming(1, { duration: 500 });
      setTimeout(() => {
        lottieRef.current?.play();
      }, 800);
    } else {
      contentOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [isActive]);

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const lottieSource = getLottieSource();
  const headlineParts = slide.headline.split('\n');

  return (
    <View style={[styles.slideContainer, { height }]}>
  <Animated.View style={[styles.slideContent, animatedContentStyle]}>
    {/* Tag Chip */}
    <Animated.View
      entering={FadeInDown.delay(100).springify()}
      style={styles.tagContainer}
    >
      <LinearGradient
        colors={[slide.gradient[0], slide.gradient[1]]}
        style={styles.tagGradient}
      >
        <Ionicons name={slide.icon} size={14} color={COLORS.white} />
        <Text style={styles.tagText}>{slide.tag}</Text>
      </LinearGradient>
    </Animated.View>

    {/* Headline */}
    <Animated.View entering={FadeInDown.delay(200).springify()}>
      {headlineParts.map((part: string, partIndex: number) => (
        <Text key={partIndex} style={styles.headline}>
          {part}
        </Text>
      ))}
    </Animated.View>

    {/* Body Text with Smooth Typing Animation - Shows immediately and types */}
    {/* Body Text with Smooth Typing Animation */}
    <View style={styles.bodyContainer}>
      <SmoothTypingText
        text={slide.body}
        style={styles.bodyText}
        onComplete={() => {}}
        isActive={isActive}  // Add this prop
      />
    </View>

    {/* Counter - Shows immediately */}
    <Animated.View
      entering={FadeIn.delay(200)}
      style={styles.counter}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
        style={styles.counterGradient}
      >
        <Text style={styles.counterText}>
          {String(index + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
        </Text>
      </LinearGradient>
    </Animated.View>

    {/* Lottie Animation - Shows immediately and plays while text types */}
    <View style={styles.lottieWrapper}>
      <Animated.View
        entering={ZoomIn.delay(300).springify()}
        style={styles.lottieContainer}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.05)']}
          style={styles.lottieGradient}
        >
          {lottieSource ? (
            <LottieView
              ref={lottieRef}
              source={lottieSource}
              style={styles.lottie}
              loop={true}
              autoPlay={isActive}
              resizeMode="contain"
              speed={0.7}
            />
          ) : (
            <View style={styles.fallbackIcon}>
              <LinearGradient
                colors={[slide.gradient[0], slide.gradient[1]]}
                style={styles.fallbackGradient}
              >
                <Ionicons name={slide.icon} size={60} color={COLORS.white} />
              </LinearGradient>
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    </View>
  </Animated.View>
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slideContainer: {
    width,
    justifyContent: 'center',
  },
  slideContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: height * 0.05,
    paddingBottom: height * 0.05,
  },
  tagContainer: {
    marginBottom: SPACING.md,
  },
  tagGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 25,
    gap: 6,
    alignSelf: 'flex-start',
  },
  tagText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontFamily: TYPOGRAPHY.fonts.bold,
    letterSpacing: 1.2,
  },
  headline: {
    fontSize: 38,
    fontFamily: TYPOGRAPHY.fonts.bold,
    color: COLORS.white,
    lineHeight: 46,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  bodyContainer: {
    minHeight: 80,
    marginBottom: SPACING.lg,
  },
  bodyText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontFamily: TYPOGRAPHY.fonts.regular,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 24,
  },
  cursor: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.white,
  },
  counter: {
    marginBottom: SPACING.lg,
    alignSelf: 'flex-start',
  },
  counterGradient: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  counterText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontFamily: TYPOGRAPHY.fonts.semibold,
    letterSpacing: 0.8,
  },
  lottieWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    minHeight: width * 0.7,
  },
  lottieContainer: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 35,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  lottieGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: '90%',
    height: '90%',
  },
  lottiePlaceholder: {
    width: width * 0.7,
    height: width * 0.7,
  },
  fallbackIcon: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  topBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    overflow: 'hidden',
  },
  logoGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.bold,
    letterSpacing: 1.2,
  },
  logoSubtext: {
    color: COLORS.white,
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.medium,
    letterSpacing: 1,
    opacity: 0.8,
  },
  skipButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  skipText: {
    color: COLORS.white,
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fonts.semibold,
  },
  pageIndicatorContainer: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 15,
  },
  pageIndicator: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 20,
    gap: 8,
  },
  indicatorDot: {
    borderRadius: 3,
  },
  bottomButton: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
    zIndex: 20,
  },
  scrollHint: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 30,
    gap: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  scrollHintText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fonts.semibold,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 28,
    height: 56,
    borderRadius: 28,
    gap: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  continueButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.bold,
    letterSpacing: 1.2,
  },
  continueIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});