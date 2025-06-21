import React, { useState, useRef, useEffect, useCallback } from "react";
import { useFocusEffect, RouteProp, useRoute } from "@react-navigation/native";
// ...phần còn lại giữ nguyên

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
import { useDarkMode } from "../../app/DarkModeContext";
import { useLanguage } from "../../app/LanguageContext";
import { lightTheme, darkTheme } from "../../app/theme";
import { supabase } from "../../supabase/supabaseClient";

// Responsive helpers
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;

const fallbackImage = require("../../assets/images/avatar.png");
const PIXABAY_API_KEY = "32527145-1448acf0aed3630c8387734cf";
const CACHE_KEY = "flashcard_image_cache_v1";

const CARD_COLORS_LIGHT = [
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
const CARD_COLORS_DARK = [
  "#283043",
  "#3b3a3a",
  "#4c4541",
  "#2d4338",
  "#494d2d",
  "#4c4739",
  "#394252",
  "#472d3d",
  "#49422d",
  "#2e3e4c",
];

const TEXT = {
  title: { vi: "Học Flashcard", en: "Study Flashcards" },
  card: { vi: "thẻ", en: "cards" },
  known: { vi: "ĐÃ BIẾT", en: "KNOWN" },
  unknown: { vi: "CHƯA BIẾT", en: "UNKNOWN" },
  congratulations: { vi: "Chúc mừng!", en: "Congratulations!" },
  finished: {
    vi: "Bạn đã học xong tất cả",
    en: "You finished all",
  },
  star: { vi: "⭐ Đánh dấu:", en: "⭐ Starred:" },
  noCard: {
    vi: "Không có flashcard nào để học.",
    en: "No flashcards to study.",
  },
  back: { vi: "Quay lại thẻ trước", en: "Previous card" },
  progress: { vi: "Thẻ", en: "Card" },
  knownCount: { vi: "Đã biết", en: "Known" },
  unknownCount: { vi: "Chưa biết", en: "Unknown" },
};

type Flashcard = {
  front: string;
  partOfSpeech?: string;
  phonetic?: string;
  back: string;
  example?: string;
};

const flashcards: Flashcard[] = [
  {
    front: "Sunflower",
    partOfSpeech: "noun",
    phonetic: "/ˈsʌnˌflaʊ.ər/",
    back: "Hoa hướng dương",
    example: "A sunflower follows the sun.",
  },
]; // khi vào màn hình này hãy lấy data từ supabase để nạp vào mảng này

const CARD_WIDTH = SCREEN_WIDTH * 0.83;
const CARD_HEIGHT = scale(360);
const SWIPE_THRESHOLD = CARD_WIDTH * 0.27;

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function Study() {
  const route =
    useRoute<
      RouteProp<{ params: { deckId?: number; userId?: string } }, "params">
    >();
  const deckId = route.params?.deckId;
  const userId = route.params?.userId;
  const [, forceUpdate] = useState({});

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
  const [pendingClearFeedback, setPendingClearFeedback] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const [isCardEntering, setIsCardEntering] = useState(true);
  const popAnim = useRef(new Animated.Value(1)).current;
  const flipAnim = useRef(new Animated.Value(0)).current;
  const swipeAnim = useRef(new Animated.ValueXY()).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const [historyStack, setHistoryStack] = useState<number[]>([]);
  const [showCard, setShowCard] = useState(true);

  const { darkMode } = useDarkMode();
  const { lang } = useLanguage();
  const theme = darkMode ? darkTheme : lightTheme;
  const CARD_COLORS = darkMode ? CARD_COLORS_DARK : CARD_COLORS_LIGHT;
  const MAIN_BG_COLOR = theme.background;

  // Fetch flashcards only ONCE when deckId or userId changes
  useFocusEffect(
    useCallback(() => {
      let ignore = false;
      async function load() {
        setCurrent(0);
        setFlipped(false);
        setKnown([]);
        setUnknown([]);
        setStarred([]);
        setHistoryStack([]);
        setShowCard(true);
        if (userId) {
          const { data, error } = await supabase
            .from("cards")
            .select("front_text, back_text, part_of_speech, phonetic, example");
          if (!ignore && data && Array.isArray(data) && data.length > 0) {
            const shuffled = shuffleArray(
              data.map((c: any) => ({
                front: c.front_text,
                back: c.back_text,
                partOfSpeech: c.part_of_speech,
                phonetic: c.phonetic,
                example: c.example,
              })),
            );
            flashcards.splice(0, flashcards.length, ...shuffled);
            setCurrent(0);
            forceUpdate({});
          }
        } else if (deckId) {
          const { data, error } = await supabase
            .from("cards")
            .select("front_text, back_text, part_of_speech, phonetic, example")
            .eq("deck_id", deckId)
            .order("id");
          if (!ignore && data && Array.isArray(data) && data.length > 0) {
            flashcards.splice(
              0,
              flashcards.length,
              ...data.map((c: any) => ({
                front: c.front_text,
                back: c.back_text,
                partOfSpeech: c.part_of_speech,
                phonetic: c.phonetic,
                example: c.example,
              })),
            );
            setCurrent(0);
            forceUpdate({});
          }
        }
      }
      load();
      return () => {
        ignore = true;
      };
    }, [deckId, userId]),
  );

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
    setSwipeFeedback(null);
    Animated.timing(flipAnim, {
      toValue: 0,
      useNativeDriver: true,
      duration: 160,
    }).start();
    setIsCardEntering(true);
  }, [current]);

  useEffect(() => {
    if (!isCardEntering) return;
    popAnim.setValue(0.75);
    Animated.spring(popAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 7,
      tension: 60,
    }).start(() => setIsCardEntering(false));
  }, [isCardEntering, popAnim]);

  useEffect(() => {
    const id = swipeAnim.x.addListener(({ value }) => setSwipeX(value));
    return () => {
      swipeAnim.x.removeListener(id);
    };
  }, [swipeAnim.x]);

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
    setPendingClearFeedback(true);
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
      setShowCard(false);
      setTimeout(() => {
        opacityAnim.setValue(1);
        swipeAnim.setValue({ x: 0, y: 0 });
        setFlipped(false);
        flipAnim.setValue(0);
        setFeedback(null);
        setSwipeFeedback(null);

        if (direction === "known") setKnown((arr) => [...arr, current]);
        else setUnknown((arr) => [...arr, current]);
        setHistoryStack((stack) => [...stack, current]);
        setCurrent((prev) => prev + 1);
        setShowCard(true);
        setIsCardEntering(true);
      }, 0);
    });
  };

  useEffect(() => {
    if (!pendingClearFeedback) return;
    const id = swipeAnim.x.addListener(({ value }) => {
      if (Math.abs(value) < 1) {
        setFeedback(null);
        setPendingClearFeedback(false);
        swipeAnim.x.removeListener(id);
      }
    });
    return () => swipeAnim.x.removeListener(id);
  }, [pendingClearFeedback, swipeAnim.x]);

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
    setIsCardEntering(true);
  };

  let imageUrl: { uri: string } | number = fallbackImage;
  if (card && card.front) {
    const word = card.front.trim().toLowerCase();
    if (word && imageCache[word]) {
      imageUrl = imageCache[word] ? { uri: imageCache[word] } : fallbackImage;
    }
  }

  // Overlays
  const feedbackOverlay =
    feedback && !swiping && Math.abs(swipeX) < 1 ? (
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
          {feedback === "known" ? TEXT.known[lang] : TEXT.unknown[lang]}
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
          {swipeFeedback === "known" ? TEXT.known[lang] : TEXT.unknown[lang]}
        </Text>
      </Animated.View>
    ) : null;

  if (isDone) {
    return (
      <View style={[styles.bg, { backgroundColor: MAIN_BG_COLOR }]}>
        <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
        <View style={styles.container}>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <View
              style={[
                styles.doneCardWrap,
                { backgroundColor: theme.card, shadowColor: theme.text },
              ]}
            >
              <Ionicons
                name="checkmark-circle"
                size={scale(80)}
                color="#2ecc71"
                style={{ marginBottom: scale(16) }}
              />
              <Text
                style={{
                  fontSize: scale(26),
                  fontWeight: "bold",
                  color: "#2ecc71",
                  marginBottom: scale(6),
                }}
              >
                {TEXT.congratulations[lang]}
              </Text>
              <Text
                style={{
                  fontSize: scale(20),
                  color: theme.text,
                  fontWeight: "600",
                  marginBottom: scale(24),
                }}
              >
                {TEXT.finished[lang]} {totalCards} {TEXT.card[lang]}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: scale(24),
                  marginBottom: scale(10),
                }}
              >
                <Text
                  style={{
                    fontSize: scale(17),
                    color: "#27ae60",
                    fontWeight: "bold",
                  }}
                >
                  {TEXT.knownCount[lang]}: {known.length}
                </Text>
                <Text
                  style={{
                    fontSize: scale(17),
                    color: "#e74c3c",
                    fontWeight: "bold",
                  }}
                >
                  {TEXT.unknownCount[lang]}: {unknown.length}
                </Text>
              </View>
              {starred.length > 0 && (
                <Text
                  style={{
                    fontSize: scale(15),
                    color: "#FFD600",
                    marginTop: 0,
                    fontWeight: "bold",
                    marginBottom: scale(10),
                  }}
                >
                  {TEXT.star[lang]}{" "}
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
              <Ionicons name="chevron-back" size={scale(26)} color="#fff" />
              <Text style={styles.btnLabel}>{TEXT.back[lang]}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (flashcards.length === 0) {
    return (
      <View style={styles.center}>
        <Text>{TEXT.noCard[lang]}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.bg, { backgroundColor: MAIN_BG_COLOR }]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.primary }]}>
          {TEXT.title[lang]} ({totalCards} {TEXT.card[lang]})
        </Text>
        <View style={styles.progressBox}>
          <Text style={[styles.progressText, { color: theme.primary }]}>
            {TEXT.progress[lang]} {current + 1}/{totalCards}
          </Text>
          <View
            style={[styles.progressBarBg, { backgroundColor: theme.section }]}
          >
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${((current + 1) / totalCards) * 100}%`,
                  backgroundColor: theme.primary,
                },
              ]}
            />
          </View>
        </View>
        <View style={{ alignItems: "center", marginBottom: scale(32) }}>
          {showCard ? (
            <Animated.View
              {...(!isDone ? panResponder.panHandlers : {})}
              style={[
                styles.cardCommon,
                {
                  opacity: opacityAnim,
                  transform: [
                    { scale: popAnim },
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
                <View
                  style={[
                    StyleSheet.absoluteFillObject,
                    { backgroundColor: cardBgColor, borderRadius: scale(24) },
                  ]}
                />
                <TouchableOpacity
                  activeOpacity={0.96}
                  onPress={flipCard}
                  style={{ flex: 1, zIndex: 3, width: "100%" }}
                  disabled={swiping || isDone}
                >
                  <TouchableOpacity
                    style={styles.speakerTopRight}
                    onPress={(e) => {
                      e.stopPropagation?.();
                      if (card && card.front)
                        Speech.speak(card.front, { language: "en" });
                    }}
                  >
                    <Ionicons
                      name="volume-high"
                      size={scale(26)}
                      color={theme.primary}
                    />
                  </TouchableOpacity>
                  <View
                    style={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={[styles.cardFrontVocab, { color: theme.primary }]}
                    >
                      {card?.front ?? ""}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: scale(6),
                      }}
                    >
                      {card && card.partOfSpeech && (
                        <Text
                          style={[styles.cardFrontPOS, { color: theme.text }]}
                        >
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
                <View
                  style={[
                    StyleSheet.absoluteFillObject,
                    { backgroundColor: cardBgColor, borderRadius: scale(24) },
                  ]}
                />
                <TouchableOpacity
                  activeOpacity={0.96}
                  onPress={flipCard}
                  style={{ flex: 1, zIndex: 3, width: "100%" }}
                  disabled={swiping || isDone}
                >
                  <TouchableOpacity
                    style={styles.speakerTopRight}
                    onPress={(e) => {
                      e.stopPropagation?.();
                      if (card && card.example)
                        Speech.speak(card.example, { language: "en" });
                    }}
                  >
                    <Ionicons
                      name="volume-high"
                      size={scale(26)}
                      color={theme.primary}
                    />
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
                          width: scale(140),
                          height: scale(140),
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <ActivityIndicator size="large" color={theme.primary} />
                      </View>
                    ) : (
                      <Image source={imageUrl} style={styles.cardImage} />
                    )}
                    <Text
                      style={[styles.cardBackMeaning, { color: theme.primary }]}
                    >
                      {card?.back ?? ""}
                    </Text>
                    {card && card.example && (
                      <Text
                        style={[styles.cardBackExample, { color: theme.text }]}
                      >
                        {card.example}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>
              {swipeOverlay}
              {feedbackOverlay}
            </Animated.View>
          ) : (
            <View style={{ height: CARD_HEIGHT, width: CARD_WIDTH }} />
          )}
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
    fontSize: scale(28),
    fontWeight: "bold",
    marginBottom: scale(18),
  },
  cardCommon: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: scale(24),
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    shadowColor: "#222",
    shadowOpacity: 0.09,
    shadowRadius: scale(12),
    elevation: 3,
    padding: 0,
    overflow: "visible",
    backfaceVisibility: "hidden",
  },
  cardFace: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: scale(24),
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 0,
    left: 0,
    padding: scale(28),
    backfaceVisibility: "hidden",
    overflow: "hidden",
  },
  cardImage: {
    width: scale(140),
    height: scale(140),
    borderRadius: scale(18),
    marginBottom: scale(18),
    resizeMode: "contain",
  },
  cardFrontVocab: {
    fontSize: scale(30),
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: scale(6),
  },
  cardFrontPOS: {
    fontSize: scale(19),
    fontWeight: "bold",
    marginRight: scale(8),
  },
  cardFrontPhonetic: {
    fontSize: scale(18),
    color: "#888",
    fontStyle: "italic",
  },
  cardBackMeaning: {
    fontSize: scale(26),
    fontWeight: "bold",
    marginTop: scale(8),
    marginBottom: scale(12),
    textAlign: "center",
  },
  cardBackExample: {
    fontSize: scale(16),
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: scale(8),
  },
  flipHintFront: {
    color: "#aaa",
    fontSize: scale(13),
    position: "absolute",
    bottom: scale(16),
    left: 0,
    right: 0,
    textAlign: "center",
  },
  flipHintBack: {
    color: "#aaa",
    fontSize: scale(13),
    position: "absolute",
    bottom: scale(16),
    left: 0,
    right: 0,
    textAlign: "center",
  },
  starTopLeft: {
    position: "absolute",
    top: scale(14),
    left: scale(18),
    zIndex: 10,
    padding: scale(5),
  },
  speakerTopRight: {
    position: "absolute",
    top: scale(14),
    right: scale(18),
    zIndex: 10,
    padding: scale(5),
  },
  animatedOverlay: {
    borderRadius: scale(28),
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99,
    flex: 1,
  },
  overlayText: {
    fontSize: scale(40),
    color: "#fff",
    fontWeight: "bold",
    textShadowColor: "#0008",
    textShadowRadius: scale(8),
    textShadowOffset: { width: 0, height: 2 },
    marginTop: 0,
    marginBottom: 0,
    letterSpacing: 2,
  },
  bottomBackBtn: {
    position: "absolute",
    left: scale(28),
    bottom: scale(36),
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B5EFF",
    borderRadius: scale(22),
    paddingHorizontal: scale(16),
    paddingVertical: scale(10),
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: scale(7),
    shadowOffset: { width: 0, height: 2 },
  },
  btnLabel: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: scale(16),
    marginLeft: scale(8),
  },
  doneCardWrap: {
    width: CARD_WIDTH,
    minHeight: CARD_HEIGHT * 0.83,
    borderRadius: scale(28),
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.09,
    shadowRadius: scale(12),
    elevation: 3,
    paddingHorizontal: scale(24),
    paddingTop: scale(32),
    paddingBottom: scale(24),
    marginBottom: scale(24),
  },
  progress: { marginTop: scale(10), alignItems: "center" },
  progressBox: {
    marginTop: scale(2),
    marginBottom: scale(16),
    alignItems: "center",
  },
  progressText: {
    fontSize: scale(15),
    fontWeight: "600",
    marginBottom: scale(5),
  },
  progressBarBg: {
    height: scale(7),
    width: SCREEN_WIDTH * 0.6,
    borderRadius: scale(10),
    overflow: "hidden",
  },
  progressBarFill: {
    height: scale(7),
    borderRadius: scale(10),
  },
  starredWords: {
    color: "#FFD600",
    fontSize: scale(15),
    marginTop: scale(6),
    fontWeight: "bold",
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
