import React, { useState, useEffect, useContext, useRef } from "react";
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
  RefreshControl,
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

const COLORS = {
  correct: "#23C16B",
  wrong: "#FF5252",
  optionActive: "#4b8cff",
  leaderboard1: "#ffd700",
  leaderboard2: "#bdbdbd",
  leaderboard3: "#ff884d",
};

const TEXT = {
  do_quiz: { vi: "Làm bài trắc nghiệm", en: "Do Group Quiz" },
  question: { vi: "Câu hỏi", en: "Question" },
  submit: { vi: "Nộp bài", en: "Submit" },
  result: { vi: "Kết quả", en: "Result" },
  leaderboard: { vi: "Bảng xếp hạng", en: "Leaderboard" },
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
  rank: { vi: "Hạng", en: "Rank" },
  user: { vi: "Người dùng", en: "User" },
  you: { vi: "Bạn", en: "You" },
  score: { vi: "Điểm", en: "Score" },
  time: { vi: "Thời gian", en: "Time" },
  only_first_counted: {
    vi: "Chỉ tính điểm và lưu đáp án lần đầu, các lần sau chỉ để luyện tập.",
    en: "Only your first attempt is scored and saved. Later attempts are for practice only.",
  },
  time_format: { vi: "phút", en: "min" },
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

interface LeaderboardItem {
  user_id: string;
  score: number;
  started_at: string | null;
  submitted_at: string;
  users: {
    full_name: string;
    username: string;
    avatar_url: string;
  };
  id: number;
}

interface QuizResult {
  id: number;
  score: number;
  started_at: string | null;
  submitted_at: string;
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
  const [refreshing, setRefreshing] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<{ [qid: number]: OptionKey | null }>(
    {},
  );
  const [showResult, setShowResult] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [firstResult, setFirstResult] = useState<QuizResult | null>(null);
  const quizStartedAt = useRef<Date | null>(null);

  // ========== FETCH ==========
  const fetchQuestionsAndResult = async () => {
    setLoading(true);
    const { data: questionsData, error } = await supabase
      .from("group_quiz_questions")
      .select("*")
      .eq("quiz_id", quizId)
      .order("id", { ascending: true });
    if (error || !questionsData) {
      Alert.alert("Error", error?.message || "Failed to load questions.");
      setLoading(false);
      setRefreshing(false);
      return;
    }
    setQuestions(questionsData);
    setAnswers(
      Object.fromEntries(questionsData.map((q: QuizQuestion) => [q.id, null])),
    );
    const { data: resultData } = await supabase
      .from("group_quiz_results")
      .select("*")
      .eq("quiz_id", quizId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (resultData) setFirstResult(resultData);
    else setFirstResult(null);
    setLoading(false);
    setRefreshing(false);
    quizStartedAt.current = new Date();
  };

  const fetchLeaderboard = async () => {
    setRefreshing(true);
    const { data } = await supabase
      .from("group_quiz_results")
      .select(
        "id, score, started_at, submitted_at, user_id, users: user_id (full_name, username, avatar_url)",
      )
      .eq("quiz_id", quizId);

    if (data) {
      data.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const aStart = a.started_at ? new Date(a.started_at).getTime() : 0;
        const aEnd = new Date(a.submitted_at).getTime();
        const bStart = b.started_at ? new Date(b.started_at).getTime() : 0;
        const bEnd = new Date(b.submitted_at).getTime();
        return aEnd - aStart - (bEnd - bStart);
      });
      setLeaderboard(data);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    fetchQuestionsAndResult();
    // eslint-disable-next-line
  }, [quizId]);

  useEffect(() => {
    if (showLeaderboard) fetchLeaderboard();
    // eslint-disable-next-line
  }, [showLeaderboard, quizId]);

  // ========== LOGIC ==========
  function onSelect(qid: number, opt: OptionKey) {
    setAnswers({ ...answers, [qid]: opt });
  }
  function onPrev() {
    setCurrent(Math.max(0, current - 1));
  }
  function onNext() {
    setCurrent(Math.min(questions.length - 1, current + 1));
  }

  function calcScore(
    questions: QuizQuestion[],
    answers: { [qid: number]: OptionKey | null },
  ) {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] && answers[q.id] === q.correct_option) correct++;
    });
    return correct;
  }

  async function onSubmit() {
    const unanswered = questions.filter((q) => !answers[q.id]);
    const confirmSubmit = async () => {
      setShowResult(true);
      if (firstResult) return;
      const score = calcScore(questions, answers);
      setSaving(true);
      const { data: insertResult, error: insertErr } = await supabase
        .from("group_quiz_results")
        .insert([
          {
            quiz_id: quizId,
            user_id: user.id,
            score,
            started_at:
              quizStartedAt.current?.toISOString() || new Date().toISOString(),
            submitted_at: new Date().toISOString(),
          },
        ])
        .select()
        .maybeSingle();

      if (insertErr) {
        setSaving(false);
        Alert.alert("Error", insertErr.message);
        return;
      }
      setFirstResult(insertResult);
      const batchAnswers = questions.map((q) => ({
        quiz_result_id: insertResult.id,
        question_id: q.id,
        selected_option: answers[q.id] || "",
      }));
      if (batchAnswers.length > 0) {
        const { error: ansErr } = await supabase
          .from("group_quiz_answers")
          .insert(batchAnswers);
        if (ansErr) {
          setSaving(false);
          Alert.alert("Error", ansErr.message);
          return;
        }
      }
      setSaving(false);
    };

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

  function onRetry() {
    setAnswers(Object.fromEntries(questions.map((q) => [q.id, null])));
    setCurrent(0);
    setShowResult(false);
    quizStartedAt.current = new Date();
  }

  function formatDuration(started: string | null, submitted: string): string {
    if (!started) return "--";
    const ms = new Date(submitted).getTime() - new Date(started).getTime();
    if (ms < 0) return "--";
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}:${sec.toString().padStart(2, "0")} ${TEXT.time_format[lang]}`;
  }

  // ========== RENDER ==========

  // Leaderboard modal
  if (showLeaderboard) {
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
            onPress={() => setShowLeaderboard(false)}
          >
            <Ionicons
              name="chevron-back"
              size={scale(28)}
              color={theme.primary}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.primary }]}>
            {TEXT.leaderboard[lang]}
          </Text>
          <View style={{ width: scale(32) }} />
        </View>
        <View style={{ paddingHorizontal: 6, marginTop: 8, marginBottom: 8 }}>
          <View style={styles.lbHeaderRow}>
            <Text
              style={[styles.lbHeaderCell, { flex: 0.6, textAlign: "center" }]}
            >
              {TEXT.rank[lang]}
            </Text>
            <Text
              style={[styles.lbHeaderCell, { flex: 2.2 }]}
              numberOfLines={1}
            >
              {TEXT.user[lang]}
            </Text>
            <Text
              style={[styles.lbHeaderCell, { flex: 0.9, textAlign: "right" }]}
            >
              {TEXT.score[lang]}
            </Text>
            <Text
              style={[styles.lbHeaderCell, { flex: 1.3, textAlign: "center" }]}
            >
              {TEXT.time[lang]}
            </Text>
          </View>
        </View>
        <ScrollView
          contentContainerStyle={{
            paddingBottom: scale(32),
            paddingHorizontal: 4,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchLeaderboard}
              tintColor={theme.primary}
            />
          }
        >
          {leaderboard.length === 0 && (
            <Text
              style={{ color: theme.text, fontSize: 16, textAlign: "center" }}
            >
              No result yet
            </Text>
          )}
          {leaderboard.map((item, idx) => (
            <View
              key={item.user_id}
              style={[
                styles.lbRow,
                {
                  backgroundColor:
                    item.user_id === user.id ? "#e9f1ff" : theme.input,
                  borderColor:
                    idx === 0
                      ? COLORS.leaderboard1
                      : idx === 1
                        ? COLORS.leaderboard2
                        : idx === 2
                          ? COLORS.leaderboard3
                          : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.lbCell,
                  {
                    flex: 0.6,
                    textAlign: "center",
                    fontWeight: "bold",
                    color:
                      idx === 0
                        ? COLORS.leaderboard1
                        : idx === 1
                          ? COLORS.leaderboard2
                          : idx === 2
                            ? COLORS.leaderboard3
                            : theme.text,
                  },
                ]}
              >
                {idx + 1}
              </Text>
              <View
                style={[
                  styles.lbCell,
                  { flex: 2.2, flexDirection: "row", alignItems: "center" },
                ]}
              >
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: "#d3e1fa",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 7,
                  }}
                >
                  {item.users?.avatar_url ? (
                    <Ionicons name="person-circle" size={28} color="#aaa" />
                  ) : (
                    <Ionicons
                      name="person-circle-outline"
                      size={28}
                      color="#aaa"
                    />
                  )}
                </View>
                <Text
                  style={{
                    fontWeight: item.user_id === user.id ? "bold" : "normal",
                    color:
                      item.user_id === user.id ? theme.primary : theme.text,
                    fontSize: 15,
                    maxWidth: 110,
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.users?.full_name ||
                    item.users?.username ||
                    TEXT.user[lang]}
                  {item.user_id === user.id ? ` (${TEXT.you[lang]})` : ""}
                </Text>
              </View>
              <Text
                style={[
                  styles.lbCell,
                  {
                    flex: 0.9,
                    textAlign: "right",
                    color: theme.text,
                    fontWeight: "bold",
                  },
                ]}
              >
                {item.score}
              </Text>
              <Text
                style={[
                  styles.lbCell,
                  {
                    flex: 1.3,
                    textAlign: "center",
                    color: theme.text,
                  },
                ]}
              >
                {formatDuration(item.started_at, item.submitted_at)}
              </Text>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Nếu chưa có câu hỏi hoặc index out of bound thì báo lỗi, tránh crash
  const q = questions[current];
  if (!q) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: theme.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchQuestionsAndResult}
              tintColor={theme.primary}
            />
          }
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: theme.text, fontSize: 16 }}>
            {questions.length === 0
              ? "No question found!"
              : "This question does not exist."}
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // == Kết quả ==
  if (showResult) {
    const total = questions.length;
    let correct = calcScore(questions, answers);
    const realScore = firstResult ? firstResult.score : correct;
    const realStarted = firstResult
      ? firstResult.started_at
      : quizStartedAt.current?.toISOString() || "";
    const realSubmitted = firstResult
      ? firstResult.submitted_at
      : new Date().toISOString();
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchQuestionsAndResult}
              tintColor={theme.primary}
            />
          }
        >
          <Text
            style={{
              color: theme.primary,
              fontWeight: "bold",
              fontSize: 21,
              textAlign: "center",
              marginBottom: 6,
            }}
          >
            {TEXT.correct_n[lang]}: {realScore} {TEXT.out_of[lang]} {total}
          </Text>
          <Text
            style={{
              color: theme.subText,
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            {TEXT.only_first_counted[lang]}
          </Text>
          <View style={{ alignItems: "center", marginBottom: 14 }}>
            <Ionicons name="time" size={20} color={theme.primary} />
            <Text
              style={{
                color: theme.primary,
                fontWeight: "bold",
                fontSize: 16,
                marginLeft: 4,
              }}
            >
              {TEXT.time[lang]}: {formatDuration(realStarted, realSubmitted)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.leaderboardBtn}
            onPress={() => setShowLeaderboard(true)}
          >
            <Ionicons name="trophy" size={19} color={COLORS.optionActive} />
            <Text
              style={{
                color: COLORS.optionActive,
                marginLeft: 7,
                fontWeight: "bold",
                fontSize: 15,
              }}
            >
              {TEXT.leaderboard[lang]}
            </Text>
          </TouchableOpacity>
          {questions.map((q, idx) => (
            <View
              key={q.id}
              style={[
                styles.qBox,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  marginBottom: 13,
                  shadowColor: "#ddd",
                  shadowOpacity: 0.11,
                  shadowRadius: 9,
                  elevation: 2,
                },
              ]}
            >
              <Text style={styles.qTitleBox}>
                <Text style={styles.qTitleText}>
                  {TEXT.question[lang]} {idx + 1}
                </Text>
              </Text>
              <Text
                style={{
                  color: theme.text,
                  marginBottom: 9,
                  fontWeight: "bold",
                  fontSize: scale(18),
                }}
              >
                {q.question_text}
              </Text>
              <View style={styles.optionsResultContainer}>
                {(["A", "B", "C", "D"] as OptionKey[]).map((opt) => {
                  const isCorrect = q.correct_option === opt;
                  const isPicked = answers[q.id] === opt;
                  return (
                    <View
                      key={opt}
                      style={[
                        styles.optionResultRow,
                        {
                          backgroundColor: isPicked
                            ? isCorrect
                              ? "#e7f9ed"
                              : "#ffeaea"
                            : isCorrect
                              ? "#e7f9ed"
                              : theme.input,
                          borderColor: isCorrect
                            ? COLORS.correct
                            : isPicked
                              ? COLORS.wrong
                              : theme.border,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.resultRadio,
                          {
                            backgroundColor: isCorrect
                              ? COLORS.correct
                              : isPicked
                                ? COLORS.wrong
                                : theme.border,
                            borderColor: isCorrect
                              ? COLORS.correct
                              : isPicked
                                ? COLORS.wrong
                                : theme.border,
                          },
                        ]}
                      />
                      <Text
                        style={{
                          fontWeight: isPicked ? "bold" : "normal",
                          color: isCorrect
                            ? COLORS.correct
                            : isPicked
                              ? COLORS.wrong
                              : theme.text,
                          marginLeft: 6,
                          fontSize: 16,
                          width: 38,
                          textAlign: "center",
                        }}
                      >
                        {opt}.
                      </Text>
                      <Text
                        style={{
                          color: isCorrect
                            ? COLORS.correct
                            : isPicked
                              ? COLORS.wrong
                              : theme.text,
                          fontWeight: isPicked ? "bold" : "normal",
                          fontSize: 16,
                          flex: 1,
                          marginLeft: 0,
                        }}
                        numberOfLines={3}
                        ellipsizeMode="tail"
                      >
                        {q[`option_${opt.toLowerCase()}` as keyof QuizQuestion]}
                      </Text>
                    </View>
                  );
                })}
              </View>
              <Text style={{ color: theme.subText, marginTop: 6 }}>
                {TEXT.your_answer[lang]}:{" "}
                <Text
                  style={{
                    color:
                      answers[q.id] === q.correct_option
                        ? COLORS.correct
                        : answers[q.id]
                          ? COLORS.wrong
                          : theme.subText,
                    fontWeight: "bold",
                  }}
                >
                  {answers[q.id] || "-"}
                </Text>
                {answers[q.id] === q.correct_option && (
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={COLORS.correct}
                  />
                )}
                {answers[q.id] && answers[q.id] !== q.correct_option && (
                  <Ionicons
                    name="close-circle"
                    size={16}
                    color={COLORS.wrong}
                  />
                )}
              </Text>
              {!!q.explanation && (
                <Text
                  style={{
                    color: theme.subText,
                    backgroundColor: "#fffbe0",
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

  // == Màn làm bài ==
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchQuestionsAndResult}
            tintColor={theme.primary}
          />
        }
      >
        <View style={styles.qBox}>
          <Text style={styles.qTitleBox}>
            <Text style={styles.qTitleText}>
              {TEXT.question[lang]} {current + 1}/{questions.length}
            </Text>
          </Text>
          <Text
            style={{
              color: theme.text,
              fontWeight: "bold",
              fontSize: scale(20),
              marginBottom: scale(16),
              textAlign: "center",
              lineHeight: scale(26),
            }}
          >
            {q.question_text}
          </Text>
        </View>
        <View style={styles.optionsContainer}>
          {(["A", "B", "C", "D"] as OptionKey[]).map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.radioBtnRow,
                {
                  borderColor:
                    answers[q.id] === opt ? COLORS.optionActive : theme.border,
                  backgroundColor:
                    answers[q.id] === opt ? "#e9f1ff" : theme.input,
                  shadowColor:
                    answers[q.id] === opt ? COLORS.optionActive : "#eee",
                  shadowOpacity: answers[q.id] === opt ? 0.13 : 0.07,
                  shadowRadius: 8,
                  elevation: answers[q.id] === opt ? 2 : 0,
                },
              ]}
              activeOpacity={0.85}
              onPress={() => onSelect(q.id, opt)}
            >
              <View
                style={[
                  styles.radioBtn,
                  {
                    borderColor:
                      answers[q.id] === opt
                        ? COLORS.optionActive
                        : theme.primary,
                    backgroundColor: answers[q.id] === opt ? "#fff" : undefined,
                  },
                ]}
              >
                {answers[q.id] === opt && (
                  <Ionicons
                    name="checkmark"
                    size={13}
                    color={COLORS.optionActive}
                  />
                )}
              </View>
              <Text
                style={{
                  marginLeft: 10,
                  color:
                    answers[q.id] === opt ? COLORS.optionActive : theme.text,
                  fontWeight: answers[q.id] === opt ? "bold" : "normal",
                  fontSize: 16,
                  width: 38,
                  textAlign: "center",
                }}
              >
                {opt}.
              </Text>
              <Text
                style={{
                  color:
                    answers[q.id] === opt ? COLORS.optionActive : theme.text,
                  fontWeight: answers[q.id] === opt ? "bold" : "normal",
                  fontSize: 16,
                  flex: 1,
                  marginLeft: 0,
                }}
                numberOfLines={3}
                ellipsizeMode="tail"
              >
                {q[`option_${opt.toLowerCase()}` as keyof QuizQuestion]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
              {
                backgroundColor:
                  current === 0 ? theme.border : COLORS.optionActive,
                shadowColor: COLORS.optionActive,
                shadowOpacity: current === 0 ? 0.04 : 0.16,
                shadowRadius: 7,
                elevation: current === 0 ? 1 : 3,
              },
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
                fontWeight: "bold",
              }}
            >
              {TEXT.prev[lang]}
            </Text>
          </TouchableOpacity>
          {current === questions.length - 1 ? (
            <TouchableOpacity
              style={[
                styles.saveBtn,
                {
                  backgroundColor: COLORS.correct,
                  minWidth: 90,
                  shadowColor: COLORS.correct,
                  shadowOpacity: 0.16,
                  shadowRadius: 8,
                  elevation: 3,
                },
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
              style={[
                styles.navBtn,
                {
                  backgroundColor: COLORS.correct,
                  shadowColor: COLORS.correct,
                  shadowOpacity: 0.16,
                  shadowRadius: 8,
                  elevation: 3,
                },
              ]}
              onPress={onNext}
            >
              <Text
                style={{
                  color: "#fff",
                  marginRight: 6,
                  fontWeight: "bold",
                }}
              >
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
  leaderboardBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#e9f1ff",
    borderRadius: 9,
    paddingVertical: 8,
    paddingHorizontal: 22,
    marginBottom: 16,
    marginTop: 2,
    shadowColor: "#aac9fa",
    shadowOpacity: 0.08,
    shadowRadius: 7,
    elevation: 2,
  },
  lbHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f6fa",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "#e0e5ec",
    paddingVertical: 7,
    paddingHorizontal: 7,
    marginBottom: 0,
  },
  lbHeaderCell: {
    fontWeight: "bold",
    color: "#789",
    fontSize: scale(14),
    paddingBottom: 1,
    letterSpacing: 0.2,
  },
  lbRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 9,
    borderWidth: 1.2,
    borderColor: "#e0e5ec",
    marginBottom: 7,
    backgroundColor: "#f8fafc",
    minHeight: 44,
    paddingVertical: 5,
    paddingHorizontal: 7,
    shadowColor: "#e0e5ec",
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  lbCell: {
    fontSize: scale(15),
    color: "#222",
    minHeight: 28,
    justifyContent: "center",
    paddingRight: 2,
  },
  leaderboardRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: scale(9),
    paddingHorizontal: scale(13),
    borderBottomWidth: 1,
    borderColor: "#e0e5ec",
    borderWidth: 1.3,
    borderRadius: 10,
    marginBottom: 11,
    backgroundColor: "#f8fafc",
  },
  leaderCol: {
    color: "#789",
    fontWeight: "bold",
    fontSize: scale(14),
    paddingBottom: 2,
  },
  qBox: {
    borderRadius: scale(14),
    borderWidth: 1.5,
    borderColor: "#d1d6de",
    padding: scale(17),
    marginBottom: scale(17),
    backgroundColor: "#f8fafc",
    shadowColor: "#d1d6de",
    shadowOpacity: 0.09,
    shadowRadius: 12,
    elevation: 2,
    alignItems: "center",
  },
  qTitleBox: {
    backgroundColor: "#e9f1ff",
    borderRadius: scale(9),
    paddingVertical: scale(7),
    paddingHorizontal: scale(15),
    marginBottom: scale(10),
    alignSelf: "center",
  },
  qTitleText: {
    color: "#276ef1",
    fontWeight: "bold",
    fontSize: scale(17),
    letterSpacing: 0.3,
  },
  optionsResultContainer: {
    marginTop: 7,
    marginBottom: 3,
  },
  optionsContainer: {
    marginTop: scale(13),
    marginBottom: 0,
  },
  radioBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 10,
    marginBottom: 13,
    paddingVertical: 13,
    paddingHorizontal: 14,
    minHeight: 48,
    width: "100%",
  },
  radioBtn: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 2.2,
    justifyContent: "center",
    alignItems: "center",
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 9,
    paddingVertical: 11,
    paddingHorizontal: 25,
    minWidth: 90,
    justifyContent: "center",
    shadowOffset: { width: 0, height: 2 },
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
    shadowOffset: { width: 0, height: 3 },
  },
  optionResultRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 9,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1.4,
    width: "100%",
    minHeight: 52,
  },
  resultRadio: {
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 2,
    marginRight: 6,
  },
});
