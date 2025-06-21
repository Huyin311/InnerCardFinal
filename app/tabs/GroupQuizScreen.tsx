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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDarkMode } from "../DarkModeContext";
import { useLanguage } from "../LanguageContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import { supabase } from "../../supabase/supabaseClient";
import { lightTheme, darkTheme } from "../theme";
import { AuthContext } from "../../contexts/AuthContext";

// Thêm dayjs để xử lý giờ VN
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

const TEXT = {
  your_quizzes: { vi: "Quiz nhóm", en: "Group Quizzes" },
  create_quiz: { vi: "Tạo Quiz", en: "Create Quiz" },
  no_quiz: { vi: "Chưa có quiz nào", en: "No quiz yet" },
  start: { vi: "Bắt đầu", en: "Start" },
  end: { vi: "Kết thúc", en: "End" },
  doing: { vi: "Đang làm", en: "Doing" },
  done: { vi: "Đã làm", en: "Done" },
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
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BASE_WIDTH = 390;
const scale = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;

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

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, user?.id]);

  async function fetchData() {
    setLoading(true);

    // Lấy quyền thành viên
    if (user?.id) {
      const { data: memberData } = await supabase
        .from("group_members")
        .select("*")
        .eq("group_id", groupId)
        .eq("user_id", user.id)
        .single();
      setMember(memberData);
    }

    // Lấy danh sách quiz
    const { data: quizList } = await supabase
      .from("group_quizzes")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: false });

    setQuizzes(quizList || []);

    // Lấy kết quả của user cho từng quiz
    if (user?.id && quizList && quizList.length > 0) {
      const quizIds = quizList.map((q: any) => q.id);
      const { data: resultList } = await supabase
        .from("group_quiz_results")
        .select("*")
        .in("quiz_id", quizIds)
        .eq("user_id", user.id);

      // Map quizId -> result
      const resultMap: { [quizId: number]: any } = {};
      (resultList || []).forEach((r: any) => {
        resultMap[r.quiz_id] = r;
      });
      setResults(resultMap);
    }
    setLoading(false);
  }

  const isAdmin = () => member?.role === "owner" || member?.role === "admin";

  // Kiểm tra thời gian quiz hợp lệ
  function quizAvailable(quiz: any) {
    const now = new Date();
    if (quiz.start_time && new Date(quiz.start_time) > now) return false;
    if (quiz.end_time && new Date(quiz.end_time) < now) return false;
    return true;
  }

  const handleQuizPress = (quiz: any) => {
    if (!quizAvailable(quiz)) {
      Alert.alert(TEXT.not_in_time[lang]);
      return;
    }
    if (results[quiz.id]) {
      navigation.navigate("GroupQuizResultScreen", {
        quizId: quiz.id,
        groupId,
        score: results[quiz.id].score,
      });
    } else {
      Alert.alert(
        TEXT.confirm_quiz[lang],
        quiz.title,
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
  };

  // Long press để admin sửa hoặc xóa quiz
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

  // SỬA: chuyển UTC string về giờ Việt Nam khi hiển thị
  function formatTime(str?: string) {
    if (!str) return "";
    return dayjs.utc(str).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm");
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
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
            {quizzes.map((quiz) => (
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
                // Chỉ disable cho member thường nếu quiz ko khả dụng, admin vẫn thao tác được
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
                <View style={{ flexDirection: "row", marginTop: scale(7) }}>
                  <Ionicons
                    name="time"
                    size={scale(16)}
                    color={theme.primary}
                  />
                  <Text style={styles.timeText}>
                    {TEXT.start[lang]}: {formatTime(quiz.start_time) || "--"}
                  </Text>
                  <Text style={styles.timeText}>
                    {"  "}
                    {TEXT.end[lang]}: {formatTime(quiz.end_time) || "--"}
                  </Text>
                </View>
                <View style={styles.quizStatusRow}>
                  {results[quiz.id] ? (
                    <View style={styles.statusBox}>
                      <Ionicons
                        name="checkmark-circle"
                        size={scale(17)}
                        color="#00C48C"
                        style={{ marginRight: scale(5) }}
                      />
                      <Text style={{ color: "#00C48C", fontWeight: "bold" }}>
                        {TEXT.done[lang]}
                      </Text>
                      <Text style={{ marginLeft: scale(8), color: theme.text }}>
                        {TEXT.score[lang]}: {results[quiz.id].score}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.statusBox}>
                      <Ionicons
                        name="ellipse-outline"
                        size={scale(16)}
                        color="#FFB300"
                        style={{ marginRight: scale(5) }}
                      />
                      <Text style={{ color: "#FFB300", fontWeight: "bold" }}>
                        {TEXT.doing[lang]}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* FAB button */}
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
    marginTop: scale(8),
  },
  statusBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    marginLeft: scale(7),
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
});
