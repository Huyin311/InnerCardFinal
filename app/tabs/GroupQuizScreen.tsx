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
import { useDarkMode } from "../DarkModeContext";
import { useLanguage } from "../LanguageContext";
import { lightTheme, darkTheme } from "../theme";

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

const TEXT = {
  title: { vi: "Bài kiểm tra từ vựng", en: "Vocabulary Quizzes" },
  create: { vi: "Tạo", en: "Create" },
  numCards: { vi: "Số thẻ", en: "Cards" },
  noQuiz: { vi: "Chưa có bài kiểm tra nào", en: "No quizzes yet" },
};

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
  const { darkMode } = useDarkMode();
  const { lang } = useLanguage();
  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View
        style={[
          styles.headerRow,
          { backgroundColor: theme.section, borderBottomColor: theme.card },
        ]}
      >
        <Text style={[styles.title, { color: theme.primary }]}>
          {TEXT.title[lang]}
        </Text>
        {isAdmin && (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("GroupQuizCreateScreen", {
                addQuiz: (quiz: Quiz) => setQuizzes((qzs) => [...qzs, quiz]),
              })
            }
            style={[styles.headerBtn, { backgroundColor: theme.card }]}
          >
            <Ionicons
              name="add-circle-outline"
              size={scale(24)}
              color={theme.primary}
            />
            <Text
              style={{
                color: theme.primary,
                marginLeft: 6,
                fontWeight: "bold",
              }}
            >
              {TEXT.create[lang]}
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
            style={[
              styles.quizCard,
              { backgroundColor: theme.card, shadowColor: theme.primary },
            ]}
            onPress={() =>
              navigation.navigate("GroupQuizDetailScreen", { quiz: item })
            }
            activeOpacity={0.85}
          >
            <Ionicons
              name="book-outline"
              size={scale(32)}
              color={theme.primary}
              style={{ marginRight: scale(14) }}
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.quizName, { color: theme.primary }]}>
                {item.title}
              </Text>
              <Text style={[styles.quizMeta, { color: theme.subText }]}>
                {TEXT.numCards[lang]}: {item.flashcards.length}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={scale(22)}
              color={theme.subText}
            />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text
            style={{ textAlign: "center", marginTop: 40, color: theme.subText }}
          >
            {TEXT.noQuiz[lang]}
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(18),
    paddingTop: scale(16),
    paddingBottom: scale(8),
    borderBottomWidth: 0.5,
    justifyContent: "space-between",
  },
  title: {
    fontSize: scale(22),
    fontWeight: "bold",
  },
  headerBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: scale(18),
    paddingHorizontal: scale(13),
    paddingVertical: scale(7),
  },
  quizCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: scale(18),
    borderRadius: scale(16),
    marginBottom: scale(13),
    elevation: 2,
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  quizName: {
    fontSize: scale(16),
    fontWeight: "600",
  },
  quizMeta: {
    fontSize: scale(13),
    marginTop: 3,
  },
});
