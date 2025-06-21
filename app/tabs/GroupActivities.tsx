import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDarkMode } from "../DarkModeContext";
import { lightTheme, darkTheme } from "../theme";
import { useLanguage } from "../LanguageContext";
import { supabase } from "../../supabase/supabaseClient";

export default function GroupActivities({ navigation, route }: any) {
  const { darkMode } = useDarkMode();
  const theme = darkMode ? darkTheme : lightTheme;
  const { lang } = useLanguage();

  const groupId = route?.params?.groupId;

  type DBActivity = {
    id: number;
    group_id: number;
    activity_type: string;
    content: string | null;
    created_by: string | null;
    created_at: string;
  };

  type UIActivity = {
    id: string;
    type: string;
    detail: { vi: string; en: string };
    time: Date;
    icon: string;
    color: string;
  };

  const activityTypeMap: Record<
    string,
    { icon: string; color: string; text: { vi: string; en: string } }
  > = {
    join: {
      icon: "person-add",
      color: "#4F8CFF",
      text: {
        vi: "Thành viên mới tham gia nhóm",
        en: "New member joined the group",
      },
    },
    quiz: {
      icon: "help-circle",
      color: "#00C48C",
      text: { vi: "Làm quiz", en: "Completed quiz" },
    },
    announcement: {
      icon: "notifications",
      color: "#FFB300",
      text: { vi: "Tạo thông báo", en: "Announcement" },
    },
    comment: {
      icon: "chatbubble-ellipses",
      color: "#8C54FF",
      text: { vi: "Bình luận", en: "Comment" },
    },
    addCard: {
      icon: "albums",
      color: "#00C48C",
      text: { vi: "Thêm thẻ mới", en: "Added new card" },
    },
    add_deck: {
      icon: "albums",
      color: "#2E88FF",
      text: { vi: "Thêm bộ thẻ", en: "Added deck" },
    },
    remove_deck: {
      icon: "trash",
      color: "#FF6B6B",
      text: { vi: "Xóa bộ thẻ", en: "Removed deck" },
    },
    edit_deck: {
      icon: "create",
      color: "#FFA726",
      text: { vi: "Sửa bộ thẻ", en: "Edited deck" },
    },
    share_deck: {
      icon: "share-social",
      color: "#6C63FF",
      text: { vi: "Chia sẻ bộ thẻ", en: "Shared deck" },
    },
    view_group_decks: {
      icon: "albums-outline",
      color: "#7BC67E",
      text: { vi: "Xem danh sách bộ thẻ", en: "Viewed group decks" },
    },
    view_deck_detail: {
      icon: "book-outline",
      color: "#00B8D9",
      text: { vi: "Xem chi tiết bộ thẻ", en: "Viewed deck detail" },
    },
    promote: {
      icon: "star",
      color: "#FFD700",
      text: { vi: "Thăng chức thành quản trị viên", en: "Promoted to admin" },
    },
    demote: {
      icon: "remove-circle",
      color: "#B0BEC5",
      text: { vi: "Giáng chức khỏi quản trị viên", en: "Demoted from admin" },
    },
    remove: {
      icon: "person-remove",
      color: "#FF5252",
      text: { vi: "Xóa thành viên", en: "Removed member" },
    },
    default: {
      icon: "alert",
      color: "#888",
      text: { vi: "Hoạt động khác", en: "Other activity" },
    },
  };

  const TEXT = {
    groupActivity: { vi: "Hoạt động nhóm", en: "Group Activity" },
    noActivity: { vi: "Chưa có hoạt động nào.", en: "No activity yet." },
  };

  const [activities, setActivities] = useState<UIActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) return;
    fetchActivities();
  }, [groupId]);

  async function fetchActivities() {
    setLoading(true);
    const { data, error } = await supabase
      .from("group_activities")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: false });
    if (error) {
      setActivities([]);
      setLoading(false);
      return;
    }
    const mapped: UIActivity[] = (data || []).map((act: DBActivity) => {
      const typeInfo =
        activityTypeMap[act.activity_type] || activityTypeMap.default;
      const detailText = act.content
        ? { vi: act.content, en: act.content }
        : typeInfo.text;
      return {
        id: act.id.toString(),
        type: act.activity_type,
        detail: detailText,
        time: new Date(act.created_at),
        icon: typeInfo.icon,
        color: typeInfo.color,
      };
    });
    setActivities(mapped);
    setLoading(false);
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
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
      {loading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: scale(18),
            paddingBottom: scale(32),
          }}
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
                  {activityTypeMap[item.type]?.text
                    ? activityTypeMap[item.type].text[lang]
                    : item.type}
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
      )}
    </SafeAreaView>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;

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
