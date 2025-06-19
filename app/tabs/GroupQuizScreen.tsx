import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;

type Flashcard = {
  id: string;
  front: string;
  back: string;
  example: string;
  phonetic: string;
  partOfSpeech: string;
  image?: string;
};

type Quiz = {
  id: string;
  title: string;
  flashcards: Flashcard[];
};

const isAdmin = true;

const DUMMY_QUIZZES: Quiz[] = [
  {
    id: "1",
    title: "Quiz IELTS Vocabulary",
    flashcards: [
      {
        id: "1",
        front: "abandon",
        back: "từ bỏ",
        example: "She abandoned the project.",
        phonetic: "/əˈbæn.dən/",
        partOfSpeech: "verb",
        image: "",
      },
      {
        id: "2",
        front: "benefit",
        back: "lợi ích",
        example: "There are many benefits to exercise.",
        phonetic: "/ˈben.ɪ.fɪt/",
        partOfSpeech: "noun",
        image: "",
      },
    ],
  },
];

export default function GroupQuizScreen() {
  const navigation = useNavigation<any>();
  const [quizzes, setQuizzes] = useState<Quiz[]>(DUMMY_QUIZZES);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Bài kiểm tra từ vựng</Text>
        {isAdmin && (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("GroupQuizCreateScreen", {
                addQuiz: (quiz: Quiz) => setQuizzes((qzs) => [...qzs, quiz]),
              })
            }
            style={styles.headerBtn}
          >
            <Ionicons
              name="add-circle-outline"
              size={scale(24)}
              color="#4F8CFF"
            />
            <Text
              style={{ color: "#4F8CFF", marginLeft: 6, fontWeight: "bold" }}
            >
              Tạo
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={quizzes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: scale(18), paddingBottom: scale(80) }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.quizCard}
            onPress={() =>
              navigation.navigate("GroupQuizDetailScreen", { quiz: item })
            }
            activeOpacity={0.85}
          >
            <Ionicons
              name="book-outline"
              size={scale(32)}
              color="#2C4BFF"
              style={{ marginRight: scale(14) }}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.quizName}>{item.title}</Text>
              <Text style={styles.quizMeta}>
                Số thẻ: {item.flashcards.length}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={scale(22)} color="#bbb" />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 40, color: "#888" }}>
            Chưa có bài kiểm tra nào
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9FC" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(18),
    paddingTop: scale(16),
    paddingBottom: scale(8),
    backgroundColor: "#fff",
    borderBottomWidth: 0.5,
    borderBottomColor: "#E4EAF2",
    justifyContent: "space-between",
  },
  title: {
    fontSize: scale(22),
    fontWeight: "bold",
    color: "#2C4BFF",
  },
  headerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6ECFF",
    borderRadius: scale(18),
    paddingHorizontal: scale(13),
    paddingVertical: scale(7),
  },
  quizCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: scale(18),
    borderRadius: scale(16),
    marginBottom: scale(13),
    elevation: 2,
    shadowColor: "#2C4BFF",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  quizName: {
    fontSize: scale(16),
    fontWeight: "600",
    color: "#2C4BFF",
  },
  quizMeta: {
    fontSize: scale(13),
    color: "#888",
    marginTop: 3,
  },
});
