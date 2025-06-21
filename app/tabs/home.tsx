import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Platform,
  StatusBar,
  Image,
} from "react-native";
import { useDarkMode } from "../DarkModeContext";
import { useLanguage } from "../LanguageContext";
import { lightTheme, darkTheme } from "../theme";
import CustomTabBar from "../../components/CustomTabBar";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../../supabase/supabaseClient";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;

const TEXT = {
  hi: { vi: "Xin chào", en: "Hi" },
  letsLearn: { vi: "Cùng bắt đầu học nào", en: "Let's start learning" },
  learnedToday: { vi: "Số lượt học hôm nay", en: "Today's learning count" },
  editTarget: { vi: "Sửa mục tiêu", en: "Edit target" },
  learnMin: { vi: "lượt", en: "times" },
  activityType: { vi: "Loại", en: "Type" },
  group: { vi: "Nhóm", en: "Group" },
  activityContent: { vi: "Nội dung", en: "Content" },
  recentActivity: { vi: "Hoạt động nhóm gần đây", en: "Recent Group Activity" },
  meetup: { vi: "Giao lưu", en: "Meetup" },
  meetupDesc: {
    vi: "Trao đổi kinh nghiệm học offline",
    en: "Off-line exchange of learning experience",
  },
  editDailyTarget: {
    vi: "Sửa mục tiêu ngày (lượt)",
    en: "Edit daily target (times)",
  },
  enterTarget: { vi: "Nhập mục tiêu (lượt)", en: "Enter target (times)" },
  cancel: { vi: "Huỷ", en: "Cancel" },
  save: { vi: "Lưu", en: "Save" },
  invalid: { vi: "Không hợp lệ", en: "Invalid" },
  pleaseEnterValid: {
    vi: "Vui lòng nhập số hợp lệ.",
    en: "Please enter a valid number.",
  },
  close: { vi: "Đóng", en: "Close" },
};

function getLastWord(str: string) {
  if (!str) return "";
  const words = str.trim().split(" ");
  return words[words.length - 1];
}

export default function HomeScreen() {
  const { darkMode } = useDarkMode();
  const theme = darkMode ? darkTheme : lightTheme;
  const { lang } = useLanguage();
  const navigation = useNavigation();

  const [user, setUser] = useState<any>(null);
  const [avatar, setAvatar] = useState<any>(null);
  const [learningToday, setLearningToday] = useState({
    learned: 0,
    target: 0,
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddTarget, setShowAddTarget] = useState(false);
  const [newTarget, setNewTarget] = useState("");

  const scrollY = useRef(new Animated.Value(0)).current;
  const HEADER_MAX_HEIGHT = scale(140);
  const HEADER_MIN_HEIGHT =
    scale(90) + (Platform.OS === "ios" ? 0 : StatusBar.currentHeight || 0);
  const AVATAR_MAX = scale(48);
  const AVATAR_MIN = scale(40);
  const TITLE_MAX = scale(24);

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

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      // Lấy user supabase auth
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) {
        setLoading(false);
        return;
      }

      // Lấy thông tin user
      const { data: userData } = await supabase
        .from("users")
        .select("id, full_name, username, email, avatar_url")
        .eq("id", authUser.id)
        .single();

      if (!userData) {
        Alert.alert(
          "Lỗi dữ liệu",
          "Không tìm thấy thông tin người dùng trong bảng users!",
        );
        setLoading(false);
        return;
      }

      setUser(userData);
      setAvatar(
        userData.avatar_url
          ? { uri: userData.avatar_url }
          : require("../../assets/images/avatar.png"),
      );

      // Lấy mục tiêu ngày từ bảng setting (nếu có)
      let target = 60;
      const { data: setting } = await supabase
        .from("setting")
        .select("user_id, notification_enabled, dark_mode, language")
        .eq("user_id", authUser.id)
        .maybeSingle();
      // Nếu có logic mục tiêu riêng thì fetch ở đây, còn không thì để mặc định là 60
      // (Bạn có thể thêm cột target ở bảng setting để tuỳ chỉnh)

      // Đếm số lượt học hôm nay (số bản ghi study_histories hôm nay)
      const todayStr = new Date().toISOString().slice(0, 10);
      const { count: learnedCount } = await supabase
        .from("study_histories")
        .select("id", { count: "exact", head: true })
        .eq("user_id", authUser.id)
        .gte("studied_at", todayStr + "T00:00:00")
        .lte("studied_at", todayStr + "T23:59:59");
      setLearningToday({
        learned: learnedCount || 0,
        target,
      });

      // Lấy group id mà user là thành viên
      const { data: groupMemberships } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", authUser.id);
      const groupIds = groupMemberships?.map((g) => g.group_id) || [];

      // Lấy hoạt động group gần đây (nếu không có group thì bỏ qua)
      let groupActivities: any[] = [];
      if (groupIds.length > 0) {
        const { data: acts } = await supabase
          .from("group_activities")
          .select(
            "id, group_id, activity_type, content, created_by, created_at, groups(name)",
          )
          .in("group_id", groupIds)
          .order("created_at", { ascending: false })
          .limit(20);
        groupActivities = acts || [];
      }
      setActivities(groupActivities);

      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleSaveTarget = async () => {
    if (!newTarget.trim() || isNaN(Number(newTarget))) {
      Alert.alert(TEXT.invalid[lang], TEXT.pleaseEnterValid[lang]);
      return;
    }
    const newTargetNum = Number(newTarget);
    setLearningToday((prev) => ({ ...prev, target: newTargetNum }));
    setShowAddTarget(false);
    setNewTarget("");
    // Nếu muốn lưu xuống db, thêm lệnh update cho bảng setting nếu đã có cột target
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const renderAnimatedHeader = () =>
    user && avatar ? (
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
            {TEXT.hi[lang]}, {getLastWord(user?.full_name) || ""}
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
        <TouchableOpacity
          onPress={() => navigation.navigate("Profile" as never)}
          activeOpacity={0.8}
        >
          <Animated.Image
            source={avatar}
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
        </TouchableOpacity>
      </Animated.View>
    ) : null;

  const renderListHeader = () => (
    <View style={{ paddingBottom: scale(15) }}>
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
                width:
                  learningToday.target > 0
                    ? `${(learningToday.learned / learningToday.target) * 100}%`
                    : "0%",
              },
            ]}
          />
        </View>
      </View>
      <Text
        style={[styles.planTitle, { marginTop: scale(32), color: theme.text }]}
      >
        {TEXT.recentActivity[lang]}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {renderAnimatedHeader()}
      <FlatList
        data={activities}
        keyExtractor={(item, idx) =>
          item.id ? String(item.id) : idx.toString()
        }
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
                item.activity_type === "join"
                  ? "person-add"
                  : item.activity_type === "quiz"
                    ? "help-circle"
                    : item.activity_type === "announcement"
                      ? "megaphone"
                      : "notifications"
              }
              size={scale(22)}
              color={
                item.activity_type === "join"
                  ? theme.primary
                  : item.activity_type === "quiz"
                    ? "#FFD600"
                    : item.activity_type === "announcement"
                      ? "#4FC3F7"
                      : theme.subText
              }
              style={{ marginRight: scale(7) }}
            />
            <View style={{ flex: 1, marginLeft: scale(6) }}>
              <Text style={[styles.activityText, { color: theme.text }]}>
                <Text style={{ fontWeight: "bold" }}>
                  {item.groups?.name || ""}
                </Text>
                {" - "}
                {item.activity_type === "join"
                  ? "Thành viên mới tham gia"
                  : item.activity_type === "quiz"
                    ? "Quiz nhóm"
                    : item.activity_type === "announcement"
                      ? "Thông báo nhóm"
                      : item.activity_type}
              </Text>
              {!!item.content && (
                <Text
                  style={{
                    color: theme.subText,
                    fontSize: 13,
                    marginTop: 1,
                  }}
                  numberOfLines={2}
                >
                  {item.content}
                </Text>
              )}
              <Text style={[styles.activityTime, { color: theme.subText }]}>
                {item.created_at?.slice(0, 19).replace("T", " ")}
              </Text>
            </View>
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
        ListEmptyComponent={
          <Text
            style={{
              color: theme.subText,
              textAlign: "center",
              marginTop: scale(20),
            }}
          >
            Không có hoạt động nhóm gần đây
          </Text>
        }
      />

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
    backgroundColor: "#f7f7f7",
  },
  progressBar: {
    height: scale(6),
    borderRadius: scale(4),
  },
  planTitle: {
    fontSize: scale(18),
    fontWeight: "bold",
    marginLeft: scale(24),
    marginTop: scale(34),
    marginBottom: scale(8),
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: scale(10),
    borderBottomWidth: 1,
    borderColor: "#F4F4F4",
    marginHorizontal: scale(24),
  },
  activityText: {
    fontSize: scale(15),
  },
  activityTime: {
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
});
