import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDarkMode } from "../DarkModeContext";
import { useLanguage } from "../LanguageContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import { supabase } from "../../supabase/supabaseClient";
import { lightTheme, darkTheme } from "../theme";
import { AuthContext } from "../../contexts/AuthContext";
import { toVietnamTime } from "../../components/utils/vietnamTime";

const TEXT = {
  your_quizzes: { vi: "Quiz nhóm", en: "Group Quizzes" },
  create_quiz: { vi: "Tạo Quiz", en: "Create Quiz" },
  no_quiz: { vi: "Chưa có quiz nào", en: "No quiz yet" },
  start: { vi: "Bắt đầu", en: "Start" },
  end: { vi: "Kết thúc", en: "End" },
  doing: { vi: "Đang làm", en: "Doing" },
  done: { vi: "Đã làm", en: "Done" },
  not_started: { vi: "Chưa diễn ra", en: "Not started" },
  upcoming: { vi: "Sắp diễn ra", en: "Upcoming" },
  running: { vi: "Đang diễn ra", en: "Ongoing" },
  ending_soon: { vi: "Sắp kết thúc", en: "Ending soon" },
  ended: { vi: "Đã kết thúc", en: "Ended" },
  questions: { vi: "câu hỏi", en: "questions" },
  score: { vi: "Điểm", en: "Score" },
  view_results: { vi: "Xem kết quả", en: "View Result" },
  confirm_quiz: { vi: "Vào làm quiz này?", en: "Ready to take this quiz?" },
  cancel: { vi: "Huỷ", en: "Cancel" },
  ok: { vi: "Đồng ý", en: "OK" },
  not_in_time: {
    vi: "Quiz chưa mở hoặc đã đóng!",
    en: "Quiz not available now!",
  },
  edit: { vi: "Chỉnh sửa", en: "Edit" },
  delete: { vi: "Xóa", en: "Delete" },
  confirm_delete: { vi: "Xác nhận xóa", en: "Delete confirmation" },
  delete_message: {
    vi: "Bạn có chắc muốn xóa quiz này?",
    en: "Are you sure you want to delete this quiz?",
  },
  close: { vi: "Đóng", en: "Close" },

  // Thêm cho phần kết quả
  result: { vi: "Kết quả", en: "Result" },
  leaderboard: { vi: "Bảng xếp hạng", en: "Leaderboard" },
  correct_n: { vi: "Số câu đúng", en: "Correct answers" },
  out_of: { vi: "trên", en: "out of" },
  your_answer: { vi: "Bạn chọn", en: "Your answer" },
  explanation: { vi: "Giải thích", en: "Explanation" },
  time: { vi: "Thời gian", en: "Time" },
  only_first_counted: {
    vi: "Chỉ tính điểm và lưu đáp án lần đầu, các lần sau chỉ để luyện tập.",
    en: "Only your first attempt is scored and saved. Later attempts are for practice only.",
  },
  retry: { vi: "Làm lại", en: "Retry" },
  rank: { vi: "Hạng", en: "Rank" },
  user: { vi: "Người dùng", en: "User" },
  you: { vi: "Bạn", en: "You" },
  time_format: { vi: "phút", en: "min" },
  question: { vi: "Câu hỏi", en: "Question" },
  no_result: { vi: "Không có kết quả", en: "No result" },
};

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

function getVietnamDate(utcString?: string): Date | null {
  if (!utcString) return null;
  const raw = String(utcString).replace(" ", "T");
  const timestamp = Date.parse(raw.endsWith("Z") ? raw : raw + "Z");
  if (isNaN(timestamp)) return null;
  return new Date(timestamp + 7 * 60 * 60 * 1000);
}

function getQuizStatus(quiz: any, lang: "vi" | "en" = "vi") {
  const now = new Date();
  const vnNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const start = getVietnamDate(quiz.start_time);
  const end = getVietnamDate(quiz.end_time);

  if (start && vnNow < start) {
    const diff = (start.getTime() - vnNow.getTime()) / (60 * 1000);
    if (diff > 14)
      return {
        label: TEXT.not_started[lang],
        color: "#999",
        status: "not_started",
      };
    else
      return {
        label: TEXT.upcoming[lang],
        color: "#007AFF",
        status: "upcoming",
      };
  }
  if (start && vnNow >= start && end && vnNow < end) {
    const diffEnd = (end.getTime() - vnNow.getTime()) / (60 * 1000);
    if (diffEnd <= 15)
      return {
        label: TEXT.ending_soon[lang],
        color: "#FFB300",
        status: "ending_soon",
      };
    else
      return { label: TEXT.running[lang], color: "#00C48C", status: "running" };
  }
  if (end && vnNow >= end) {
    return { label: TEXT.ended[lang], color: "#d9534f", status: "ended" };
  }
  return {
    label: TEXT.not_started[lang],
    color: "#999",
    status: "not_started",
  };
}

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

export default function GroupQuizScreen() {
  const { darkMode } = useDarkMode();
  const theme = darkMode ? darkTheme : lightTheme;
  const { lang } = useLanguage();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useContext(AuthContext) || {};
  const { groupId } = route.params as { groupId: number };

  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [results, setResults] = useState<{ [quizId: number]: any }>({});
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Result modal state
  const [showResult, setShowResult] = useState(false);
  const [resultQuiz, setResultQuiz] = useState<any>(null);
  const [resultData, setResultData] = useState<any>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<{ [qid: number]: OptionKey | null }>(
    {},
  );
  const [refreshing, setRefreshing] = useState(false);

  // Leaderboard modal state
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, user?.id]);

  async function fetchData() {
    setLoading(true);

    if (user?.id) {
      const { data: memberData } = await supabase
        .from("group_members")
        .select("*")
        .eq("group_id", groupId)
        .eq("user_id", user.id)
        .single();
      setMember(memberData);
    }

    const { data: quizList } = await supabase
      .from("group_quizzes")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: false });

    setQuizzes(quizList || []);

    if (user?.id && quizList && quizList.length > 0) {
      const quizIds = quizList.map((q: any) => q.id);
      const { data: resultList } = await supabase
        .from("group_quiz_results")
        .select("*")
        .in("quiz_id", quizIds)
        .eq("user_id", user.id);

      const resultMap: { [quizId: number]: any } = {};
      (resultList || []).forEach((r: any) => {
        resultMap[r.quiz_id] = r;
      });
      setResults(resultMap);
    }
    setLoading(false);
  }

  async function fetchResultModalData(quiz: any) {
    setRefreshing(true);
    setResultQuiz(quiz);

    // 1. Get user's result
    const { data: resultData } = await supabase
      .from("group_quiz_results")
      .select("*")
      .eq("quiz_id", quiz.id)
      .eq("user_id", user.id)
      .maybeSingle();
    setResultData(resultData);

    // 2. Get questions
    const { data: questionsData } = await supabase
      .from("group_quiz_questions")
      .select("*")
      .eq("quiz_id", quiz.id)
      .order("id", { ascending: true });
    setQuestions(questionsData || []);

    // 3. Get user's answers
    let answerMap: { [qid: number]: OptionKey | null } = {};
    if (resultData) {
      const { data: answerList } = await supabase
        .from("group_quiz_answers")
        .select("question_id, selected_option")
        .eq("quiz_result_id", resultData.id);
      if (answerList) {
        answerList.forEach((a: any) => {
          answerMap[a.question_id] = a.selected_option;
        });
      }
    }
    setAnswers(answerMap);

    setRefreshing(false);
  }

  async function fetchLeaderboard(quizId: number) {
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
  }

  const isAdmin = () => member?.role === "owner" || member?.role === "admin";

  function quizAvailable(quiz: any) {
    const now = new Date();
    const vnNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const start = getVietnamDate(quiz.start_time);
    const end = getVietnamDate(quiz.end_time);

    if (start && vnNow < start) return false;
    if (end && vnNow > end) return false;
    return true;
  }

  // Xem kết quả quiz đã làm
  const handleQuizResult = async (quiz: any) => {
    await fetchResultModalData(quiz);
    setShowResult(true);
  };

  // Thông báo trạng thái chi tiết khi ấn vào quiz
  const handleQuizPress = (quiz: any) => {
    const quizStatus = getQuizStatus(quiz, lang);

    let alertMessage = "";
    switch (quizStatus.status) {
      case "not_started":
        alertMessage =
          lang === "vi"
            ? `Quiz này chưa diễn ra.\nBắt đầu: ${toVietnamTime(quiz.start_time)}`
            : `This quiz has not started yet.\nStart: ${toVietnamTime(quiz.start_time)}`;
        break;
      case "upcoming":
        alertMessage =
          lang === "vi"
            ? `Quiz sắp diễn ra!\nBắt đầu: ${toVietnamTime(quiz.start_time)}`
            : `Quiz is upcoming!\nStart: ${toVietnamTime(quiz.start_time)}`;
        break;
      case "running":
        alertMessage =
          lang === "vi"
            ? `Quiz đang diễn ra.\nKết thúc: ${toVietnamTime(quiz.end_time)}`
            : `Quiz is ongoing.\nEnd: ${toVietnamTime(quiz.end_time)}`;
        break;
      case "ending_soon":
        alertMessage =
          lang === "vi"
            ? `Quiz sắp kết thúc!\nKết thúc: ${toVietnamTime(quiz.end_time)}`
            : `Quiz is ending soon!\nEnd: ${toVietnamTime(quiz.end_time)}`;
        break;
      case "ended":
        alertMessage =
          lang === "vi"
            ? `Quiz đã kết thúc.\nKết thúc: ${toVietnamTime(quiz.end_time)}`
            : `Quiz has ended.\nEnd: ${toVietnamTime(quiz.end_time)}`;
        break;
      default:
        alertMessage = "";
    }

    if (
      quizStatus.status === "running" ||
      quizStatus.status === "ending_soon"
    ) {
      if (results[quiz.id]) {
        Alert.alert(
          quiz.title,
          alertMessage +
            (lang === "vi"
              ? `\nBạn đã làm quiz này rồi.`
              : `\nYou have finished this quiz.`),
          [
            {
              text: TEXT.view_results[lang],
              onPress: () => handleQuizResult(quiz),
              style: "default",
            },
            { text: TEXT.close[lang], style: "cancel" },
          ],
          { cancelable: true },
        );
      } else {
        Alert.alert(
          quiz.title,
          alertMessage +
            (lang === "vi"
              ? `\nBạn muốn vào làm quiz này?`
              : `\nDo you want to start this quiz?`),
          [
            { text: TEXT.cancel[lang], style: "cancel" },
            {
              text: TEXT.ok[lang],
              style: "default",
              onPress: () =>
                navigation.navigate("GroupQuizDoScreen", {
                  quizId: quiz.id,
                  groupId,
                }),
            },
          ],
          { cancelable: true },
        );
      }
    } else if (results[quiz.id]) {
      Alert.alert(
        quiz.title,
        alertMessage +
          (lang === "vi"
            ? `\nBạn đã làm quiz này rồi.`
            : `\nYou have finished this quiz.`),
        [
          {
            text: TEXT.view_results[lang],
            onPress: () => handleQuizResult(quiz),
            style: "default",
          },
          { text: TEXT.close[lang], style: "cancel" },
        ],
        { cancelable: true },
      );
    } else {
      Alert.alert(quiz.title, alertMessage, [{ text: TEXT.close[lang] }], {
        cancelable: true,
      });
    }
  };

  const handleQuizLongPress = (quiz: any) => {
    if (!isAdmin()) return;
    Alert.alert(
      quiz.title,
      undefined,
      [
        {
          text: `${TEXT.edit[lang]}`,
          onPress: () =>
            navigation.navigate("GroupQuizEditScreen", {
              quizId: quiz.id,
              groupId,
            }),
        },
        {
          text: `${TEXT.delete[lang]}`,
          style: "destructive",
          onPress: () => {
            Alert.alert(
              TEXT.confirm_delete[lang],
              TEXT.delete_message[lang],
              [
                { text: TEXT.cancel[lang], style: "cancel" },
                {
                  text: TEXT.delete[lang],
                  style: "destructive",
                  onPress: async () => {
                    const { error } = await supabase
                      .from("group_quizzes")
                      .delete()
                      .eq("id", quiz.id);
                    if (error) {
                      Alert.alert("Lỗi", error.message);
                    } else {
                      fetchData();
                    }
                  },
                },
              ],
              { cancelable: true },
            );
          },
        },
        { text: TEXT.close[lang], style: "cancel" },
      ],
      { cancelable: true },
    );
  };

  function formatDuration(started: string | null, submitted: string): string {
    if (!started) return "--";
    const ms = new Date(submitted).getTime() - new Date(started).getTime();
    if (ms < 0) return "--";
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}:${sec.toString().padStart(2, "0")} ${TEXT.time_format[lang]}`;
  }

  // ===================== RENDER MODALS =====================

  // Leaderboard modal
  if (showLeaderboard && resultQuiz) {
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
              onRefresh={() => fetchLeaderboard(resultQuiz.id)}
              tintColor={theme.primary}
            />
          }
        >
          {leaderboard.length === 0 && (
            <Text
              style={{ color: theme.text, fontSize: 16, textAlign: "center" }}
            >
              {TEXT.no_result[lang]}
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

  // Result modal
  if (showResult && resultQuiz && resultData) {
    const total = questions.length;
    const correct = resultData.score;
    const realStarted = resultData.started_at || "";
    const realSubmitted = resultData.submitted_at || "";

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
            onPress={() => setShowResult(false)}
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
              onRefresh={() => fetchResultModalData(resultQuiz)}
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
            {TEXT.correct_n[lang]}: {correct} {TEXT.out_of[lang]} {total}
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
            onPress={async () => {
              await fetchLeaderboard(resultQuiz.id);
              setShowLeaderboard(true);
            }}
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
      </SafeAreaView>
    );
  }

  // ===================== MAIN SCREEN =====================

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
          {TEXT.your_quizzes[lang]}
        </Text>
        <View style={{ width: scale(32) }} />
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={theme.primary} size="large" />
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={{
              padding: scale(16),
              paddingBottom: scale(32),
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={fetchData}
                tintColor={theme.primary}
              />
            }
          >
            {quizzes.length === 0 && (
              <View style={styles.centerBox}>
                <Text
                  style={{
                    color: theme.subText,
                    fontStyle: "italic",
                    fontSize: scale(15),
                  }}
                >
                  {TEXT.no_quiz[lang]}
                </Text>
              </View>
            )}
            {quizzes.map((quiz) => {
              const quizStatus = getQuizStatus(quiz, lang);
              return (
                <TouchableOpacity
                  key={quiz.id}
                  style={[
                    styles.quizCard,
                    {
                      backgroundColor: theme.card,
                      opacity: quizAvailable(quiz) ? 1 : 0.5,
                    },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleQuizPress(quiz)}
                  onLongPress={() => handleQuizLongPress(quiz)}
                  disabled={!quizAvailable(quiz) && !isAdmin()}
                >
                  <Text
                    style={[styles.quizTitle, { color: theme.text }]}
                    numberOfLines={2}
                  >
                    {quiz.title}
                  </Text>
                  <Text
                    style={[styles.quizDesc, { color: theme.subText }]}
                    numberOfLines={2}
                  >
                    {quiz.description}
                  </Text>
                  <View style={{ marginTop: scale(7) }}>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Ionicons
                        name="time"
                        size={scale(16)}
                        color={theme.primary}
                        style={{ marginRight: scale(3) }}
                      />
                      <Text style={styles.timeText}>
                        {TEXT.start[lang]}:{" "}
                        {toVietnamTime(quiz.start_time) || "--"}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: scale(2),
                      }}
                    >
                      <Ionicons
                        name="flag"
                        size={scale(15)}
                        color={theme.primary}
                        style={{ marginRight: scale(3), marginLeft: scale(1) }}
                      />
                      <Text style={styles.timeText}>
                        {TEXT.end[lang]}: {toVietnamTime(quiz.end_time) || "--"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.quizStatusRow}>
                    <View style={styles.statusBox}>
                      <Ionicons
                        name="ellipse"
                        size={scale(13)}
                        color={quizStatus.color}
                        style={{ marginRight: scale(6) }}
                      />
                      <Text
                        style={{
                          color: quizStatus.color,
                          fontWeight: "bold",
                          fontSize: scale(13.5),
                        }}
                      >
                        {quizStatus.label}
                      </Text>
                    </View>
                    {results[quiz.id] && (
                      <View
                        style={[styles.statusBox, { marginLeft: scale(16) }]}
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={scale(17)}
                          color="#00C48C"
                          style={{ marginRight: scale(5) }}
                        />
                        <Text style={{ color: "#00C48C", fontWeight: "bold" }}>
                          {TEXT.done[lang]}
                        </Text>
                        <Text
                          style={{ marginLeft: scale(8), color: theme.text }}
                        >
                          {TEXT.score[lang]}: {results[quiz.id].score}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          {isAdmin() && (
            <TouchableOpacity
              style={[styles.fab, { backgroundColor: theme.primary }]}
              onPress={() =>
                navigation.navigate("GroupQuizCreateScreen", { groupId })
              }
              activeOpacity={0.88}
            >
              <Ionicons name="add" size={scale(28)} color="#fff" />
            </TouchableOpacity>
          )}
        </>
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
  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  quizCard: {
    borderRadius: scale(16),
    padding: scale(16),
    marginBottom: scale(16),
    elevation: 2,
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: scale(2) },
    shadowRadius: scale(6),
  },
  quizTitle: {
    fontSize: scale(16),
    fontWeight: "bold",
    marginBottom: 3,
  },
  quizDesc: {
    fontSize: scale(14),
    marginBottom: 5,
  },
  quizStatusRow: {
    flexDirection: "row",
    marginTop: scale(10),
    alignItems: "center",
  },
  statusBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    marginLeft: scale(5),
    color: "#888",
    fontSize: scale(13),
    fontStyle: "italic",
  },
  fab: {
    position: "absolute",
    bottom: scale(26),
    right: scale(24),
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    justifyContent: "center",
    alignItems: "center",
    elevation: 7,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: scale(4) },
    shadowRadius: scale(18),
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
