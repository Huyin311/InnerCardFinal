import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import * as Speech from "expo-speech";

const { width } = Dimensions.get("window");

// Dummy flashcard data với màu và ảnh minh họa
const flashcards = [
  {
    front: "IELTS",
    back: "International English Language Testing System",
    color: "#E8F1FF",
    image: require("../../assets/images/avatar.png"),
  },
  {
    front: "TOEFL",
    back: "Test of English as a Foreign Language",
    color: "#FFF4E4",
    image: require("../../assets/images/avatar.png"),
  },
  {
    front: "GRE",
    back: "Graduate Record Examination",
    color: "#FFEFF6",
    image: require("../../assets/images/avatar.png"),
  },
];

export default function Study() {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<number[]>([]);
  const [unknown, setUnknown] = useState<number[]>([]);
  const [starred, setStarred] = useState<number[]>([]);

  const animatedValue = useRef(new Animated.Value(0)).current;

  // Giúp hiệu ứng lật
  const flipCard = () => {
    if (!flipped) {
      Animated.spring(animatedValue, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 10,
      }).start();
      setFlipped(true);
    } else {
      Animated.spring(animatedValue, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 10,
      }).start();
      setFlipped(false);
    }
  };

  const handleNext = (isKnown: boolean) => {
    if (isKnown) setKnown([...known, current]);
    else setUnknown([...unknown, current]);
    // Reset hiệu ứng lật
    Animated.spring(animatedValue, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
      tension: 10,
    }).start();
    setFlipped(false);
    setCurrent((prev) => (prev + 1 < flashcards.length ? prev + 1 : 0));
  };

  // Đánh dấu từ quan trọng
  const toggleStar = () => {
    setStarred((prev) =>
      prev.includes(current)
        ? prev.filter((i) => i !== current)
        : [...prev, current],
    );
  };

  // Phát âm từ khóa
  const speak = (text: string) => {
    Speech.speak(text, { language: "en" });
  };

  if (flashcards.length === 0) {
    return (
      <View style={styles.center}>
        <Text>Không có flashcard nào để học.</Text>
      </View>
    );
  }

  const card = flashcards[current];

  // Card flip interpolation
  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });
  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Học Flashcard</Text>
      {/* Thanh tiến trình */}
      <View style={styles.progressBox}>
        <Text style={styles.progressText}>
          Thẻ {current + 1}/{flashcards.length}
        </Text>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${((current + 1) / flashcards.length) * 100}%`,
              },
            ]}
          />
        </View>
      </View>
      {/* Card flip */}
      <View style={{ alignItems: "center", marginBottom: 32 }}>
        <TouchableOpacity activeOpacity={0.95} onPress={flipCard}>
          <View>
            {/* Mặt trước */}
            <Animated.View
              style={[
                styles.card,
                {
                  backgroundColor: card.color,
                  transform: [{ rotateY: frontInterpolate }],
                  zIndex: !flipped ? 1 : 0,
                },
              ]}
            >
              <Image source={card.image} style={styles.cardImage} />
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={styles.cardText}>{card.front}</Text>
                <TouchableOpacity
                  onPress={() => speak(card.front)}
                  style={{ marginLeft: 10 }}
                >
                  <Ionicons name="volume-high" size={22} color="#3B5EFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={toggleStar}
                  style={{ marginLeft: 10 }}
                >
                  <FontAwesome
                    name={starred.includes(current) ? "star" : "star-o"}
                    size={22}
                    color={starred.includes(current) ? "#FFD600" : "#bfc8d6"}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.flipHint}>(Nhấn để lật mặt sau)</Text>
            </Animated.View>
            {/* Mặt sau */}
            <Animated.View
              style={[
                styles.card,
                styles.cardBack,
                {
                  backgroundColor: card.color,
                  position: "absolute",
                  top: 0,
                  left: 0,
                  transform: [{ rotateY: backInterpolate }],
                  zIndex: flipped ? 1 : 0,
                },
              ]}
            >
              <Image source={card.image} style={styles.cardImage} />
              <Text style={styles.cardText}>{card.back}</Text>
              <Text style={styles.flipHint}>(Nhấn để lật mặt trước)</Text>
            </Animated.View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#e74c3c" }]}
          onPress={() => handleNext(false)}
        >
          <Ionicons name="close" size={28} color="#fff" />
          <Text style={styles.btnLabel}>Chưa biết</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#2ecc71" }]}
          onPress={() => handleNext(true)}
        >
          <Ionicons name="checkmark" size={28} color="#fff" />
          <Text style={styles.btnLabel}>Đã biết</Text>
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={styles.progress}>
        <Text>
          Thẻ {current + 1}/{flashcards.length} | Đã biết: {known.length} | Chưa
          biết: {unknown.length}
        </Text>
        {starred.length > 0 && (
          <Text style={styles.starredWords}>
            ⭐ Đánh dấu: {starred.map((i) => flashcards[i].front).join(", ")}
          </Text>
        )}
      </View>
    </View>
  );
}

const CARD_WIDTH = width * 0.8;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 18,
    color: "#2C4BFF",
  },
  card: {
    width: CARD_WIDTH,
    minHeight: 200,
    backgroundColor: "#F7F8FB",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#222",
    shadowOpacity: 0.09,
    shadowRadius: 12,
    elevation: 3,
    padding: 28,
    backfaceVisibility: "hidden",
  },
  cardBack: { position: "absolute", top: 0 },
  cardImage: {
    width: 140,
    height: 140,
    borderRadius: 18,
    marginBottom: 18,
    resizeMode: "contain",
  },
  cardText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
    textAlign: "center",
  },
  flipHint: { color: "#aaa", marginTop: 16, fontSize: 13 },
  actions: { flexDirection: "row", marginTop: 16, marginBottom: 28 },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 28,
    marginHorizontal: 10,
  },
  btnLabel: { color: "#fff", fontWeight: "bold", fontSize: 16, marginLeft: 8 },
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
