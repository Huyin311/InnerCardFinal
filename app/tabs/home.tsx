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
import { Colors } from "../../constants/Colors";
import CustomTabBar from "../../components/CustomTabBar";
import { Ionicons, Feather } from "@expo/vector-icons";

// Responsive helpers
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;

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

const suggestions = [
  {
    title: "What do you want to learn today?",
    emoji: "🧑‍🎓",
    btn: "Get Started",
  },
  {
    title: "Practice Speaking",
    emoji: "🗣️",
    btn: "Try Now",
  },
  {
    title: "Challenge a Friend",
    emoji: "🤝",
    btn: "Invite",
  },
];

const HEADER_MAX_HEIGHT = scale(140);
const HEADER_MIN_HEIGHT =
  scale(90) + (Platform.OS === "ios" ? 0 : StatusBar.currentHeight || 0);
const AVATAR_MAX = scale(48);
const AVATAR_MIN = scale(40);
const TITLE_MAX = scale(24);
const TITLE_MIN = scale(17);

export default function HomeScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;

  // Modal state
  const [showAddTarget, setShowAddTarget] = useState(false);
  const [newTarget, setNewTarget] = useState("");
  const [activities, setActivities] = useState(recentActivities);
  const [showStreakDetail, setShowStreakDetail] = useState(false);

  // Animate header
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

  // Thêm hoạt động
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

  // Xử lý chỉnh sửa mục tiêu ngày
  const handleSaveTarget = () => {
    if (!newTarget.trim() || isNaN(Number(newTarget))) {
      Alert.alert("Invalid", "Please enter a valid number.");
      return;
    }
    learningToday.target = Number(newTarget);
    setShowAddTarget(false);
    setNewTarget("");
    addActivity("Updated daily learning target", "achievement");
  };

  // Xử lý streak detail
  const handleShowStreak = () => setShowStreakDetail(true);
  const handleHideStreak = () => setShowStreakDetail(false);

  // Header toàn bộ phần đầu trang (trước activity)
  const renderListHeader = () => (
    <View style={{ paddingBottom: scale(15) }}>
      {/* Progress card */}
      <View style={styles.progressCard}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Learned today</Text>
          <TouchableOpacity onPress={() => setShowAddTarget(true)}>
            <Text style={styles.progressLink}>Edit target</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.progressMainRow}>
          <Text style={styles.progressMain}>
            <Text style={styles.progressNumber}>
              {learningToday.learned}min
            </Text>
            <Text style={styles.progressTotal}>
              {" "}
              / {learningToday.target}min
            </Text>
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBar,
              {
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
            style={[styles.suggestCard, idx > 0 && { marginLeft: scale(12) }]}
            key={item.title}
          >
            <Text style={styles.suggestTitle}>{item.title}</Text>
            <TouchableOpacity
              style={styles.suggestBtn}
              onPress={() => addActivity(`Started: ${item.title}`, "learned")}
            >
              <Text style={styles.suggestBtnText}>{item.btn}</Text>
            </TouchableOpacity>
            <Text style={[styles.suggestImg, { fontSize: scale(54) }]}>
              {item.emoji}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Learning Plan */}
      <Text style={styles.planTitle}>Learning Plan</Text>
      <View style={styles.planCard}>
        {plans.map((plan, idx) => (
          <View style={styles.planRow} key={plan.name}>
            <View style={styles.planProgressCircle}>
              <View
                style={[
                  styles.planProgressFill,
                  {
                    width: `${(plan.progress / plan.total) * 100}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planProgress}>
              <Text style={styles.planProgressBold}>{plan.progress}</Text>/
              {plan.total}
            </Text>
            <TouchableOpacity
              onPress={() =>
                addActivity(`Reviewed plan: ${plan.name}`, "learned")
              }
              style={{ marginLeft: scale(10) }}
            >
              <Feather
                name="arrow-right-circle"
                size={scale(22)}
                color={Colors.light.tint}
              />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Streak/achievement widget */}
      <View style={styles.streakWidget}>
        <TouchableOpacity style={styles.streakMain} onPress={handleShowStreak}>
          <Ionicons name="flame" size={scale(28)} color="#FF7F00" />
          <View style={{ marginLeft: scale(10) }}>
            <Text style={styles.streakDays}>7-day streak</Text>
            <Text style={styles.streakSub}>Keep it up!</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.streakBtn}
          onPress={() => addActivity("Shared your streak!", "achievement")}
        >
          <Ionicons
            name="share-social-outline"
            size={scale(22)}
            color="#2C4BFF"
          />
          <Text
            style={{
              marginLeft: scale(4),
              color: "#2C4BFF",
              fontWeight: "bold",
            }}
          >
            Share
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity title */}
      <Text style={[styles.planTitle, { marginTop: scale(32) }]}>
        Recent Activity
      </Text>
    </View>
  );

  // Animated header (không đổi)
  const renderAnimatedHeader = () => (
    <Animated.View
      style={[
        styles.header,
        {
          height: headerHeight,
          paddingTop: scale(48),
          paddingBottom: scale(28),
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
            },
          ]}
        >
          Hi, {user.name}
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
            },
          ]}
        >
          Let&apos;s start learning
        </Animated.Text>
      </View>
      <Animated.Image
        source={user.avatar}
        style={[
          styles.avatar,
          {
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize.interpolate
              ? avatarSize.interpolate({
                  inputRange: [AVATAR_MIN, AVATAR_MAX],
                  outputRange: [AVATAR_MIN / 2, AVATAR_MAX / 2],
                })
              : AVATAR_MAX / 2,
          },
        ]}
      />
    </Animated.View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.light.background }}>
      {renderAnimatedHeader()}

      <FlatList
        data={activities}
        keyExtractor={(_, idx) => idx.toString()}
        ListHeaderComponent={renderListHeader()}
        contentContainerStyle={{
          paddingBottom: scale(134),
          paddingTop: HEADER_MAX_HEIGHT,
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
                  ? "#3B5EFF"
                  : item.type === "achievement"
                    ? "#FFD600"
                    : "#FF7F00"
              }
            />
            <Text style={styles.activityText}>{item.text}</Text>
            <Text style={styles.activityTime}>{item.time}</Text>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.banner}>
            <View>
              <Text style={styles.bannerTitle}>Meetup</Text>
              <Text style={styles.bannerSub}>
                Off-line exchange of learning experience
              </Text>
            </View>
            <Text style={styles.bannerImg}>👨‍👩‍👧‍👦</Text>
          </View>
        }
      />

      {/* Modal chỉnh sửa mục tiêu */}
      <Modal visible={showAddTarget} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit daily target (minutes)</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={newTarget}
              onChangeText={setNewTarget}
              placeholder="Enter target (min)"
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={() => setShowAddTarget(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#2C4BFF" }]}
                onPress={handleSaveTarget}
              >
                <Text style={{ color: "#fff" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal xem chi tiết streak */}
      <Modal visible={showStreakDetail} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.streakDetailModal}>
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
              }}
            >
              7-day streak!
            </Text>
            <Text
              style={{
                color: "#666",
                textAlign: "center",
                marginBottom: scale(20),
              }}
            >
              You have studied for 7 days in a row! Keep your streak going.
            </Text>
            <TouchableOpacity
              style={[
                styles.modalBtn,
                { backgroundColor: "#2C4BFF", alignSelf: "center" },
              ]}
              onPress={handleHideStreak}
            >
              <Text style={{ color: "#fff" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Custom tab bar */}
      <CustomTabBar />
    </View>
  );
}

// Responsive styles
const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.light.tint,
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
    color: Colors.light.background,
    marginBottom: scale(2),
  },
  headerSub: {
    color: Colors.light.background,
    fontSize: scale(15),
    opacity: 0.9,
  },
  avatar: {
    borderWidth: 2,
    borderColor: Colors.light.background,
    backgroundColor: Colors.light.background,
  },
  progressCard: {
    marginHorizontal: scale(24),
    marginTop: scale(20),
    backgroundColor: Colors.light.background,
    borderRadius: scale(16),
    padding: scale(18),
    shadowColor: Colors.light.icon,
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
    color: Colors.light.icon,
    fontSize: scale(13),
  },
  progressLink: {
    color: Colors.light.tint,
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
    color: Colors.light.text,
  },
  progressNumber: {
    fontSize: scale(24),
    fontWeight: "bold",
    color: Colors.light.text,
  },
  progressTotal: {
    fontSize: scale(16),
    color: Colors.light.icon,
    fontWeight: "400",
  },
  progressBarBg: {
    width: "100%",
    height: scale(6),
    backgroundColor: Colors.light.muted,
    borderRadius: scale(4),
    marginTop: scale(2),
    overflow: "hidden",
  },
  progressBar: {
    height: scale(6),
    borderRadius: scale(4),
    backgroundColor: Colors.light.accent,
  },
  suggestScroll: {
    marginTop: scale(28),
    paddingLeft: scale(24),
  },
  suggestCard: {
    width: scale(220),
    backgroundColor: Colors.light.accent + "14",
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
    color: Colors.light.text,
    marginBottom: scale(16),
  },
  suggestBtn: {
    backgroundColor: Colors.light.tint,
    paddingVertical: scale(8),
    paddingHorizontal: scale(18),
    borderRadius: scale(8),
    alignSelf: "flex-start",
    marginBottom: scale(8),
  },
  suggestBtnText: {
    color: Colors.light.background,
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
    color: Colors.light.text,
    marginLeft: scale(24),
    marginTop: scale(34),
    marginBottom: scale(8),
  },
  planCard: {
    marginHorizontal: scale(24),
    backgroundColor: Colors.light.background,
    borderRadius: scale(16),
    paddingVertical: scale(10),
    paddingHorizontal: scale(14),
    shadowColor: Colors.light.icon,
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
    borderColor: Colors.light.muted,
    marginRight: scale(14),
    backgroundColor: Colors.light.background,
    overflow: "hidden",
  },
  planProgressFill: {
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    borderRadius: scale(13),
    backgroundColor: Colors.light.tint,
  },
  planName: {
    flex: 1,
    fontSize: scale(15),
    color: Colors.light.text,
    fontWeight: "500",
  },
  planProgress: {
    fontSize: scale(14),
    color: Colors.light.icon,
    fontWeight: "400",
  },
  planProgressBold: {
    color: Colors.light.text,
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
    backgroundColor: "#fff8ea",
    borderRadius: scale(16),
    borderWidth: 1,
    borderColor: "#FFF3D3",
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
    color: "#232323",
  },
  activityTime: {
    marginLeft: scale(8),
    color: "#BFC8D6",
    fontSize: scale(13),
  },
  banner: {
    marginHorizontal: scale(24),
    marginTop: scale(24),
    borderRadius: scale(18),
    backgroundColor: Colors.light.accent + "14",
    padding: scale(18),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: Colors.light.icon,
    shadowOpacity: 0.06,
    shadowRadius: scale(6),
    elevation: 2,
  },
  bannerTitle: {
    fontSize: scale(19),
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: scale(3),
  },
  bannerSub: {
    color: Colors.light.icon,
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
    backgroundColor: "#fff",
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
    borderColor: "#E4E6EF",
    borderRadius: scale(8),
    padding: scale(10),
    marginBottom: scale(10),
    fontSize: scale(16),
    color: "#222",
    backgroundColor: "#F7F8FB",
  },
  modalBtn: {
    paddingHorizontal: scale(20),
    paddingVertical: scale(10),
    borderRadius: scale(8),
    marginLeft: scale(10),
    backgroundColor: "#F4F4FB",
    marginTop: scale(6),
  },
  streakDetailModal: {
    backgroundColor: "#fff",
    borderRadius: scale(18),
    padding: scale(24),
    width: "80%",
    alignSelf: "center",
    alignItems: "center",
  },
});
