import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDarkMode } from "../DarkModeContext";
import { lightTheme, darkTheme } from "../theme";
import { useLanguage } from "../LanguageContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;

// Định nghĩa type cho hoạt động để tránh lỗi TS7053
type ActivityType = "addCard" | "newMember" | "announce" | "comment";
type Lang = "vi" | "en";

const TEXT: Record<
  ActivityType | "groupActivity" | "noActivity",
  { vi: string; en: string }
> = {
  groupActivity: { vi: "Hoạt động nhóm", en: "Group Activity" },
  noActivity: { vi: "Chưa có hoạt động nào.", en: "No activity yet." },
  addCard: { vi: "Thêm thẻ mới", en: "Added new card" },
  newMember: { vi: "Thành viên mới", en: "New member" },
  announce: { vi: "Tạo thông báo", en: "Announcement" },
  comment: { vi: "Bình luận", en: "Comment" },
};

const activities: {
  id: string;
  type: ActivityType;
  detail: { vi: string; en: string };
  time: Date;
  icon: string;
  color: string;
}[] = [
  {
    id: "act1",
    type: "addCard",
    detail: {
      vi: "Lan Pham đã thêm thẻ 'Chủ đề: Môi trường'",
      en: "Lan Pham added card 'Topic: Environment'",
    },
    time: new Date("2025-06-17T20:05:00"),
    icon: "albums",
    color: "#00C48C",
  },
  {
    id: "act2",
    type: "newMember",
    detail: {
      vi: "Minh Tran đã tham gia nhóm",
      en: "Minh Tran joined the group",
    },
    time: new Date("2025-06-17T15:30:00"),
    icon: "person-add",
    color: "#4F8CFF",
  },
  {
    id: "act3",
    type: "announce",
    detail: {
      vi: "Huy Nguyen đã gửi thông báo: 'Lịch họp tuần này'",
      en: "Huy Nguyen sent announcement: 'This week's meeting schedule'",
    },
    time: new Date("2025-06-16T10:01:00"),
    icon: "notifications",
    color: "#FFB300",
  },
  {
    id: "act4",
    type: "comment",
    detail: {
      vi: "Lan Pham đã bình luận trong thẻ 'Chủ đề: Công việc'",
      en: "Lan Pham commented in card 'Topic: Work'",
    },
    time: new Date("2025-06-15T20:40:00"),
    icon: "chatbubble-ellipses",
    color: "#8C54FF",
  },
  // ... có thể thêm nhiều hoạt động hơn
];

export default function GroupActivities({ navigation }: any) {
  const { darkMode } = useDarkMode();
  const theme = darkMode ? darkTheme : lightTheme;
  const { lang } = useLanguage();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.section,
            borderBottomColor: theme.card || "#E4EAF2",
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack?.()}
        >
          <Ionicons
            name="chevron-back"
            size={scale(26)}
            color={theme.primary}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.primary }]}>
          {TEXT.groupActivity[lang]}
        </Text>
        <View style={{ width: scale(26) }} />
      </View>
      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: scale(18), paddingBottom: scale(32) }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.activityCard,
              { backgroundColor: theme.section, shadowColor: theme.primary },
            ]}
          >
            <View
              style={[
                styles.iconBox,
                { backgroundColor: item.color + (darkMode ? "44" : "22") },
              ]}
            >
              <Ionicons
                name={item.icon as any}
                size={scale(22)}
                color={item.color}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.type, { color: theme.primary }]}>
                {TEXT[item.type][lang as Lang]}
              </Text>
              <Text style={[styles.detail, { color: theme.text }]}>
                {item.detail[lang]}
              </Text>
              <Text style={[styles.time, { color: theme.subText }]}>
                {item.time instanceof Date
                  ? item.time.toLocaleString()
                  : new Date(item.time).toLocaleString()}
              </Text>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: scale(12) }} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.subText }]}>
              {TEXT.noActivity[lang]}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  activityCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: scale(14),
    padding: scale(14),
    elevation: 2,
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: scale(4) },
    shadowRadius: scale(10),
  },
  iconBox: {
    width: scale(42),
    height: scale(42),
    borderRadius: scale(12),
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(14),
  },
  type: {
    fontSize: scale(15),
    fontWeight: "bold",
    marginBottom: scale(2),
  },
  detail: {
    fontSize: scale(14),
    marginBottom: scale(3),
  },
  time: {
    fontSize: scale(12),
    fontStyle: "italic",
    marginTop: scale(2),
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: scale(50),
  },
  emptyText: {
    fontSize: scale(15),
    fontStyle: "italic",
  },
});
