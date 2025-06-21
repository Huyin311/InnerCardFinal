import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDarkMode } from "../DarkModeContext";
import { useLanguage } from "../LanguageContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import { supabase } from "../../supabase/supabaseClient";
import { lightTheme, darkTheme } from "../theme";
import { AuthContext } from "../../contexts/AuthContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BASE_WIDTH = 390;
const scale = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;

const TEXT = {
  do_quiz: { vi: "Làm bài trắc nghiệm", en: "Do Group Quiz" },
  question: { vi: "Câu hỏi", en: "Question" },
  submit: { vi: "Nộp bài", en: "Submit" },
  result: { vi: "Kết quả", en: "Result" },
  correct: { vi: "Đúng", en: "Correct" },
  your_answer: { vi: "Bạn chọn", en: "Your answer" },
  explanation: { vi: "Giải thích", en: "Explanation" },
  next: { vi: "Tiếp", en: "Next" },
  prev: { vi: "Trước", en: "Prev" },
  finish: { vi: "Kết thúc", en: "Finish" },
  confirm_submit: {
    vi: "Bạn chắc chắn muốn nộp bài?",
    en: "Are you sure you want to submit?",
  },
  unanswer_noti: {
    vi: "Bạn còn câu chưa làm, vẫn muốn nộp?",
    en: "Some questions are unanswered, submit anyway?",
  },
  correct_n: { vi: "Số câu đúng", en: "Correct answers" },
  out_of: { vi: "trên", en: "out of" },
  retry: { vi: "Làm lại", en: "Retry" },
  cancel: { vi: "Huỷ", en: "Cancel" },
};

type OptionKey = "A" | "B" | "C" | "D";

interface QuizQuestion {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: OptionKey;
  explanation?: string;
}

export default function GroupQuizDoScreen() {
  const { darkMode } = useDarkMode();
  const theme = darkMode ? darkTheme : lightTheme;
  const { lang } = useLanguage();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useContext(AuthContext) || {};
  const { quizId, groupId } = route.params as {
    quizId: number;
    groupId: number;
  };

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<{ [qid: number]: OptionKey | null }>(
    {},
  );
  const [showResult, setShowResult] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      const { data, error } = await supabase
        .from("group_quiz_questions")
        .select("*")
        .eq("quiz_id", quizId)
        .order("id", { ascending: true });
      if (error || !data) {
        Alert.alert("Error", error?.message || "Failed to load questions.");
        setLoading(false);
        return;
      }
      setQuestions(data);
      setAnswers(
        Object.fromEntries(data.map((q: QuizQuestion) => [q.id, null])),
      );
      setLoading(false);
    }
    fetchQuestions();
  }, [quizId]);

  function onSelect(qid: number, opt: OptionKey) {
    setAnswers({ ...answers, [qid]: opt });
  }
  function onPrev() {
    setCurrent(Math.max(0, current - 1));
  }
  function onNext() {
    setCurrent(Math.min(questions.length - 1, current + 1));
  }

  async function onSubmit() {
    const unanswered = questions.filter((q) => !answers[q.id]);
    const confirmSubmit = () => setShowResult(true);
    if (unanswered.length > 0) {
      Alert.alert(TEXT.unanswer_noti[lang], "", [
        { text: TEXT.cancel[lang], style: "cancel" },
        { text: TEXT.submit[lang], onPress: confirmSubmit },
      ]);
    } else {
      Alert.alert(TEXT.confirm_submit[lang], "", [
        { text: TEXT.cancel[lang], style: "cancel" },
        { text: TEXT.submit[lang], onPress: confirmSubmit },
      ]);
    }
  }

  async function saveResultToDb(score: number) {
    if (!user?.id) return;
    setSaving(true);
    const { error } = await supabase.from("group_quiz_results").insert([
      {
        quiz_id: quizId,
        group_id: groupId,
        user_id: user.id,
        score,
        submitted_at: new Date().toISOString(),
      },
    ]);
    setSaving(false);
    if (error) {
      Alert.alert("Error", error.message);
    }
  }

  function onShowResult() {
    setShowResult(true);
  }

  function onAfterShowResult(correct: number) {
    // Lưu điểm nếu chưa lưu
    saveResultToDb(correct);
  }

  function onRetry() {
    setAnswers(Object.fromEntries(questions.map((q) => [q.id, null])));
    setCurrent(0);
    setShowResult(false);
  }

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: theme.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  if (!questions.length) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: theme.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: theme.text, fontSize: 16 }}>
          No question found!
        </Text>
      </SafeAreaView>
    );
  }

  // Kết quả
  if (showResult) {
    const total = questions.length;
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] && answers[q.id] === q.correct_option) correct++;
    });
    // Save result first time only
    useEffect(() => {
      onAfterShowResult(correct);
      // eslint-disable-next-line
    }, []);
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <View
          style={[
            styles.header,
            { backgroundColor: theme.section, borderBottomColor: theme.card },
          ]}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="chevron-back"
              size={scale(28)}
              color={theme.primary}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.primary }]}>
            {TEXT.result[lang]}
          </Text>
          <View style={{ width: scale(32) }} />
        </View>
        <ScrollView
          contentContainerStyle={{
            padding: scale(16),
            paddingBottom: scale(32),
          }}
        >
          <Text
            style={{
              color: theme.primary,
              fontWeight: "bold",
              fontSize: 21,
              textAlign: "center",
              marginBottom: 18,
            }}
          >
            {TEXT.correct_n[lang]}: {correct} {TEXT.out_of[lang]} {total}
          </Text>
          {questions.map((q, idx) => (
            <View
              key={q.id}
              style={[
                styles.qBox,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  marginBottom: 13,
                },
              ]}
            >
              <Text style={[styles.qTitle, { color: theme.primary }]}>
                {TEXT.question[lang]} {idx + 1}
              </Text>
              <Text style={{ color: theme.text, marginBottom: 6 }}>
                {q.question_text}
              </Text>
              {(["A", "B", "C", "D"] as OptionKey[]).map((opt) => {
                const isCorrect = q.correct_option === opt;
                const isPicked = answers[q.id] === opt;
                return (
                  <View
                    key={opt}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 3,
                    }}
                  >
                    <View
                      style={[
                        styles.resultRadio,
                        {
                          backgroundColor: isPicked
                            ? isCorrect
                              ? "#5cb85c"
                              : theme.danger
                            : isCorrect
                              ? "#5cb85c"
                              : theme.input,
                          borderColor: isCorrect
                            ? "#5cb85c"
                            : isPicked
                              ? theme.danger
                              : theme.border,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        {
                          fontWeight: isPicked ? "bold" : "normal",
                          color: isCorrect ? "#5cb85c" : theme.text,
                          marginLeft: 6,
                        },
                      ]}
                    >
                      {opt}.{" "}
                      {q[`option_${opt.toLowerCase()}` as keyof QuizQuestion]}
                    </Text>
                  </View>
                );
              })}
              <Text style={{ color: theme.subText, marginTop: 6 }}>
                {TEXT.your_answer[lang]}:{" "}
                <Text
                  style={{
                    color:
                      answers[q.id] === q.correct_option
                        ? "#5cb85c"
                        : answers[q.id]
                          ? theme.danger
                          : theme.subText,
                    fontWeight: "bold",
                  }}
                >
                  {answers[q.id] || "-"}
                </Text>
                {answers[q.id] === q.correct_option && (
                  <Ionicons name="checkmark-circle" size={16} color="#5cb85c" />
                )}
                {answers[q.id] && answers[q.id] !== q.correct_option && (
                  <Ionicons
                    name="close-circle"
                    size={16}
                    color={theme.danger}
                  />
                )}
              </Text>
              {!!q.explanation && (
                <Text
                  style={{
                    color: theme.subText,
                    backgroundColor: theme.input,
                    padding: 8,
                    marginTop: 4,
                    borderRadius: 7,
                    fontStyle: "italic",
                  }}
                >
                  {TEXT.explanation[lang]}: {q.explanation}
                </Text>
              )}
            </View>
          ))}
          <TouchableOpacity
            style={[
              styles.saveBtn,
              { backgroundColor: theme.primary, marginTop: 19 },
            ]}
            onPress={onRetry}
          >
            <Ionicons name="refresh" size={19} color="#fff" />
            <Text style={{ color: "#fff", marginLeft: 8, fontWeight: "bold" }}>
              {TEXT.retry[lang]}
            </Text>
          </TouchableOpacity>
        </ScrollView>
        {saving && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "#0007",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        )}
      </SafeAreaView>
    );
  }

  // Màn làm bài
  const q = questions[current];
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View
        style={[
          styles.header,
          { backgroundColor: theme.section, borderBottomColor: theme.card },
        ]}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="chevron-back"
            size={scale(28)}
            color={theme.primary}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.primary }]}>
          {TEXT.do_quiz[lang]}
        </Text>
        <View style={{ width: scale(32) }} />
      </View>
      <ScrollView
        contentContainerStyle={{ padding: scale(16), paddingBottom: scale(32) }}
      >
        <Text style={[styles.qTitle, { color: theme.primary }]}>
          {TEXT.question[lang]} {current + 1}/{questions.length}
        </Text>
        <Text style={{ color: theme.text, fontSize: 16, marginBottom: 11 }}>
          {q.question_text}
        </Text>
        {(["A", "B", "C", "D"] as OptionKey[]).map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[
              styles.radioBtnRow,
              {
                borderColor:
                  answers[q.id] === opt ? theme.primary : theme.border,
                backgroundColor:
                  answers[q.id] === opt ? theme.primary : theme.input,
              },
            ]}
            activeOpacity={0.85}
            onPress={() => onSelect(q.id, opt)}
          >
            <View
              style={[
                styles.radioBtn,
                {
                  borderColor: answers[q.id] === opt ? "#fff" : theme.primary,
                  backgroundColor: answers[q.id] === opt ? "#fff" : undefined,
                },
              ]}
            >
              {answers[q.id] === opt && (
                <Ionicons name="checkmark" size={13} color={theme.primary} />
              )}
            </View>
            <Text
              style={{
                marginLeft: 10,
                color: answers[q.id] === opt ? "#fff" : theme.text,
                fontWeight: answers[q.id] === opt ? "bold" : "normal",
              }}
            >
              {opt}. {q[`option_${opt.toLowerCase()}` as keyof QuizQuestion]}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Chuyển câu */}
        <View
          style={{
            flexDirection: "row",
            marginTop: 20,
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity
            style={[
              styles.navBtn,
              { backgroundColor: current === 0 ? theme.border : theme.primary },
            ]}
            onPress={onPrev}
            disabled={current === 0}
          >
            <Ionicons
              name="arrow-back"
              size={18}
              color={current === 0 ? theme.subText : "#fff"}
            />
            <Text
              style={{
                color: current === 0 ? theme.subText : "#fff",
                marginLeft: 6,
              }}
            >
              {TEXT.prev[lang]}
            </Text>
          </TouchableOpacity>
          {current === questions.length - 1 ? (
            <TouchableOpacity
              style={[
                styles.saveBtn,
                { backgroundColor: theme.primary, minWidth: 90 },
              ]}
              onPress={onSubmit}
            >
              <Ionicons name="checkmark" size={19} color="#fff" />
              <Text
                style={{ color: "#fff", marginLeft: 8, fontWeight: "bold" }}
              >
                {TEXT.submit[lang]}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.navBtn, { backgroundColor: theme.primary }]}
              onPress={onNext}
            >
              <Text style={{ color: "#fff", marginRight: 6 }}>
                {TEXT.next[lang]}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
      {saving && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#0007",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(12),
    paddingTop: scale(6),
    paddingBottom: scale(8),
    borderBottomWidth: 0.5,
  },
  backBtn: { width: scale(32), alignItems: "flex-start" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: scale(18),
    fontWeight: "bold",
    marginHorizontal: scale(2),
  },
  qTitle: {
    fontWeight: "bold",
    fontSize: scale(16),
    marginBottom: 7,
  },
  radioBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.3,
    borderRadius: 9,
    marginBottom: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  radioBtn: {
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 9,
    paddingVertical: 9,
    paddingHorizontal: 20,
    minWidth: 90,
    justifyContent: "center",
  },
  saveBtn: {
    borderRadius: scale(13),
    paddingVertical: scale(13),
    paddingHorizontal: scale(22),
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    elevation: 2,
    minWidth: 90,
    justifyContent: "center",
  },
  qBox: {
    borderRadius: scale(12),
    borderWidth: 1.1,
    padding: scale(13),
    marginBottom: scale(15),
    elevation: 1,
  },
  resultRadio: {
    width: 17,
    height: 17,
    borderRadius: 10,
    borderWidth: 2,
    marginRight: 6,
  },
});
