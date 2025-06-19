import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
  TextInput,
  Modal,
  Alert,
  FlatList,
  ScrollView,
  Dimensions,
} from "react-native";
import { useDarkMode } from "../DarkModeContext";
import { useLanguage } from "../LanguageContext";
import { lightTheme, darkTheme } from "../theme";
import CustomTabBar from "../../components/CustomTabBar";
import { Ionicons, Feather } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;

// Đa ngữ động
const TEXT = {
  hi: { vi: "Xin chào", en: "Hi" },
  letsLearn: { vi: "Cùng bắt đầu học nào", en: "Let's start learning" },
  learnedToday: { vi: "Đã học hôm nay", en: "Learned today" },
  editTarget: { vi: "Sửa mục tiêu", en: "Edit target" },
  learnMin: { vi: "phút", en: "min" },
  getStarted: { vi: "Bắt đầu", en: "Get Started" },
  tryNow: { vi: "Thử ngay", en: "Try Now" },
  invite: { vi: "Mời", en: "Invite" },
  learningPlan: { vi: "Kế hoạch học", en: "Learning Plan" },
  reviewedPlan: { vi: "Đã xem lại kế hoạch", en: "Reviewed plan" },
  streak: { vi: "chuỗi ngày", en: "day streak" },
  keepItUp: { vi: "Tiếp tục nhé!", en: "Keep it up!" },
  share: { vi: "Chia sẻ", en: "Share" },
  recentActivity: { vi: "Hoạt động gần đây", en: "Recent Activity" },
  meetup: { vi: "Giao lưu", en: "Meetup" },
  meetupDesc: {
    vi: "Trao đổi kinh nghiệm học offline",
    en: "Off-line exchange of learning experience",
  },
  editDailyTarget: {
    vi: "Sửa mục tiêu ngày (phút)",
    en: "Edit daily target (minutes)",
  },
  enterTarget: { vi: "Nhập mục tiêu (phút)", en: "Enter target (min)" },
  cancel: { vi: "Huỷ", en: "Cancel" },
  save: { vi: "Lưu", en: "Save" },
  invalid: { vi: "Không hợp lệ", en: "Invalid" },
  pleaseEnterValid: {
    vi: "Vui lòng nhập số hợp lệ.",
    en: "Please enter a valid number.",
  },
  streakDetail: { vi: "chuỗi ngày liên tiếp!", en: "day streak!" },
  studiedStreak: { vi: "Bạn đã học liên tiếp", en: "You have studied for" },
  daysInARow: {
    vi: "ngày liền! Giữ cho chuỗi tiếp tục nhé.",
    en: "days in a row! Keep your streak going.",
  },
  close: { vi: "Đóng", en: "Close" },
  book: { vi: "Học", en: "Learned" },
  achievement: { vi: "Thành tích", en: "Achievement" },
  reminder: { vi: "Nhắc nhở", en: "Reminder" },
  sharedStreak: { vi: "Đã chia sẻ chuỗi ngày!", en: "Shared your streak!" },
  started: { vi: "Bắt đầu", en: "Started" },
  practiceSpeaking: { vi: "Luyện nói", en: "Practice Speaking" },
  challengeFriend: { vi: "Thách đấu bạn bè", en: "Challenge a Friend" },
};

const user = {
  name: "Kristin",
  avatar: require("../../assets/images/avatar.png"),
};

const learningToday = {
  learned: 46,
  target: 60,
};

const plans = [
  { name: "Packaging Design", progress: 40, total: 48 },
  { name: "Product Design", progress: 6, total: 24 },
];

const recentActivities = [
  {
    type: "learned",
    text: "You completed 10min of English Vocabulary",
    time: "2m ago",
    icon: "book",
  },
  {
    type: "achievement",
    text: "Streak: 7 days! 🎉",
    time: "1h ago",
    icon: "star",
  },
  {
    type: "reminder",
    text: "Review 5 Kanji cards today",
    time: "3h ago",
    icon: "alarm",
  },
];

export default function HomeScreen() {
  const { darkMode } = useDarkMode();
  const theme = darkMode ? darkTheme : lightTheme;
  const { lang } = useLanguage();

  const suggestions = [
    {
      title: TEXT.getStarted[lang],
      emoji: "🧑‍🎓",
      btn: TEXT.getStarted[lang],
    },
    {
      title: TEXT.practiceSpeaking[lang],
      emoji: "🗣️",
      btn: TEXT.tryNow[lang],
    },
    {
      title: TEXT.challengeFriend[lang],
      emoji: "🤝",
      btn: TEXT.invite[lang],
    },
  ];

  const scrollY = useRef(new Animated.Value(0)).current;
  const HEADER_MAX_HEIGHT = scale(140);
  const HEADER_MIN_HEIGHT =
    scale(90) + (Platform.OS === "ios" ? 0 : StatusBar.currentHeight || 0);
  const AVATAR_MAX = scale(48);
  const AVATAR_MIN = scale(40);
  const TITLE_MAX = scale(24);

  const [showAddTarget, setShowAddTarget] = useState(false);
  const [newTarget, setNewTarget] = useState("");
  const [activities, setActivities] = useState(recentActivities);
  const [showStreakDetail, setShowStreakDetail] = useState(false);

  const headerHeight = scrollY.interpolate({
    inputRange: [0, scale(48)],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: "clamp",
  });
  const avatarSize = scrollY.interpolate({
    inputRange: [0, scale(48)],
    outputRange: [AVATAR_MAX, AVATAR_MIN],
    extrapolate: "clamp",
  });
  const titleSize = scrollY.interpolate({
    inputRange: [0, scale(48)],
    outputRange: [TITLE_MAX, scale(28)],
    extrapolate: "clamp",
  });
  const subOpacity = scrollY.interpolate({
    inputRange: [0, scale(32)],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const addActivity = (text: string, type: string) => {
    setActivities([
      {
        text,
        type,
        time: "now",
        icon:
          type === "learned"
            ? "book"
            : type === "achievement"
              ? "star"
              : "alarm",
      },
      ...activities,
    ]);
  };

  const handleSaveTarget = () => {
    if (!newTarget.trim() || isNaN(Number(newTarget))) {
      Alert.alert(TEXT.invalid[lang], TEXT.pleaseEnterValid[lang]);
      return;
    }
    learningToday.target = Number(newTarget);
    setShowAddTarget(false);
    setNewTarget("");
    addActivity("Updated daily learning target", "achievement");
  };

  const handleShowStreak = () => setShowStreakDetail(true);
  const handleHideStreak = () => setShowStreakDetail(false);

  const renderListHeader = () => (
    <View style={{ paddingBottom: scale(15) }}>
      {/* Progress card */}
      <View
        style={[
          styles.progressCard,
          { backgroundColor: theme.card, shadowColor: theme.primary },
        ]}
      >
        <View style={styles.progressRow}>
          <Text style={[styles.progressLabel, { color: theme.subText }]}>
            {TEXT.learnedToday[lang]}
          </Text>
          <TouchableOpacity onPress={() => setShowAddTarget(true)}>
            <Text style={[styles.progressLink, { color: theme.primary }]}>
              {TEXT.editTarget[lang]}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.progressMainRow}>
          <Text style={[styles.progressMain, { color: theme.text }]}>
            <Text style={[styles.progressNumber, { color: theme.text }]}>
              {learningToday.learned}
              {TEXT.learnMin[lang]}
            </Text>
            <Text style={[styles.progressTotal, { color: theme.subText }]}>
              {" "}
              / {learningToday.target}
              {TEXT.learnMin[lang]}
            </Text>
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBar,
              {
                backgroundColor: theme.primary,
                width: `${(learningToday.learned / learningToday.target) * 100}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* Suggestion Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.suggestScroll}
      >
        {suggestions.map((item, idx) => (
          <View
            style={[
              styles.suggestCard,
              { backgroundColor: theme.primary + "14" },
              idx > 0 && { marginLeft: scale(12) },
            ]}
            key={item.title}
          >
            <Text style={[styles.suggestTitle, { color: theme.text }]}>
              {item.title}
            </Text>
            <TouchableOpacity
              style={[styles.suggestBtn, { backgroundColor: theme.primary }]}
              onPress={() =>
                addActivity(`${TEXT.started[lang]}: ${item.title}`, "learned")
              }
            >
              <Text style={[styles.suggestBtnText, { color: theme.card }]}>
                {item.btn}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.suggestImg, { fontSize: scale(54) }]}>
              {item.emoji}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Learning Plan */}
      <Text style={[styles.planTitle, { color: theme.text }]}>
        {TEXT.learningPlan[lang]}
      </Text>
      <View
        style={[
          styles.planCard,
          { backgroundColor: theme.card, shadowColor: theme.primary },
        ]}
      >
        {plans.map((plan, idx) => (
          <View style={styles.planRow} key={plan.name}>
            <View
              style={[
                styles.planProgressCircle,
                { backgroundColor: theme.card, borderColor: theme.subText },
              ]}
            >
              <View
                style={[
                  styles.planProgressFill,
                  {
                    backgroundColor: theme.primary,
                    width: `${(plan.progress / plan.total) * 100}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.planName, { color: theme.text }]}>
              {plan.name}
            </Text>
            <Text style={[styles.planProgress, { color: theme.subText }]}>
              <Text style={[styles.planProgressBold, { color: theme.text }]}>
                {plan.progress}
              </Text>
              /{plan.total}
            </Text>
            <TouchableOpacity
              onPress={() =>
                addActivity(
                  `${TEXT.reviewedPlan[lang]}: ${plan.name}`,
                  "learned",
                )
              }
              style={{ marginLeft: scale(10) }}
            >
              <Feather
                name="arrow-right-circle"
                size={scale(22)}
                color={theme.primary}
              />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Streak/achievement widget */}
      <View
        style={[
          styles.streakWidget,
          { backgroundColor: "#fff8ea", borderColor: "#FFF3D3" },
        ]}
      >
        <TouchableOpacity style={styles.streakMain} onPress={handleShowStreak}>
          <Ionicons name="flame" size={scale(28)} color="#FF7F00" />
          <View style={{ marginLeft: scale(10) }}>
            <Text style={styles.streakDays}>7-{TEXT.streak[lang]}</Text>
            <Text style={styles.streakSub}>{TEXT.keepItUp[lang]}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.streakBtn}
          onPress={() => addActivity(TEXT.sharedStreak[lang], "achievement")}
        >
          <Ionicons
            name="share-social-outline"
            size={scale(22)}
            color={theme.primary}
          />
          <Text
            style={{
              marginLeft: scale(4),
              color: theme.primary,
              fontWeight: "bold",
            }}
          >
            {TEXT.share[lang]}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity title */}
      <Text
        style={[styles.planTitle, { marginTop: scale(32), color: theme.text }]}
      >
        {TEXT.recentActivity[lang]}
      </Text>
    </View>
  );

  const renderAnimatedHeader = () => (
    <Animated.View
      style={[
        styles.header,
        {
          height: headerHeight,
          paddingTop: scale(48),
          paddingBottom: scale(28),
          backgroundColor: theme.primary,
        },
      ]}
    >
      <View style={{ flex: 1, position: "relative", height: scale(56) }}>
        <Animated.Text
          style={[
            styles.headerHi,
            {
              fontSize: titleSize,
              position: "absolute",
              top: scale(14),
              left: 0,
              right: 0,
              zIndex: 2,
              color: theme.card,
            },
          ]}
        >
          {TEXT.hi[lang]}, {user.name}
        </Animated.Text>
        <Animated.Text
          style={[
            styles.headerSub,
            {
              opacity: subOpacity,
              position: "absolute",
              top: scale(44),
              left: 0,
              right: 0,
              zIndex: 1,
              color: theme.card,
            },
          ]}
        >
          {TEXT.letsLearn[lang]}
        </Animated.Text>
      </View>
      <Animated.Image
        source={user.avatar}
        style={[
          styles.avatar,
          {
            width: avatarSize,
            height: avatarSize,
            borderRadius: AVATAR_MAX / 2,
            borderColor: theme.card,
            backgroundColor: theme.card,
          },
        ]}
      />
    </Animated.View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {renderAnimatedHeader()}
      <FlatList
        data={activities}
        keyExtractor={(_, idx) => idx.toString()}
        ListHeaderComponent={renderListHeader()}
        contentContainerStyle={{
          paddingBottom: scale(134),
          paddingTop: scale(140),
        }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        renderItem={({ item }) => (
          <View style={styles.activityRow}>
            <Ionicons
              name={
                item.icon === "book"
                  ? "book-outline"
                  : item.icon === "star"
                    ? "star-outline"
                    : "alarm-outline"
              }
              size={scale(20)}
              color={
                item.type === "learned"
                  ? theme.primary
                  : item.type === "achievement"
                    ? "#FFD600"
                    : "#FF7F00"
              }
            />
            <Text style={[styles.activityText, { color: theme.text }]}>
              {item.text}
            </Text>
            <Text style={[styles.activityTime, { color: theme.subText }]}>
              {item.time}
            </Text>
          </View>
        )}
        ListFooterComponent={
          <View
            style={[
              styles.banner,
              {
                backgroundColor: theme.primary + "14",
                shadowColor: theme.primary,
              },
            ]}
          >
            <View>
              <Text style={[styles.bannerTitle, { color: theme.text }]}>
                {TEXT.meetup[lang]}
              </Text>
              <Text style={[styles.bannerSub, { color: theme.subText }]}>
                {TEXT.meetupDesc[lang]}
              </Text>
            </View>
            <Text style={styles.bannerImg}>👨‍👩‍👧‍👦</Text>
          </View>
        }
      />

      {/* Modal chỉnh sửa mục tiêu */}
      <Modal visible={showAddTarget} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.primary }]}>
              {TEXT.editDailyTarget[lang]}
            </Text>
            <TextInput
              style={[
                styles.input,
                { color: theme.text, backgroundColor: theme.background },
              ]}
              keyboardType="number-pad"
              value={newTarget}
              onChangeText={setNewTarget}
              placeholder={TEXT.enterTarget[lang]}
              placeholderTextColor={theme.subText}
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={() => setShowAddTarget(false)}
              >
                <Text>{TEXT.cancel[lang]}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.primary }]}
                onPress={handleSaveTarget}
              >
                <Text style={{ color: "#fff" }}>{TEXT.save[lang]}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal xem chi tiết streak */}
      <Modal visible={showStreakDetail} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[styles.streakDetailModal, { backgroundColor: theme.card }]}
          >
            <Ionicons
              name="flame"
              size={scale(44)}
              color="#FF7F00"
              style={{ alignSelf: "center" }}
            />
            <Text
              style={{
                fontSize: scale(20),
                fontWeight: "bold",
                textAlign: "center",
                marginVertical: scale(10),
                color: theme.primary,
              }}
            >
              7-{TEXT.streakDetail[lang]}
            </Text>
            <Text
              style={{
                color: theme.text,
                textAlign: "center",
                marginBottom: scale(20),
              }}
            >
              {TEXT.studiedStreak[lang]} 7 {TEXT.daysInARow[lang]}
            </Text>
            <TouchableOpacity
              style={[
                styles.modalBtn,
                { backgroundColor: theme.primary, alignSelf: "center" },
              ]}
              onPress={handleHideStreak}
            >
              <Text style={{ color: "#fff" }}>{TEXT.close[lang]}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <CustomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: scale(24),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerHi: {
    fontWeight: "bold",
    marginBottom: scale(2),
  },
  headerSub: {
    fontSize: scale(15),
    opacity: 0.9,
  },
  avatar: {
    borderWidth: 2,
  },
  progressCard: {
    marginHorizontal: scale(24),
    marginTop: scale(20),
    borderRadius: scale(16),
    padding: scale(18),
    shadowOpacity: 0.06,
    shadowRadius: scale(6),
    elevation: 2,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: scale(6),
  },
  progressLabel: {
    fontSize: scale(13),
  },
  progressLink: {
    fontSize: scale(13),
    fontWeight: "bold",
  },
  progressMainRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: scale(6),
  },
  progressMain: {
    fontSize: scale(17),
    fontWeight: "500",
  },
  progressNumber: {
    fontSize: scale(24),
    fontWeight: "bold",
  },
  progressTotal: {
    fontSize: scale(16),
    fontWeight: "400",
  },
  progressBarBg: {
    width: "100%",
    height: scale(6),
    borderRadius: scale(4),
    marginTop: scale(2),
    overflow: "hidden",
  },
  progressBar: {
    height: scale(6),
    borderRadius: scale(4),
  },
  suggestScroll: {
    marginTop: scale(28),
    paddingLeft: scale(24),
  },
  suggestCard: {
    width: scale(220),
    borderRadius: scale(16),
    padding: scale(20),
    marginRight: scale(12),
    position: "relative",
    overflow: "hidden",
    justifyContent: "flex-start",
  },
  suggestTitle: {
    fontSize: scale(17),
    fontWeight: "bold",
    marginBottom: scale(16),
  },
  suggestBtn: {
    paddingVertical: scale(8),
    paddingHorizontal: scale(18),
    borderRadius: scale(8),
    alignSelf: "flex-start",
    marginBottom: scale(8),
  },
  suggestBtnText: {
    fontWeight: "bold",
    fontSize: scale(15),
  },
  suggestImg: {
    position: "absolute",
    right: scale(8),
    bottom: scale(8),
  },
  planTitle: {
    fontSize: scale(18),
    fontWeight: "bold",
    marginLeft: scale(24),
    marginTop: scale(34),
    marginBottom: scale(8),
  },
  planCard: {
    marginHorizontal: scale(24),
    borderRadius: scale(16),
    paddingVertical: scale(10),
    paddingHorizontal: scale(14),
    shadowOpacity: 0.06,
    shadowRadius: scale(6),
    elevation: 2,
  },
  planRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: scale(8),
  },
  planProgressCircle: {
    width: scale(26),
    height: scale(26),
    borderRadius: scale(13),
    borderWidth: 2,
    marginRight: scale(14),
    overflow: "hidden",
  },
  planProgressFill: {
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    borderRadius: scale(13),
  },
  planName: {
    flex: 1,
    fontSize: scale(15),
    fontWeight: "500",
  },
  planProgress: {
    fontSize: scale(14),
    fontWeight: "400",
  },
  planProgressBold: {
    fontWeight: "bold",
    fontSize: scale(15),
  },
  streakWidget: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: scale(24),
    marginTop: scale(28),
    padding: scale(14),
    borderRadius: scale(16),
    borderWidth: 1,
  },
  streakMain: {
    flexDirection: "row",
    alignItems: "center",
  },
  streakDays: {
    fontWeight: "bold",
    fontSize: scale(16),
    color: "#FF7F00",
  },
  streakSub: {
    fontSize: scale(13),
    color: "#C88325",
    marginTop: scale(2),
  },
  streakBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: scale(10),
    paddingVertical: scale(7),
    paddingHorizontal: scale(13),
    borderWidth: 1,
    borderColor: "#E2D0B6",
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: scale(7),
    borderBottomWidth: 1,
    borderColor: "#F4F4F4",
    marginHorizontal: scale(24),
  },
  activityText: {
    flex: 1,
    marginLeft: scale(9),
    fontSize: scale(15),
  },
  activityTime: {
    marginLeft: scale(8),
    fontSize: scale(13),
  },
  banner: {
    marginHorizontal: scale(24),
    marginTop: scale(24),
    borderRadius: scale(18),
    padding: scale(18),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowOpacity: 0.06,
    shadowRadius: scale(6),
    elevation: 2,
  },
  bannerTitle: {
    fontSize: scale(19),
    fontWeight: "bold",
    marginBottom: scale(3),
  },
  bannerSub: {
    fontSize: scale(13),
    width: scale(120),
  },
  bannerImg: {
    fontSize: scale(48),
    marginLeft: scale(12),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(40,40,50,0.22)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: scale(18),
    padding: scale(22),
    width: "84%",
    shadowColor: "#222",
    shadowOpacity: 0.11,
    shadowRadius: scale(10),
    elevation: 5,
  },
  modalTitle: {
    fontSize: scale(19),
    fontWeight: "700",
    marginBottom: scale(12),
  },
  input: {
    borderWidth: 1,
    borderRadius: scale(8),
    padding: scale(10),
    marginBottom: scale(10),
    fontSize: scale(16),
  },
  modalBtn: {
    paddingHorizontal: scale(20),
    paddingVertical: scale(10),
    borderRadius: scale(8),
    marginLeft: scale(10),
    marginTop: scale(6),
  },
  streakDetailModal: {
    borderRadius: scale(18),
    padding: scale(24),
    width: "80%",
    alignSelf: "center",
    alignItems: "center",
  },
});
