import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useDarkMode } from "../DarkModeContext";
import { useLanguage } from "../LanguageContext";
import { lightTheme, darkTheme } from "../theme";

// Responsive scale helper
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;

// Đa ngữ
const TEXT = {
  quizDetail: { vi: "Chi tiết bài kiểm tra", en: "Quiz Detail" },
  ready: { vi: "Sẵn sàng", en: "Ready" },
  ongoing: { vi: "Đang diễn ra", en: "Ongoing" },
  locked: { vi: "Đã khoá", en: "Locked" },
  ended: { vi: "Đã kết thúc", en: "Ended" },
  public: { vi: "Công khai", en: "Public" },
  adminOnly: { vi: "Chỉ QTV", en: "Admins only" },
  questions: { vi: "Số câu hỏi:", en: "Questions:" },
  timeLimit: { vi: "Thời gian làm bài:", en: "Time limit:" },
  minutes: { vi: "phút", en: "min" },
  start: { vi: "Bắt đầu:", en: "Start:" },
  end: { vi: "Kết thúc:", en: "End:" },
  participants: { vi: "Thành viên đã tham gia:", en: "Participants:" },
  avgScore: { vi: "Điểm TB:", en: "Avg score:" },
  highestScore: { vi: "Điểm cao nhất:", en: "Highest:" },
  lowestScore: { vi: "Điểm thấp nhất:", en: "Lowest:" },
  cardList: { vi: "Danh sách thẻ", en: "Flashcards" },
  allCards: { vi: "Xem tất cả các thẻ", en: "See all cards" },
  join: { vi: "Tham gia làm bài", en: "Take quiz" },
  joined: { vi: "Đã tham gia", en: "Joined" },
  startQuiz: { vi: "Bắt đầu bài kiểm tra", en: "Start quiz" },
  share: { vi: "Chia sẻ", en: "Share" },
  export: { vi: "Xuất file", en: "Export" },
  results: { vi: "Kết quả", en: "Results" },
  edit: { vi: "Sửa", en: "Edit" },
  delete: { vi: "Xoá", en: "Delete" },
  lock: { vi: "Khoá", en: "Lock" },
  confirmDelete: { vi: "Xác nhận xoá", en: "Confirm delete" },
  deleteQuizMsg: {
    vi: "Bạn có chắc chắn muốn xoá bài kiểm tra này?",
    en: "Are you sure you want to delete this quiz?",
  },
  cancel: { vi: "Huỷ", en: "Cancel" },
  copied: { vi: "Đã sao chép liên kết bài kiểm tra!", en: "Quiz link copied!" },
  exportSuccess: {
    vi: "Xuất file bài kiểm tra thành công!",
    en: "Exported quiz file successfully!",
  },
  lockedMsg: {
    vi: "Đã khoá bài kiểm tra\nThành viên sẽ không thể tham gia nữa!",
    en: "Quiz locked. Members can't join anymore!",
  },
  seeAllCardsTitle: { vi: "Xem tất cả thẻ", en: "View all cards" },
  seeAllCardsDesc: {
    vi: "Chức năng này sẽ hiển thị toàn bộ danh sách thẻ.",
    en: "This feature will show all flashcards.",
  },
};

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
  description?: string;
  timeLimit?: number; // minutes
  startTime?: Date | string;
  endTime?: Date | string;
  isPublic?: boolean;
  creator?: string;
  status?: "ready" | "ongoing" | "locked" | "ended";
  totalQuestions?: number;
  totalParticipants?: number;
  avgScore?: number;
  highestScore?: number;
  lowestScore?: number;
};

// Fake user role - replace with context/props in real app
const isAdmin = true; // true = chủ nhóm (quản trị), false = thành viên

export default function GroupQuizDetailScreen() {
  const { darkMode } = useDarkMode();
  const theme = darkMode ? darkTheme : lightTheme;
  const { lang } = useLanguage();

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const quiz: Quiz = route.params?.quiz || {};

  // Định dạng ngày giờ
  const formatDate = (d?: Date | string) =>
    d
      ? typeof d === "string"
        ? new Date(d).toLocaleString()
        : d.toLocaleString()
      : "--";

  // Các hành động quản trị
  function handleDeleteQuiz() {
    Alert.alert(TEXT.confirmDelete[lang], TEXT.deleteQuizMsg[lang], [
      { text: TEXT.cancel[lang], style: "cancel" },
      {
        text: TEXT.delete[lang],
        style: "destructive",
        onPress: () => navigation.goBack(),
      },
    ]);
  }
  function handleEditQuiz() {
    navigation.navigate("GroupQuizCreateScreen", { editQuiz: quiz });
  }
  function handleLockQuiz() {
    Alert.alert(TEXT.locked[lang], TEXT.lockedMsg[lang]);
  }
  function handleViewResults() {
    navigation.navigate("QuizResultsScreen", { quizId: quiz.id });
  }
  function handleCopyLink() {
    // Clipboard API hoặc Share
    Alert.alert(TEXT.copied[lang]);
  }
  function handleStartQuiz() {
    navigation.navigate("QuizTakingScreen", { quiz });
  }
  function handleJoinQuiz() {
    navigation.navigate("QuizTakingScreen", { quiz });
  }
  function handleExportQuiz() {
    Alert.alert(TEXT.export[lang], TEXT.exportSuccess[lang]);
  }

  // Giả lập trạng thái tham gia
  const userHasJoined = false; // true nếu đã tham gia, dùng context thực tế thay thế

  // Hiển thị status theo trạng thái
  function getStatusText(status?: Quiz["status"]) {
    if (status === "ready") return TEXT.ready[lang];
    if (status === "ongoing") return TEXT.ongoing[lang];
    if (status === "locked") return TEXT.locked[lang];
    if (status === "ended") return TEXT.ended[lang];
    return "";
  }

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
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons name="arrow-back" size={scale(24)} color={theme.primary} />
        </TouchableOpacity>
        <Text
          style={[styles.title, { color: theme.primary }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {TEXT.quizDetail[lang]}
        </Text>
        <View style={{ width: scale(24) }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Tổng quan bài kiểm tra */}
        <View style={styles.section}>
          <Text style={styles.quizTitle}>{quiz.title}</Text>
          {!!quiz.description && (
            <Text style={[styles.desc, { color: theme.text }]}>
              {quiz.description}
            </Text>
          )}
          <View style={styles.metaRow}>
            {quiz.creator && (
              <Text style={styles.metaItem}>
                <Ionicons name="person" size={14} color={theme.subText} />{" "}
                {quiz.creator}
              </Text>
            )}
            {quiz.status && (
              <Text style={styles.metaItem}>
                <Ionicons
                  name={
                    quiz.status === "locked"
                      ? "lock-closed-outline"
                      : quiz.status === "ended"
                        ? "close-circle-outline"
                        : "checkmark-circle-outline"
                  }
                  size={14}
                  color={
                    quiz.status === "locked"
                      ? "#e67e22"
                      : quiz.status === "ended"
                        ? "#e74c3c"
                        : theme.primary
                  }
                />{" "}
                {getStatusText(quiz.status)}
              </Text>
            )}
            {quiz.isPublic !== undefined && (
              <Text style={styles.metaItem}>
                <Ionicons
                  name={quiz.isPublic ? "earth-outline" : "lock-closed-outline"}
                  size={14}
                  color={quiz.isPublic ? theme.primary : "#e67e22"}
                />{" "}
                {quiz.isPublic ? TEXT.public[lang] : TEXT.adminOnly[lang]}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Ionicons
              name="help-circle-outline"
              size={16}
              color={theme.primary}
            />
            <Text style={[styles.infoLabel, { color: theme.text }]}>
              {TEXT.questions[lang]}
            </Text>
            <Text style={styles.infoValue}>
              {quiz.totalQuestions ?? quiz.flashcards?.length ?? "--"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="timer-outline" size={16} color={theme.primary} />
            <Text style={[styles.infoLabel, { color: theme.text }]}>
              {TEXT.timeLimit[lang]}
            </Text>
            <Text style={styles.infoValue}>
              {quiz.timeLimit ?? "--"} {TEXT.minutes[lang]}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={theme.primary} />
            <Text style={[styles.infoLabel, { color: theme.text }]}>
              {TEXT.start[lang]}
            </Text>
            <Text style={styles.infoValue}>{formatDate(quiz.startTime)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={16} color="#e74c3c" />
            <Text style={[styles.infoLabel, { color: theme.text }]}>
              {TEXT.end[lang]}
            </Text>
            <Text style={styles.infoValue}>{formatDate(quiz.endTime)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={16} color={theme.primary} />
            <Text style={[styles.infoLabel, { color: theme.text }]}>
              {TEXT.participants[lang]}
            </Text>
            <Text style={styles.infoValue}>{quiz.totalParticipants ?? 0}</Text>
          </View>
          {typeof quiz.avgScore === "number" && (
            <View style={styles.infoRow}>
              <Ionicons
                name="stats-chart-outline"
                size={16}
                color={theme.primary}
              />
              <Text style={[styles.infoLabel, { color: theme.text }]}>
                {TEXT.avgScore[lang]}
              </Text>
              <Text style={styles.infoValue}>{quiz.avgScore}</Text>
            </View>
          )}
          {typeof quiz.highestScore === "number" && (
            <View style={styles.infoRow}>
              <Ionicons name="trending-up-outline" size={16} color="#27ae60" />
              <Text style={[styles.infoLabel, { color: theme.text }]}>
                {TEXT.highestScore[lang]}
              </Text>
              <Text style={styles.infoValue}>{quiz.highestScore}</Text>
            </View>
          )}
          {typeof quiz.lowestScore === "number" && (
            <View style={styles.infoRow}>
              <Ionicons
                name="trending-down-outline"
                size={16}
                color="#e74c3c"
              />
              <Text style={[styles.infoLabel, { color: theme.text }]}>
                {TEXT.lowestScore[lang]}
              </Text>
              <Text style={styles.infoValue}>{quiz.lowestScore}</Text>
            </View>
          )}
        </View>
        {/* Danh sách thẻ (chỉ admin mới thấy) */}
        {isAdmin && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.primary }]}>
              {TEXT.cardList[lang]} ({quiz.flashcards?.length || 0})
            </Text>
            {(quiz.flashcards || []).slice(0, 5).map((card, idx) => (
              <View key={card.id} style={styles.cardItem}>
                <Text style={styles.flashFront}>
                  {idx + 1}. {card.front}
                  {card.partOfSpeech ? (
                    <Text style={styles.partOfSpeech}>
                      {" "}
                      ({card.partOfSpeech})
                    </Text>
                  ) : null}
                </Text>
                <Text style={styles.flashBack}>{card.back}</Text>
                {card.example && (
                  <Text style={styles.flashExample}>
                    <Ionicons name="bulb-outline" size={13} color="#FFD600" />{" "}
                    {card.example}
                  </Text>
                )}
              </View>
            ))}
            {(quiz.flashcards?.length || 0) > 5 && (
              <TouchableOpacity
                style={styles.linkBtn}
                onPress={() =>
                  Alert.alert(
                    TEXT.seeAllCardsTitle[lang],
                    TEXT.seeAllCardsDesc[lang],
                  )
                }
              >
                <Text style={styles.linkBtnText}>{TEXT.allCards[lang]}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {/* Nút hành động */}
        <View style={styles.section}>
          {!isAdmin && (
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
              onPress={handleJoinQuiz}
              disabled={userHasJoined}
            >
              <Ionicons name="log-in-outline" size={18} color="#fff" />
              <Text style={styles.primaryBtnText}>
                {userHasJoined ? TEXT.joined[lang] : TEXT.join[lang]}
              </Text>
            </TouchableOpacity>
          )}
          {isAdmin && (
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: "#27ae60" }]}
              onPress={handleStartQuiz}
            >
              <Ionicons name="play" size={18} color="#fff" />
              <Text style={styles.primaryBtnText}>{TEXT.startQuiz[lang]}</Text>
            </TouchableOpacity>
          )}
          {/* Các chức năng thêm cho mọi vai trò */}
          <View style={styles.extraActions}>
            <TouchableOpacity style={styles.iconBtn} onPress={handleCopyLink}>
              <Ionicons name="link-outline" size={19} color={theme.primary} />
              <Text style={styles.iconBtnText}>{TEXT.share[lang]}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleExportQuiz}>
              <Ionicons
                name="download-outline"
                size={19}
                color={theme.primary}
              />
              <Text style={styles.iconBtnText}>{TEXT.export[lang]}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={handleViewResults}
            >
              <Ionicons
                name="stats-chart-outline"
                size={19}
                color={theme.primary}
              />
              <Text style={styles.iconBtnText}>{TEXT.results[lang]}</Text>
            </TouchableOpacity>
          </View>
          {/* Chức năng quản trị */}
          {isAdmin && (
            <View style={styles.adminActions}>
              <TouchableOpacity
                style={styles.adminBtn}
                onPress={handleEditQuiz}
              >
                <Feather name="edit-2" size={18} color={theme.primary} />
                <Text style={styles.adminBtnText}>{TEXT.edit[lang]}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.adminBtn}
                onPress={handleDeleteQuiz}
              >
                <Feather name="trash-2" size={18} color="#e74c3c" />
                <Text style={[styles.adminBtnText, { color: "#e74c3c" }]}>
                  {TEXT.delete[lang]}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.adminBtn}
                onPress={handleLockQuiz}
              >
                <Ionicons name="lock-closed-outline" size={18} color="#888" />
                <Text style={styles.adminBtnText}>{TEXT.lock[lang]}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(14),
    paddingTop: scale(12),
    paddingBottom: scale(10),
    borderBottomWidth: 0.5,
    borderBottomColor: "#E4EAF2",
    justifyContent: "space-between",
  },
  title: {
    fontSize: scale(18),
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginLeft: scale(-24),
    marginRight: scale(-24),
  },
  content: { padding: scale(14), paddingBottom: scale(36) },
  section: { marginBottom: scale(16) },
  quizTitle: {
    fontWeight: "bold",
    color: "#2C4BFF",
    fontSize: scale(17),
    marginBottom: 2,
  },
  desc: { fontSize: scale(14), color: "#444", marginBottom: 3 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 2 },
  metaItem: { color: "#888", fontSize: scale(13), marginRight: 13 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 3 },
  infoLabel: { color: "#444", fontSize: scale(14), marginLeft: 4 },
  infoValue: {
    color: "#2C4BFF",
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: scale(14),
  },
  sectionLabel: {
    fontWeight: "bold",
    fontSize: scale(15),
    marginBottom: scale(7),
  },
  cardItem: {
    backgroundColor: "#F7F8FB",
    borderRadius: scale(8),
    padding: scale(9),
    marginBottom: scale(6),
  },
  flashFront: { fontWeight: "bold", color: "#2C4BFF", fontSize: scale(15) },
  partOfSpeech: { fontWeight: "normal", color: "#444", fontSize: scale(14) },
  flashBack: { fontWeight: "500", color: "#333", fontSize: scale(15) },
  flashExample: { fontSize: scale(13), color: "#888", marginTop: 2 },
  empty: { color: "#aaa", marginTop: scale(10), textAlign: "center" },
  primaryBtn: {
    flexDirection: "row",
    backgroundColor: "#2C4BFF",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 11,
    paddingVertical: scale(13),
    marginTop: scale(10),
    marginBottom: scale(8),
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: scale(16),
    marginLeft: 10,
  },
  extraActions: {
    flexDirection: "row",
    marginTop: 8,
    marginBottom: 2,
    flexWrap: "wrap",
  },
  iconBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6ECFF",
    borderRadius: 8,
    paddingHorizontal: scale(11),
    paddingVertical: scale(7),
    marginRight: scale(8),
    marginBottom: scale(8),
  },
  iconBtnText: { color: "#2C4BFF", marginLeft: 5, fontWeight: "bold" },
  adminActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 2,
  },
  adminBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6F7FB",
    borderRadius: 9,
    paddingHorizontal: scale(11),
    paddingVertical: scale(7),
    marginRight: scale(7),
    marginBottom: scale(10),
    borderWidth: 1,
    borderColor: "#E6ECFF",
  },
  adminBtnText: {
    color: "#2C4BFF",
    fontWeight: "bold",
    marginLeft: 5,
    fontSize: scale(15),
  },
  linkBtn: {
    paddingVertical: 7,
    alignItems: "center",
  },
  linkBtnText: {
    color: "#2C4BFF",
    textDecorationLine: "underline",
    fontWeight: "bold",
    fontSize: scale(14),
  },
});
