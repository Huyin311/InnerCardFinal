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

// Responsive scale helper
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;

// Fake user role - replace with context/props in real app
const isAdmin = true; // true = chủ nhóm (quản trị), false = thành viên

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

export default function GroupQuizDetailScreen() {
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
    Alert.alert("Xác nhận xoá", "Bạn có chắc chắn muốn xoá bài kiểm tra này?", [
      { text: "Huỷ", style: "cancel" },
      { text: "Xoá", style: "destructive", onPress: () => navigation.goBack() },
    ]);
  }
  function handleEditQuiz() {
    navigation.navigate("GroupQuizCreateScreen", { editQuiz: quiz });
  }
  function handleLockQuiz() {
    Alert.alert(
      "Đã khoá bài kiểm tra",
      "Thành viên sẽ không thể tham gia nữa!",
    );
  }
  function handleViewResults() {
    navigation.navigate("QuizResultsScreen", { quizId: quiz.id }); // giả sử có màn này
  }
  function handleCopyLink() {
    // Clipboard API hoặc Share
    Alert.alert("Đã sao chép liên kết bài kiểm tra!");
  }
  function handleStartQuiz() {
    navigation.navigate("QuizTakingScreen", { quiz });
  }
  function handleJoinQuiz() {
    navigation.navigate("QuizTakingScreen", { quiz });
  }
  function handleExportQuiz() {
    Alert.alert("Export", "Xuất file bài kiểm tra thành công!");
  }

  // Giả lập trạng thái tham gia
  const userHasJoined = false; // true nếu đã tham gia, dùng context thực tế thay thế

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons name="arrow-back" size={scale(24)} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          Chi tiết bài kiểm tra
        </Text>
        <View style={{ width: scale(24) }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Tổng quan bài kiểm tra */}
        <View style={styles.section}>
          <Text style={styles.quizTitle}>{quiz.title}</Text>
          {!!quiz.description && (
            <Text style={styles.desc}>{quiz.description}</Text>
          )}
          <View style={styles.metaRow}>
            {quiz.creator && (
              <Text style={styles.metaItem}>
                <Ionicons name="person" size={14} color="#666" /> {quiz.creator}
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
                        : "#2C4BFF"
                  }
                />{" "}
                {quiz.status === "ready"
                  ? "Sẵn sàng"
                  : quiz.status === "ongoing"
                    ? "Đang diễn ra"
                    : quiz.status === "locked"
                      ? "Đã khoá"
                      : quiz.status === "ended"
                        ? "Đã kết thúc"
                        : ""}
              </Text>
            )}
            {quiz.isPublic !== undefined && (
              <Text style={styles.metaItem}>
                <Ionicons
                  name={quiz.isPublic ? "earth-outline" : "lock-closed-outline"}
                  size={14}
                  color={quiz.isPublic ? "#2C4BFF" : "#e67e22"}
                />{" "}
                {quiz.isPublic ? "Công khai" : "Chỉ QTV"}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Ionicons name="help-circle-outline" size={16} color="#2C4BFF" />
            <Text style={styles.infoLabel}>Số câu hỏi:</Text>
            <Text style={styles.infoValue}>
              {quiz.totalQuestions ?? quiz.flashcards?.length ?? "--"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="timer-outline" size={16} color="#2C4BFF" />
            <Text style={styles.infoLabel}>Thời gian làm bài:</Text>
            <Text style={styles.infoValue}>{quiz.timeLimit ?? "--"} phút</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color="#2C4BFF" />
            <Text style={styles.infoLabel}>Bắt đầu:</Text>
            <Text style={styles.infoValue}>{formatDate(quiz.startTime)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={16} color="#e74c3c" />
            <Text style={styles.infoLabel}>Kết thúc:</Text>
            <Text style={styles.infoValue}>{formatDate(quiz.endTime)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={16} color="#2C4BFF" />
            <Text style={styles.infoLabel}>Thành viên đã tham gia:</Text>
            <Text style={styles.infoValue}>{quiz.totalParticipants ?? 0}</Text>
          </View>
          {typeof quiz.avgScore === "number" && (
            <View style={styles.infoRow}>
              <Ionicons name="stats-chart-outline" size={16} color="#2C4BFF" />
              <Text style={styles.infoLabel}>Điểm TB:</Text>
              <Text style={styles.infoValue}>{quiz.avgScore}</Text>
            </View>
          )}
          {typeof quiz.highestScore === "number" && (
            <View style={styles.infoRow}>
              <Ionicons name="trending-up-outline" size={16} color="#27ae60" />
              <Text style={styles.infoLabel}>Điểm cao nhất:</Text>
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
              <Text style={styles.infoLabel}>Điểm thấp nhất:</Text>
              <Text style={styles.infoValue}>{quiz.lowestScore}</Text>
            </View>
          )}
        </View>
        {/* Danh sách thẻ (chỉ admin mới thấy) */}
        {isAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              Danh sách thẻ ({quiz.flashcards?.length || 0})
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
                    "Xem tất cả thẻ",
                    "Chức năng này sẽ hiển thị toàn bộ danh sách thẻ.",
                  )
                }
              >
                <Text style={styles.linkBtnText}>Xem tất cả các thẻ</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {/* Nút hành động */}
        <View style={styles.section}>
          {!isAdmin && (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleJoinQuiz}
              disabled={userHasJoined}
            >
              <Ionicons name="log-in-outline" size={18} color="#fff" />
              <Text style={styles.primaryBtnText}>
                {userHasJoined ? "Đã tham gia" : "Tham gia làm bài"}
              </Text>
            </TouchableOpacity>
          )}
          {isAdmin && (
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: "#27ae60" }]}
              onPress={handleStartQuiz}
            >
              <Ionicons name="play" size={18} color="#fff" />
              <Text style={styles.primaryBtnText}>Bắt đầu bài kiểm tra</Text>
            </TouchableOpacity>
          )}
          {/* Các chức năng thêm cho mọi vai trò */}
          <View style={styles.extraActions}>
            <TouchableOpacity style={styles.iconBtn} onPress={handleCopyLink}>
              <Ionicons name="link-outline" size={19} color="#2C4BFF" />
              <Text style={styles.iconBtnText}>Chia sẻ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleExportQuiz}>
              <Ionicons name="download-outline" size={19} color="#2C4BFF" />
              <Text style={styles.iconBtnText}>Xuất file</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={handleViewResults}
            >
              <Ionicons name="stats-chart-outline" size={19} color="#2C4BFF" />
              <Text style={styles.iconBtnText}>Kết quả</Text>
            </TouchableOpacity>
          </View>
          {/* Chức năng quản trị */}
          {isAdmin && (
            <View style={styles.adminActions}>
              <TouchableOpacity
                style={styles.adminBtn}
                onPress={handleEditQuiz}
              >
                <Feather name="edit-2" size={18} color="#2C4BFF" />
                <Text style={styles.adminBtnText}>Sửa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.adminBtn}
                onPress={handleDeleteQuiz}
              >
                <Feather name="trash-2" size={18} color="#e74c3c" />
                <Text style={[styles.adminBtnText, { color: "#e74c3c" }]}>
                  Xoá
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.adminBtn}
                onPress={handleLockQuiz}
              >
                <Ionicons name="lock-closed-outline" size={18} color="#888" />
                <Text style={styles.adminBtnText}>Khoá</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9FC" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(14),
    paddingTop: scale(12),
    paddingBottom: scale(10),
    backgroundColor: "#fff",
    borderBottomWidth: 0.5,
    borderBottomColor: "#E4EAF2",
    justifyContent: "space-between",
  },
  title: {
    fontSize: scale(18),
    fontWeight: "bold",
    color: "#2C4BFF",
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
    color: "#3B5EFF",
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
