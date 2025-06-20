import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDarkMode } from "../DarkModeContext";
import { lightTheme, darkTheme } from "../theme";
import { useLanguage } from "../LanguageContext";
import { supabase } from "../../supabase/supabaseClient";
import { useUserId } from "../../hooks/useUserId";

const { height, width } = Dimensions.get("window");
const scale = (size: number) => (width / 375) * size;

const TEXT = {
  group: { vi: "Nhóm", en: "Group" },
  noGroup: { vi: "Không tìm thấy nhóm nào", en: "No groups found" },
  createGroup: { vi: "Tạo nhóm mới", en: "Create Group" },
  loading: { vi: "Đang tải dữ liệu...", en: "Loading..." },
  searchGroup: { vi: "Tìm nhóm", en: "Search group" },
  memberCount: { vi: "thành viên", en: "members" },
  noAnnouncement: { vi: "Chưa có thông báo", en: "No announcement yet" },
  groupNameRequired: {
    vi: "Tên nhóm không được để trống",
    en: "Group name cannot be blank",
  },
  inputRequired: { vi: "Thiếu thông tin", en: "Missing information" },
  groupName: { vi: "Tên nhóm", en: "Group name" },
  groupDesc: { vi: "Mô tả", en: "Description" },
  create: { vi: "Tạo", en: "Create" },
};

const filterCategories = [
  "Ngôn ngữ",
  "Kỹ năng",
  "Lập trình",
  "Cộng đồng",
  "Học thuật",
];

export default function Group() {
  const navigation = useNavigation();
  const { darkMode } = useDarkMode();
  const theme = darkMode ? darkTheme : lightTheme;
  const { lang } = useLanguage();
  const userId = useUserId();

  const [groups, setGroups] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal tạo nhóm (tối giản)
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    category: filterCategories[0],
  });

  // Fetch group list from DB
  useEffect(() => {
    fetchGroups();
    // eslint-disable-next-line
  }, [userId]);

  async function fetchGroups() {
    if (!userId) return;
    setLoading(true);
    // 1. Lấy group_id user là member từ group_members
    const { data: memberData, error: memberErr } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", userId);

    if (memberErr || !memberData || memberData.length === 0) {
      setGroups([]);
      setLoading(false);
      return;
    }
    const groupIds = memberData.map((m) => m.group_id);
    // 2. Lấy thông tin group
    const { data: groupsData, error: groupErr } = await supabase
      .from("groups")
      .select("id, name, description, owner_id, created_at")
      .in("id", groupIds);

    if (groupErr || !groupsData) {
      setGroups([]);
      setLoading(false);
      return;
    }

    // 3. Lấy số thành viên cho mỗi group
    const groupCounts: Record<number, number> = {};
    for (let groupId of groupIds) {
      const { count } = await supabase
        .from("group_members")
        .select("*", { count: "exact", head: true })
        .eq("group_id", groupId);
      groupCounts[groupId] = count || 1;
    }

    // 4. Lấy thông tin owner cho từng group
    const ownerIds = Array.from(new Set(groupsData.map((g) => g.owner_id)));
    let owners: Record<string, any> = {};
    if (ownerIds.length > 0) {
      const { data: ownerData } = await supabase
        .from("users")
        .select("id, full_name, avatar_url")
        .in("id", ownerIds);
      if (ownerData) {
        ownerData.forEach((owner) => {
          owners[owner.id] = owner;
        });
      }
    }

    // 5. Lấy thông báo mới nhất cho từng group
    let announcements: Record<number, any> = {};
    const { data: announceData } = await supabase
      .from("group_announcements")
      .select("group_id, content, created_at")
      .order("created_at", { ascending: false });
    if (announceData) {
      announceData.forEach((a) => {
        if (!announcements[a.group_id]) {
          announcements[a.group_id] = a;
        }
      });
    }

    // 6. Map dữ liệu về cho UI
    const groupList = groupsData.map((g) => ({
      id: g.id,
      name: g.name,
      owner: owners[g.owner_id]?.full_name || "Unknown",
      avatar: owners[g.owner_id]?.avatar_url
        ? { uri: owners[g.owner_id].avatar_url }
        : require("../../assets/images/avatar.png"),
      memberCount: groupCounts[g.id] || 1,
      description: g.description,
      createdAt: g.created_at ? new Date(g.created_at) : new Date(),
      latestAnnouncement: announcements[g.id]
        ? {
            content: announcements[g.id].content,
            postedAt: announcements[g.id].created_at,
          }
        : undefined,
    }));

    setGroups(groupList);
    setLoading(false);
  }

  const filterGroups = () => {
    let res = [...groups];
    if (searchText.trim() !== "") {
      res = res.filter((g) =>
        g.name.toLowerCase().includes(searchText.toLowerCase()),
      );
    }
    return res;
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchGroups().then(() => setRefreshing(false));
  };

  const handleAddGroup = async () => {
    if (!newGroup.name.trim()) {
      Alert.alert(TEXT.inputRequired[lang], TEXT.groupNameRequired[lang]);
      return;
    }
    // Insert group vào DB
    const { data, error } = await supabase
      .from("groups")
      .insert({
        name: newGroup.name,
        description: newGroup.description,
        owner_id: userId,
      })
      .select("id")
      .single();
    if (error || !data) {
      Alert.alert("Error", error?.message || "Can't create group");
      return;
    }
    // Thêm user vào group_members
    await supabase.from("group_members").insert({
      group_id: data.id,
      user_id: userId,
      role: "owner",
    });
    setNewGroup({
      name: "",
      description: "",
      category: filterCategories[0],
    });
    setAddModalVisible(false);
    fetchGroups();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.text }]}>
          {TEXT.group[lang]}
        </Text>
        <TouchableOpacity>
          <Image
            source={require("../../assets/images/avatar.png")}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>
      {/* Search */}
      <View style={[styles.searchRow, { backgroundColor: theme.section }]}>
        <Ionicons
          name="search"
          size={scale(18)}
          color={theme.subText}
          style={{ marginLeft: scale(8) }}
        />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder={TEXT.searchGroup[lang]}
          placeholderTextColor={theme.subText}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
      <View style={{ flex: 1 }}>
        {loading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={{ color: theme.subText, marginTop: scale(10) }}>
              {TEXT.loading[lang]}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filterGroups()}
            keyExtractor={(item) => String(item.id)}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={onRefresh}
            contentContainerStyle={{
              paddingBottom: scale(24),
              flexGrow: 1,
              minHeight: scale(220),
            }}
            renderItem={({ item }) => (
              <View style={styles.cardItemBox}>
                <TouchableOpacity
                  style={[
                    styles.cardItem,
                    { backgroundColor: theme.card, shadowColor: theme.card },
                  ]}
                  activeOpacity={0.82}
                  onPress={() => {
                    navigation.navigate(
                      "GroupDetail" as never,
                      { groupId: item.id } as never,
                    );
                  }}
                >
                  <View
                    style={[
                      styles.cardImageBox,
                      { backgroundColor: theme.section },
                    ]}
                  >
                    <Image
                      source={item.avatar}
                      style={styles.cardImagePlaceholder}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>
                      {item.name}
                    </Text>
                    <Text
                      style={[styles.cardDesc, { color: theme.subText }]}
                      numberOfLines={1}
                    >
                      {item.description}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: scale(3),
                      }}
                    >
                      <Ionicons
                        name="person"
                        size={scale(14)}
                        color={theme.subText}
                      />
                      <Text
                        style={[styles.cardAuthor, { color: theme.subText }]}
                      >
                        {" "}
                        {item.owner}
                      </Text>
                      <Ionicons
                        name="people-outline"
                        size={scale(15)}
                        color={theme.subText}
                        style={{ marginLeft: scale(10) }}
                      />
                      <Text
                        style={[
                          styles.cardTotalCards,
                          { color: theme.primary },
                        ]}
                      >
                        {"  "}
                        {item.memberCount} {TEXT.memberCount[lang]}
                      </Text>
                    </View>
                    {item.latestAnnouncement ? (
                      <View
                        style={[
                          styles.announcementBox,
                          { backgroundColor: darkMode ? "#1a2256" : "#F1F6FF" },
                        ]}
                      >
                        <Ionicons
                          name="notifications"
                          size={scale(14)}
                          color={theme.primary}
                        />
                        <Text
                          style={[
                            styles.announcementText,
                            { color: theme.primary },
                          ]}
                          numberOfLines={1}
                        >
                          {item.latestAnnouncement.content}
                        </Text>
                      </View>
                    ) : (
                      <Text
                        style={[
                          styles.noAnnouncement,
                          { color: theme.subText },
                        ]}
                      >
                        {TEXT.noAnnouncement[lang]}
                      </Text>
                    )}
                  </View>
                  {/*<Ionicons*/}
                  {/*  name="chevron-forward"*/}
                  {/*  size={scale(22)}*/}
                  {/*  color={theme.subText}*/}
                  {/*/>*/}
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: scale(50),
                }}
              >
                <Image
                  source={require("../../assets/images/avatar.png")}
                  style={{
                    width: scale(110),
                    height: scale(110),
                    marginBottom: scale(14),
                  }}
                />
                <Text style={{ color: theme.subText, fontSize: scale(17) }}>
                  {TEXT.noGroup[lang]}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.emptyAddBtn,
                    { backgroundColor: theme.primary },
                  ]}
                  onPress={() => setAddModalVisible(true)}
                >
                  <Ionicons name="add" size={scale(22)} color="#fff" />
                  <Text style={{ color: "#fff", marginLeft: scale(5) }}>
                    {TEXT.createGroup[lang]}
                  </Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
      {/* Modal tạo nhóm (tối ưu dark/light mode) */}
      {addModalVisible && (
        <View
          style={[
            styles.modalOverlay,
            {
              backgroundColor: darkMode
                ? "rgba(7,15,36,0.72)"
                : "rgba(40,40,50,0.22)",
            },
          ]}
        >
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.card,
                shadowColor: darkMode ? "#111" : "#222",
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.primary }]}>
              {TEXT.createGroup[lang]}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                  backgroundColor: theme.section,
                  borderColor: darkMode ? "#373A44" : "#E4E6EF",
                },
              ]}
              placeholder={TEXT.groupName[lang]}
              placeholderTextColor={theme.subText}
              value={newGroup.name}
              onChangeText={(t) =>
                setNewGroup((prev) => ({ ...prev, name: t }))
              }
            />
            <TextInput
              style={[
                styles.input,
                {
                  minHeight: scale(48),
                  color: theme.text,
                  backgroundColor: theme.section,
                  borderColor: darkMode ? "#373A44" : "#E4E6EF",
                },
              ]}
              placeholder={TEXT.groupDesc[lang]}
              placeholderTextColor={theme.subText}
              value={newGroup.description}
              onChangeText={(t) =>
                setNewGroup((prev) => ({ ...prev, description: t }))
              }
              multiline
            />
            <View style={{ flexDirection: "row", marginTop: 10 }}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.primary }]}
                onPress={handleAddGroup}
              >
                <Text style={{ color: "#fff" }}>{TEXT.create[lang]}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  {
                    backgroundColor: darkMode ? "#222" : "#eee",
                    marginLeft: 12,
                  },
                ]}
                onPress={() => setAddModalVisible(false)}
              >
                <Text style={{ color: theme.text }}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 0 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: scale(8),
    marginBottom: scale(18),
    paddingHorizontal: scale(24),
    justifyContent: "space-between",
  },
  title: { fontSize: scale(30), fontWeight: "bold", color: "#222" },
  avatar: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    backgroundColor: "#eee",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F8FB",
    borderRadius: scale(16),
    marginHorizontal: scale(24),
    paddingHorizontal: scale(8),
    marginBottom: scale(18),
    height: scale(44),
  },
  searchInput: {
    flex: 1,
    fontSize: scale(16),
    marginLeft: scale(6),
    color: "#222",
    backgroundColor: "transparent",
  },
  cardItemBox: { marginBottom: scale(11) },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: scale(16),
    marginHorizontal: scale(24),
    padding: scale(16),
    shadowColor: "#BFC8D6",
    shadowOpacity: 0.12,
    shadowRadius: scale(8),
    elevation: 3,
  },
  cardImageBox: {
    width: scale(58),
    height: scale(58),
    borderRadius: scale(12),
    marginRight: scale(16),
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  cardImagePlaceholder: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(8),
    backgroundColor: "#D9DBE9",
  },
  cardTitle: { fontSize: scale(17), fontWeight: "bold", color: "#222" },
  cardDesc: {
    color: "#BFC8D6",
    fontSize: scale(13),
    marginTop: scale(2),
    marginBottom: 0,
  },
  cardAuthor: { fontSize: scale(13), color: "#BFC8D6", marginLeft: scale(2) },
  cardTotalCards: {
    fontSize: scale(13),
    color: "#3B5EFF",
    marginLeft: scale(2),
    fontWeight: "bold",
  },
  announcementBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: scale(7),
    backgroundColor: "#F1F6FF",
    paddingHorizontal: scale(8),
    paddingVertical: scale(3),
    borderRadius: scale(8),
  },
  announcementText: {
    marginLeft: scale(4),
    color: "#3B5EFF",
    fontSize: scale(13),
    flex: 1,
    fontWeight: "bold",
  },
  noAnnouncement: {
    fontSize: scale(12),
    color: "#BFC8D6",
    marginTop: scale(7),
    fontStyle: "italic",
  },
  emptyAddBtn: {
    marginTop: scale(18),
    backgroundColor: "#3B5EFF",
    borderRadius: scale(18),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(20),
    paddingVertical: scale(9),
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(40,40,50,0.22)",
    zIndex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: scale(18),
    padding: scale(22),
    width: width * 0.85,
    shadowColor: "#222",
    shadowOpacity: 0.11,
    shadowRadius: scale(10),
    elevation: 5,
  },
  modalTitle: {
    fontSize: scale(22),
    fontWeight: "700",
    color: "#222",
    marginBottom: 10,
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
    backgroundColor: "#F4F4FB",
    marginTop: scale(6),
    flexDirection: "row",
    alignItems: "center",
    minWidth: scale(64),
    justifyContent: "center",
  },
});
