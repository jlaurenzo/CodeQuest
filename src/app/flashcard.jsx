import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";

import flashcardsData from "../data/flashcards.json";

const ArrowRightIcon = ({ size = 22, color = "#FFFFFF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 12H19M13 6L19 12L13 18"
      stroke={color}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CloseIcon = ({ size = 30, color = "#FFFFFF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 6L18 18M18 6L6 18"
      stroke={color}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PLACEHOLDER_PL = "No Programming Language";
const PLACEHOLDER_UNIT = "No Unit";
const PLACEHOLDER_MODULE = "No Module";
const PLACEHOLDER_LEVEL = "No Level";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;

const Flashcard = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const getParam = (value, fallback) =>
    Array.isArray(value) ? value[0] : value ?? fallback;
  const pl = getParam(params.pl, PLACEHOLDER_PL);
  const unit = getParam(params.unit, PLACEHOLDER_UNIT);
  const mod = getParam(params.module, PLACEHOLDER_MODULE);
  const level = getParam(params.level, PLACEHOLDER_LEVEL);

  const levelData = useMemo(() => {
    return flashcardsData?.[pl]?.units?.[unit]?.modules?.[mod]?.levels?.[level];
  }, [pl, unit, mod, level]);

  const cards = levelData?.flashcards ?? [];

  const [index, setIndex] = useState(0);

  const position = useRef(new Animated.ValueXY()).current;
  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ["-8deg", "0deg", "8deg"],
  });

  const isLastCard = index === cards.length - 1;
  const currentCard = cards[index];

  const goToNext = () => { //flashcard cards hehehe
    if (isLastCard) {
      router.back();
      return;
    }
    setIndex((prev) => prev + 1);
  };

  const animateOffscreen = (direction) => {
    const toX = direction === "right" ? SCREEN_WIDTH * 1.2 : -SCREEN_WIDTH * 1.2;
    Animated.timing(position, {
      toValue: { x: toX, y: 0 },
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      goToNext();
    });
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
      friction: 6,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 8,
      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          animateOffscreen("right");
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          animateOffscreen("left");
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const cardStyle = {
    transform: [
      { translateX: position.x },
      { translateY: position.y },
      { rotate },
    ],
  };

  if (!currentCard) {
    return (
      <View style={styles.screen}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No flashcards found</Text>
          <Text style={styles.emptySubtitle}>
            Couldn't find content for {String(pl)} / {String(unit)} /{" "}
            {String(mod)} / {String(level)}
          </Text>

          <View style={styles.primaryButtonBase}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
              onPress={() => router.back()}
            >
              <Text style={styles.primaryButtonText}>EXIT</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Let's Review!</Text>
      <Text style={styles.subheading}>Swipe the flash card to learn</Text>

      <View style={styles.cardArea}>
        <Animated.View
          key={currentCard.id}
          style={[styles.card, cardStyle]}
          {...panResponder.panHandlers}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>{currentCard.title}</Text>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.definition}>{currentCard.definition}</Text>

            {currentCard.syntax ? (
              <View style={styles.syntaxBlock}>
                <Text style={styles.syntaxLabel}>Syntax:</Text>
                <Text style={styles.syntaxText}>{currentCard.syntax}</Text>
              </View>
            ) : null}
          </View>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.progress}>
          {index + 1}/{cards.length}
        </Text>

        <Pressable
          onPress={goToNext}
          style={({ pressed }) => [
            styles.nextButton,
            pressed && styles.nextButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={isLastCard ? "Finish review" : "Next card"}
        >
          {isLastCard ? <CloseIcon /> : <ArrowRightIcon />}
        </Pressable>
      </View>
    </View>
  );
};

export default Flashcard;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  heading: {
    fontFamily: "Nunito_900Black",
    fontSize: 32,
    fontWeight: "900",
    color: "#000000",
    textAlign: "center",
    marginTop: "20%",
  },
  subheading: {
    fontFamily: "Nunito_600SemiBold",
    fontWeight: 600,
    fontSize: 20,
    color: "#737373",
    textAlign: "center",
    marginTop: 6,
  },
  cardArea: {
    marginTop: 32,
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 21,
    backgroundColor: "#BE5AFF",
    overflow: "hidden",
    shadowColor: "#5B21B6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 5,
  },
  cardHeader: {
    backgroundColor: "#AF32FF",
    paddingVertical: 18,
    alignItems: "center",
  },
  cardHeaderText: {
    color: "#FFFFFF",
    fontFamily: "Nunito_900Black",
    fontSize: 30,
    fontWeight: "900",
  },
  cardBody: {
    paddingHorizontal: 24,
    paddingVertical: 28,
    minHeight: 300,
  },
  definition: {
    color: "#FFFFFF",
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 30,
  },
  syntaxBlock: {
    marginTop: 28,
  },
  syntaxLabel: {
    color: "#FFFFFF",
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 6,
  },
  syntaxText: {
    color: "#F4E9FF",
    fontFamily: "Nunito_500Medium",
    fontWeight: "500",
    fontSize: 20,
    fontFamily: "Courier",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "50%",
    maxWidth: 420,
    alignSelf: "center",
    marginTop: 20,
  },
  progress: {
    fontFamily: "Nunito_600SemiBold",
    fontWeight: "600",
    letterSpacing: 2,
    fontSize: 20,
    color: "#8A8194",
    textAlign: "center",
  },
  nextButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#A855F7",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7E22CE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonPressed: {
    opacity: 0.85,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    marginTop: "-20%",
    fontSize: 30,
    fontFamily: "Nunito_900Black",
    fontWeight: "900",
    color: "#000000",
    marginBottom: 15,
  },
  emptySubtitle: {
    fontFamily: "Nunito_600SemiBold",
    fontWeight: 600,
    fontSize: 20,
    color: "#737373",
    textAlign: "center",
  },
  primaryButtonBase: {
    width: "100%",
    height: 61,
    marginTop: 24,
    backgroundColor: "#7200B8",
    borderRadius: 22,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  primaryButton: {
    height: 54,
    width: "100%",
    backgroundColor: "#B42CFF",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ translateY: -7 }],
  },
  primaryButtonPressed: {
    backgroundColor: "#9D20E8",
    transform: [{ translateY: 0 }],
  },
  primaryButtonText: {
    fontFamily: "Nunito_900Black",
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
});