import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  ActivityIndicator,
  Dimensions,
  PanResponder,
  StatusBar,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const MAIN_BG_COLOR = "#fffff9";
const fallbackImage = require("../../assets/images/avatar.png");
const PIXABAY_API_KEY = "32527145-1448acf0aed3630c8387734cf";
const CACHE_KEY = "flashcard_image_cache_v1";

const CARD_COLORS = [
  "#eaf1fa",
  "#F3E9E1",
  "#FEF9E7",
  "#E9F7EF",
  "#F0F4C3",
  "#FFF4E4",
  "#E1ECF7",
  "#FFD6E0",
  "#F8C471",
  "#E8F1FF",
];

type Flashcard = {
  front: string;
  partOfSpeech?: string;
  phonetic?: string;
  back: string;
  example?: string;
};

const flashcards: Flashcard[] = [
  {
    front: "Coffee",
    partOfSpeech: "noun",
    phonetic: "/ˈkɒf.i/",
    back: "Cà phê",
    example: "I'd like a cup of coffee, please.",
  },
  {
    front: "Bicycle",
    partOfSpeech: "noun",
    phonetic: "/ˈbaɪ.sɪ.kəl/",
    back: "Xe đạp",
    example: "He rides his bicycle to school every day.",
  },
  {
    front: "Rain",
    partOfSpeech: "noun",
    phonetic: "/reɪn/",
    back: "Mưa",
    example: "The rain is very heavy today.",
  },
  {
    front: "Market",
    partOfSpeech: "noun",
    phonetic: "/ˈmɑː.kɪt/",
    back: "Chợ",
    example: "She bought fresh fruit at the market.",
  },
  {
    front: "Cat",
    partOfSpeech: "noun",
    phonetic: "/kæt/",
    back: "Mèo",
    example: "The cat is sleeping on the sofa.",
  },
  {
    front: "Book",
    partOfSpeech: "noun",
    phonetic: "/bʊk/",
    back: "Sách",
    example: "She is reading an interesting book.",
  },
  {
    front: "Teacher",
    partOfSpeech: "noun",
    phonetic: "/ˈtiː.tʃər/",
    back: "Giáo viên",
    example: "The teacher explains the lesson clearly.",
  },
  {
    front: "Hospital",
    partOfSpeech: "noun",
    phonetic: "/ˈhɒs.pɪ.təl/",
    back: "Bệnh viện",
    example: "She works in a hospital.",
  },
  {
    front: "Music",
    partOfSpeech: "noun",
    phonetic: "/ˈmjuː.zɪk/",
    back: "Âm nhạc",
    example: "He listens to music every night.",
  },
  {
    front: "Sunflower",
    partOfSpeech: "noun",
    phonetic: "/ˈsʌnˌflaʊ.ər/",
    back: "Hoa hướng dương",
    example: "A sunflower follows the sun.",
  },
];

const CARD_WIDTH = width * 0.83;
const CARD_HEIGHT = 360;
const SWIPE_THRESHOLD = CARD_WIDTH * 0.27;

export default function Study() {
  const [current, setCurrent] = useState<number>(0);
  const [flipped, setFlipped] = useState<boolean>(false);
  const [known, setKnown] = useState<number[]>([]);
  const [unknown, setUnknown] = useState<number[]>([]);
  const [starred, setStarred] = useState<number[]>([]);
  const [imageCache, setImageCache] = useState<{ [key: string]: string }>({});
  const [loadingImage, setLoadingImage] = useState<boolean>(false);

  const [feedback, setFeedback] = useState<null | "known" | "unknown">(null);
  const [swiping, setSwiping] = useState<boolean>(false);
  const [swipeFeedback, setSwipeFeedback] = useState<
    null | "known" | "unknown"
  >(null);

  // Flip animation
  const flipAnim = useRef(new Animated.Value(0)).current;
  // Swipe animation
  const swipeAnim = useRef(new Animated.ValueXY()).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  // History stack (for "previous card" feature)
  const [historyStack, setHistoryStack] = useState<number[]>([]);

  const totalCards = flashcards.length;
  const isDone = current >= totalCards;
  const card: Flashcard | undefined = !isDone ? flashcards[current] : undefined;
  const getCardColor = (idx: number) => CARD_COLORS[idx % CARD_COLORS.length];
  const cardBgColor = getCardColor(current);

  // Flip interpolate
  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  useEffect(() => {
    setFlipped(false);
    Animated.timing(flipAnim, {
      toValue: 0,
      useNativeDriver: true,
      duration: 160,
    }).start();
  }, [current]);

  useEffect(() => {
    (async () => {
      try {
        const cacheStr = await AsyncStorage.getItem(CACHE_KEY);
        if (cacheStr) setImageCache(JSON.parse(cacheStr));
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!card) return;
    let isMounted = true;
    const word = card.front?.trim().toLowerCase();
    if (!word || imageCache[word]) return;
    setLoadingImage(true);
    fetch(
      `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(
        word,
      )}&image_type=photo&per_page=5&safesearch=true`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        let url = "";
        if (data.hits && data.hits.length > 0) {
          url = data.hits[0].webformatURL || data.hits[0].previewURL;
        }
        const newCache = { ...imageCache, [word]: url };
        setImageCache(newCache);
        AsyncStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
        setLoadingImage(false);
      })
      .catch(() => {
        if (isMounted) setLoadingImage(false);
      });
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  // Flip logic
  const flipCard = () => {
    if (isDone || swiping) return;
    if (!flipped) {
      Animated.spring(flipAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 10,
      }).start();
      setFlipped(true);
    } else {
      Animated.spring(flipAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 10,
      }).start();
      setFlipped(false);
    }
  };

  // Swipe logic
  const animateOutAndNext = (direction: "known" | "unknown") => {
    setFeedback(direction);
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(swipeAnim, {
        toValue: {
          x: direction === "known" ? -CARD_WIDTH * 1.3 : CARD_WIDTH * 1.3,
          y: 0,
        },
        duration: 230,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        setFeedback(null);
        setSwipeFeedback(null);
        opacityAnim.setValue(1);
        swipeAnim.setValue({ x: 0, y: 0 });
        setFlipped(false);
        flipAnim.setValue(0);
        if (direction === "known") setKnown((arr) => [...arr, current]);
        else setUnknown((arr) => [...arr, current]);
        // Push the current card index to historyStack
        setHistoryStack((stack) => [...stack, current]);
        setCurrent((prev) => prev + 1);
      }, 120);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        !isDone &&
        !swiping &&
        Math.abs(gesture.dx) > 10 &&
        Math.abs(gesture.dy) < 80,
      onPanResponderGrant: () => setSwiping(true),
      onPanResponderMove: (_, gesture) => {
        swipeAnim.setValue({ x: gesture.dx, y: gesture.dy });
        if (gesture.dx < -SWIPE_THRESHOLD) setSwipeFeedback("known");
        else if (gesture.dx > SWIPE_THRESHOLD) setSwipeFeedback("unknown");
        else setSwipeFeedback(null);
      },
      onPanResponderRelease: (_, gesture) => {
        setSwiping(false);
        if (!isDone && gesture.dx < -SWIPE_THRESHOLD) {
          setSwipeFeedback("known");
          animateOutAndNext("known");
        } else if (!isDone && gesture.dx > SWIPE_THRESHOLD) {
          setSwipeFeedback("unknown");
          animateOutAndNext("unknown");
        } else {
          setSwipeFeedback(null);
          Animated.spring(swipeAnim, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  // Go back to the previous card (step-back, not first)
  const goBack = () => {
    if (historyStack.length === 0) return;
    const lastIndex = historyStack.length - 1;
    const prev = historyStack[lastIndex];
    setHistoryStack((stack) => stack.slice(0, lastIndex));
    setCurrent(prev);
    setFlipped(false);
    flipAnim.setValue(0);
    swipeAnim.setValue({ x: 0, y: 0 });
    opacityAnim.setValue(1);
    setFeedback(null);
    setSwiping(false);
    setSwipeFeedback(null);
  };

  // TS safe get imageUrl
  let imageUrl: { uri: string } | number = fallbackImage;
  if (card && card.front) {
    const word = card.front.trim().toLowerCase();
    if (word && imageCache[word]) {
      imageUrl = imageCache[word] ? { uri: imageCache[word] } : fallbackImage;
    }
  }

  // Overlays
  const feedbackOverlay = feedback ? (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        styles.animatedOverlay,
        {
          backgroundColor: feedback === "known" ? "#2ecc71" : "#e74c3c",
          opacity: 0.93,
        },
      ]}
    >
      <Text style={styles.overlayText}>
        {feedback === "known" ? "ĐÃ BIẾT" : "CHƯA BIẾT"}
      </Text>
    </Animated.View>
  ) : null;

  const swipeOverlay =
    swipeFeedback && !feedback ? (
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.animatedOverlay,
          {
            backgroundColor: swipeFeedback === "known" ? "#2ecc71" : "#e74c3c",
            opacity: 0.86,
          },
        ]}
      >
        <Text style={styles.overlayText}>
          {swipeFeedback === "known" ? "ĐÃ BIẾT" : "CHƯA BIẾT"}
        </Text>
      </Animated.View>
    ) : null;

  if (isDone) {
    return (
      <View style={[styles.bg, { backgroundColor: MAIN_BG_COLOR }]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.container}>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <View style={styles.doneCardWrap}>
              <Ionicons
                name="checkmark-circle"
                size={80}
                color="#2ecc71"
                style={{ marginBottom: 16 }}
              />
              <Text
                style={{
                  fontSize: 26,
                  fontWeight: "bold",
                  color: "#2ecc71",
                  marginBottom: 6,
                }}
              >
                Chúc mừng!
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  color: "#222",
                  fontWeight: "600",
                  marginBottom: 24,
                }}
              >
                Bạn đã học xong tất cả {totalCards} thẻ
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 24,
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{ fontSize: 17, color: "#27ae60", fontWeight: "bold" }}
                >
                  Đã biết: {known.length}
                </Text>
                <Text
                  style={{ fontSize: 17, color: "#e74c3c", fontWeight: "bold" }}
                >
                  Chưa biết: {unknown.length}
                </Text>
              </View>
              {starred.length > 0 && (
                <Text
                  style={{
                    fontSize: 15,
                    color: "#FFD600",
                    marginTop: 0,
                    fontWeight: "bold",
                    marginBottom: 10,
                  }}
                >
                  ⭐ Đánh dấu:{" "}
                  {starred.map((i) => flashcards[i].front).join(", ")}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={[
                styles.bottomBackBtn,
                historyStack.length === 0 && { opacity: 0.3 },
              ]}
              onPress={goBack}
              disabled={historyStack.length === 0}
            >
              <Ionicons name="chevron-back" size={26} color="#fff" />
              <Text style={styles.btnLabel}>Quay lại thẻ trước</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (flashcards.length === 0) {
    return (
      <View style={styles.center}>
        <Text>Không có flashcard nào để học.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.bg, { backgroundColor: MAIN_BG_COLOR }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.title}>Học Flashcard ({totalCards} thẻ)</Text>
        {/* Thanh tiến trình */}
        <View style={styles.progressBox}>
          <Text style={styles.progressText}>
            Thẻ {current + 1}/{totalCards}
          </Text>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${((current + 1) / totalCards) * 100}%`,
                },
              ]}
            />
          </View>
        </View>
        {/* Card swipe + flip + feedback overlay */}
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <Animated.View
            {...(!isDone ? panResponder.panHandlers : {})}
            style={[
              styles.cardCommon,
              {
                opacity: opacityAnim,
                transform: [
                  { translateX: swipeAnim.x },
                  { translateY: swipeAnim.y },
                  {
                    scale: swipeAnim.x.interpolate({
                      inputRange: [-CARD_WIDTH, 0, CARD_WIDTH],
                      outputRange: [0.95, 1, 0.95],
                      extrapolate: "clamp",
                    }),
                  },
                  {
                    rotate: swipeAnim.x.interpolate({
                      inputRange: [-CARD_WIDTH, 0, CARD_WIDTH],
                      outputRange: ["-14deg", "0deg", "14deg"],
                      extrapolate: "clamp",
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Mặt trước */}
            <Animated.View
              style={[
                styles.cardFace,
                {
                  transform: [{ rotateY: frontInterpolate }],
                  zIndex: !flipped ? 2 : 0,
                },
              ]}
              pointerEvents={!flipped ? "auto" : "none"}
            >
              {/* Nền thẻ lật cùng nội dung */}
              <View
                style={[
                  StyleSheet.absoluteFillObject,
                  { backgroundColor: cardBgColor, borderRadius: 24 },
                ]}
              />
              <TouchableOpacity
                activeOpacity={0.96}
                onPress={flipCard}
                style={{ flex: 1, zIndex: 3, width: "100%" }}
                disabled={swiping || isDone}
              >
                <TouchableOpacity
                  style={styles.starTopLeft}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    setStarred((prev) =>
                      prev.includes(current)
                        ? prev.filter((i) => i !== current)
                        : [...prev, current],
                    );
                  }}
                >
                  <FontAwesome
                    name={starred.includes(current) ? "star" : "star-o"}
                    size={26}
                    color={starred.includes(current) ? "#FFD600" : "#bfc8d6"}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.speakerTopRight}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    if (card && card.front)
                      Speech.speak(card.front, { language: "en" });
                  }}
                >
                  <Ionicons name="volume-high" size={26} color="#3B5EFF" />
                </TouchableOpacity>
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={styles.cardFrontVocab}>{card?.front ?? ""}</Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 6,
                    }}
                  >
                    {card && card.partOfSpeech && (
                      <Text style={styles.cardFrontPOS}>
                        {card.partOfSpeech}
                      </Text>
                    )}
                    {card && card.phonetic && (
                      <Text style={styles.cardFrontPhonetic}>
                        {"  "}
                        {card.phonetic}
                      </Text>
                    )}
                  </View>
                </View>
                {/*<Text style={styles.flipHintFront}>(Nhấn để lật mặt sau)</Text>*/}
              </TouchableOpacity>
            </Animated.View>
            {/* Mặt sau */}
            <Animated.View
              style={[
                styles.cardFace,
                {
                  transform: [{ rotateY: backInterpolate }],
                  zIndex: flipped ? 2 : 0,
                },
              ]}
              pointerEvents={flipped ? "auto" : "none"}
            >
              {/* Nền thẻ lật cùng nội dung */}
              <View
                style={[
                  StyleSheet.absoluteFillObject,
                  { backgroundColor: cardBgColor, borderRadius: 24 },
                ]}
              />
              <TouchableOpacity
                activeOpacity={0.96}
                onPress={flipCard}
                style={{ flex: 1, zIndex: 3, width: "100%" }}
                disabled={swiping || isDone}
              >
                {/* Speaker example button top-right */}
                <TouchableOpacity
                  style={styles.speakerTopRight}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    if (card && card.example)
                      Speech.speak(card.example, { language: "en" });
                  }}
                >
                  <Ionicons name="volume-high" size={26} color="#3B5EFF" />
                </TouchableOpacity>
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {loadingImage ? (
                    <View
                      style={{
                        width: 140,
                        height: 140,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <ActivityIndicator size="large" color="#3B5EFF" />
                    </View>
                  ) : (
                    <Image source={imageUrl} style={styles.cardImage} />
                  )}
                  <Text style={styles.cardBackMeaning}>{card?.back ?? ""}</Text>
                  {card && card.example && (
                    <Text style={styles.cardBackExample}>{card.example}</Text>
                  )}
                </View>
                {/*<Text style={styles.flipHintBack}>(Nhấn để lật mặt trước)</Text>*/}
              </TouchableOpacity>
            </Animated.View>
            {swipeOverlay}
            {feedbackOverlay}
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 18,
    color: "#2C4BFF",
  },
  cardCommon: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    shadowColor: "#222",
    shadowOpacity: 0.09,
    shadowRadius: 12,
    elevation: 3,
    padding: 0,
    overflow: "visible",
    backfaceVisibility: "hidden",
  },
  cardFace: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 0,
    left: 0,
    padding: 28,
    backfaceVisibility: "hidden",
    overflow: "hidden",
  },
  cardImage: {
    width: 140,
    height: 140,
    borderRadius: 18,
    marginBottom: 18,
    resizeMode: "contain",
  },
  cardFrontVocab: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#2C4BFF",
    textAlign: "center",
    marginBottom: 6,
  },
  cardFrontPOS: {
    fontSize: 19,
    color: "#444",
    fontWeight: "bold",
    marginRight: 8,
  },
  cardFrontPhonetic: {
    fontSize: 18,
    color: "#888",
    fontStyle: "italic",
  },
  cardBackMeaning: {
    fontSize: 26,
    color: "#2C4BFF",
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 12,
    textAlign: "center",
  },
  cardBackExample: {
    fontSize: 16,
    color: "#333",
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 8,
  },
  flipHintFront: {
    color: "#aaa",
    fontSize: 13,
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    textAlign: "center",
  },
  flipHintBack: {
    color: "#aaa",
    fontSize: 13,
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    textAlign: "center",
  },
  starTopLeft: {
    position: "absolute",
    top: 14,
    left: 18,
    zIndex: 10,
    padding: 5,
  },
  speakerTopRight: {
    position: "absolute",
    top: 14,
    right: 18,
    zIndex: 10,
    padding: 5,
  },
  animatedOverlay: {
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99,
    flex: 1,
  },
  overlayText: {
    fontSize: 40,
    color: "#fff",
    fontWeight: "bold",
    textShadowColor: "#0008",
    textShadowRadius: 8,
    textShadowOffset: { width: 0, height: 2 },
    marginTop: 0,
    marginBottom: 0,
    letterSpacing: 2,
  },
  bottomBackBtn: {
    position: "absolute",
    left: 28,
    bottom: 36,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B5EFF",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 2 },
  },
  btnLabel: { color: "#fff", fontWeight: "bold", fontSize: 16, marginLeft: 8 },
  doneCardWrap: {
    width: CARD_WIDTH,
    minHeight: CARD_HEIGHT * 0.83,
    backgroundColor: "#fff",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#222",
    shadowOpacity: 0.09,
    shadowRadius: 12,
    elevation: 3,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    marginBottom: 24,
  },
  progress: { marginTop: 10, alignItems: "center" },
  progressBox: {
    marginTop: 2,
    marginBottom: 16,
    alignItems: "center",
  },
  progressText: {
    fontSize: 15,
    color: "#3B5EFF",
    fontWeight: "600",
    marginBottom: 5,
  },
  progressBarBg: {
    height: 7,
    width: width * 0.6,
    backgroundColor: "#eee",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 7,
    backgroundColor: "#3B5EFF",
    borderRadius: 10,
  },
  starredWords: {
    color: "#FFD600",
    fontSize: 15,
    marginTop: 6,
    fontWeight: "bold",
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
