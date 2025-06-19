import React, { useState, useRef, useEffect } from "react";
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
  Animated,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDarkMode } from "../DarkModeContext";
import { lightTheme, darkTheme } from "../theme";
import { useLanguage } from "../LanguageContext";

const { height, width } = Dimensions.get("window");
const scale = (size: number) => (width / 375) * size;

const TEXT = {
  group: { vi: "Nhóm", en: "Group" },
  myGroup: { vi: "Nhóm của bạn", en: "Your Groups" },
  pending: { vi: "Chờ duyệt", en: "Pending" },
  invite: { vi: "Lời mời", en: "Invitations" },
  noGroup: { vi: "Không tìm thấy nhóm nào", en: "No groups found" },
  createGroup: { vi: "Tạo nhóm mới", en: "Create Group" },
  waiting: { vi: "Đang chờ duyệt...", en: "Pending approval..." },
  noPending: {
    vi: "Không có nhóm nào đang chờ duyệt",
    en: "No pending groups",
  },
  noInvite: { vi: "Không có lời mời nào", en: "No invitations" },
  accept: { vi: "Chấp nhận", en: "Accept" },
  reject: { vi: "Từ chối", en: "Reject" },
  joinCode: { vi: "Nhập mã nhóm", en: "Enter group code" },
  join: { vi: "Tham gia", en: "Join" },
  scanQR: { vi: "Quét mã QR", en: "Scan QR code" },
  scanQRGroup: { vi: "Quét mã QR nhóm", en: "Scan group QR" },
  scanSuccess: { vi: "Quét thành công", en: "Scan successful" },
  demoTouch: {
    vi: "(Demo) Nhấn nút bên dưới để mô phỏng quét thành công",
    en: "(Demo) Tap below to simulate scan success",
  },
  cancel: { vi: "Huỷ", en: "Cancel" },
  filter: { vi: "Bộ lọc", en: "Filter" },
  category: { vi: "Danh mục", en: "Category" },
  clear: { vi: "Xóa lọc", en: "Clear" },
  apply: { vi: "Áp dụng", en: "Apply" },
  success: { vi: "Thành công", en: "Success" },
  joinSuccess: {
    vi: 'Bạn đã tham gia nhóm "{name}"!',
    en: 'You have joined group "{name}"!',
  },
  joinFail: { vi: "Mã nhóm không chính xác!", en: "Group code incorrect!" },
  loading: { vi: "Đang tải dữ liệu...", en: "Loading..." },
  searchGroup: { vi: "Tìm nhóm", en: "Search group" },
  sort: { vi: "Sắp xếp", en: "Sort" },
  nameAZ: { vi: "Tên A-Z", en: "Name A-Z" },
  latest: { vi: "Mới nhất", en: "Latest" },
  mostMembers: { vi: "Nhiều thành viên", en: "Most members" },
  owner: { vi: "Chủ group", en: "Owner" },
  memberCount: { vi: "thành viên", en: "members" },
  noAnnouncement: { vi: "Chưa có thông báo", en: "No announcement yet" },
  announcement: { vi: "Thông báo", en: "Announcement" },
  announcementBy: { vi: "Chủ group", en: "Owner" },
  announcementPending: { vi: "Đang chờ duyệt...", en: "Pending approval..." },
  codePlaceholder: { vi: "Nhập mã nhóm...", en: "Enter group code..." },
  newGroupTitle: { vi: "Tạo nhóm mới", en: "Create new group" },
  groupName: { vi: "Tên nhóm", en: "Group name" },
  groupDesc: { vi: "Mô tả", en: "Description" },
  groupCategory: { vi: "Danh mục", en: "Category" },
  create: { vi: "Tạo", en: "Create" },
  inputRequired: { vi: "Thiếu thông tin", en: "Missing information" },
  groupNameRequired: {
    vi: "Tên nhóm không được để trống",
    en: "Group name cannot be blank",
  },
  successReject: { vi: "Đã từ chối lời mời", en: "Invitation rejected" },
  tabMy: { vi: "Nhóm của bạn", en: "My Groups" },
  tabPending: { vi: "Chờ duyệt", en: "Pending" },
  tabInvite: { vi: "Lời mời", en: "Invites" },
};

const filterCategories = [
  "Ngôn ngữ",
  "Kỹ năng",
  "Lập trình",
  "Cộng đồng",
  "Học thuật",
];

const initialGroups = [
  {
    id: "g1",
    name: "IELTS Speaking",
    owner: "Huy Nguyen",
    memberCount: 24,
    cardCount: 88,
    avatar: require("../../assets/images/avatar.png"),
    description: "Cùng luyện nói tiếng Anh mỗi ngày.",
    category: "Ngôn ngữ",
    createdAt: new Date("2024-05-22"),
    latestAnnouncement: {
      content: "Chủ group: Tối nay livestream chia sẻ tips Speaking 8.5!",
      postedAt: "2025-06-15 21:15",
      postedBy: "Huy Nguyen",
    },
    joinCode: "IELTS2024",
  },
  {
    id: "g2",
    name: "Dev JavaScript",
    owner: "Minh Trần",
    memberCount: 45,
    cardCount: 120,
    avatar: require("../../assets/images/avatar.png"),
    description: "Học, chia sẻ và thực hành JS mỗi ngày.",
    category: "Lập trình",
    createdAt: new Date("2024-11-05"),
    latestAnnouncement: {
      content: "Chủ group: Đã cập nhật thêm 20 card về ES6!",
      postedAt: "2025-06-12 14:25",
      postedBy: "Minh Trần",
    },
    joinCode: "JSDEV2025",
  },
  {
    id: "g3",
    name: "Nhóm kín học bài",
    owner: "Lan Anh",
    memberCount: 8,
    cardCount: 32,
    avatar: require("../../assets/images/avatar.png"),
    description: "Chia sẻ tài liệu riêng tư.",
    category: "Học thuật",
    createdAt: new Date("2025-03-02"),
    latestAnnouncement: undefined,
    joinCode: "KINHOC2025",
  },
];

const pendingGroups = [
  {
    id: "g4",
    name: "TOEIC Listening",
    owner: "Thuỷ",
    memberCount: 20,
    cardCount: 60,
    avatar: require("../../assets/images/avatar.png"),
    description: "Nhóm này cần duyệt mới vào được.",
    category: "Ngôn ngữ",
    createdAt: new Date("2025-02-10"),
    latestAnnouncement: {
      content: "Chủ group: Sẽ duyệt thành viên vào tối thứ 6.",
      postedAt: "2025-06-15 22:00",
      postedBy: "Thuỷ",
    },
    joinCode: "TOEIC2025",
  },
];

const groupInvites = [
  {
    id: "g5",
    name: "React Native Club",
    owner: "Tùng",
    memberCount: 31,
    cardCount: 110,
    avatar: require("../../assets/images/avatar.png"),
    description: "Cộng đồng học React Native.",
    category: "Lập trình",
    createdAt: new Date("2025-03-21"),
    latestAnnouncement: {
      content: "Chủ group: Chào mừng thành viên mới!",
      postedAt: "2025-06-15 22:00",
      postedBy: "Tùng",
    },
    joinCode: "RNCLUB2025",
    invited: true,
  },
];

export default function Group() {
  const navigation = useNavigation();
  const { darkMode } = useDarkMode();
  const theme = darkMode ? darkTheme : lightTheme;
  const { lang } = useLanguage();

  const sortModes = [
    { label: TEXT.nameAZ[lang], value: "titleAsc" },
    { label: TEXT.latest[lang], value: "latest" },
    { label: TEXT.mostMembers[lang], value: "mostMembers" },
  ];
  const TABS = [
    { key: "my", label: TEXT.tabMy[lang] },
    { key: "pending", label: TEXT.tabPending[lang] },
    { key: "invite", label: TEXT.tabInvite[lang] },
  ];

  const [groups, setGroups] = useState(initialGroups);
  const [searchText, setSearchText] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortMode, setSortMode] = useState("latest");
  const [loading, setLoading] = useState(true);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState("my");
  const [inputCode, setInputCode] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);

  // Sửa lỗi: BỔ SUNG STATE newGroup ĐẦY ĐỦ
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    category: filterCategories[0],
  });

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    setSelectedTab(TABS[0].key);
  }, [lang]);

  const filterGroups = () => {
    let res = [...groups];
    if (selectedCategories.length > 0) {
      res = res.filter((g) => selectedCategories.includes(g.category));
    }
    if (searchText.trim() !== "") {
      res = res.filter((g) =>
        g.name.toLowerCase().includes(searchText.toLowerCase()),
      );
    }
    if (sortMode === "titleAsc") {
      res = res.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortMode === "mostMembers") {
      res = res.sort((a, b) => b.memberCount - a.memberCount);
    } else if (sortMode === "latest") {
      res = res.sort(
        (a, b) =>
          (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0),
      );
    }
    return res;
  };
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  };
  const handleAddGroup = () => {
    if (!newGroup.name.trim()) {
      Alert.alert(TEXT.inputRequired[lang], TEXT.groupNameRequired[lang]);
      return;
    }
    setGroups((prev) => [
      {
        id: (Math.random() * 100000).toFixed(0),
        name: newGroup.name,
        owner: "Huy Nguyen",
        memberCount: 1,
        cardCount: 0,
        avatar: require("../../assets/images/avatar.png"),
        description: newGroup.description,
        category: newGroup.category,
        createdAt: new Date(),
        latestAnnouncement: undefined,
        joinCode:
          newGroup.name.toUpperCase().replace(/[^A-Z0-9]/g, "") + "2025",
      },
      ...prev,
    ]);
    setNewGroup({
      name: "",
      description: "",
      category: filterCategories[0],
    });
    setAddModalVisible(false);
  };
  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };
  const clearFilter = () => {
    setSelectedCategories([]);
    setSearchText("");
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
      {/* Tabs */}
      <View style={styles.tabsRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              selectedTab === tab.key && { backgroundColor: theme.primary },
            ]}
            onPress={() => setSelectedTab(tab.key)}
          >
            <Text
              style={
                selectedTab === tab.key
                  ? [styles.tabActiveText, { color: "#fff" }]
                  : [styles.tabText, { color: theme.subText }]
              }
            >
              {tab.label}
            </Text>
            {tab.key === "pending" && pendingGroups.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingGroups.length}</Text>
              </View>
            )}
            {tab.key === "invite" && groupInvites.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{groupInvites.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
      {/* Search + Filter + Sort (chỉ tab my mới hiển thị) */}
      {selectedTab === "my" && (
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
          {/* Filter & Sort buttons có thể bổ sung ở đây */}
        </View>
      )}
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
        ) : selectedTab === "my" ? (
          <FlatList
            data={filterGroups()}
            keyExtractor={(item) => item.id}
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
                    navigation.navigate("GroupDetail" as never);
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
                  <Ionicons
                    name="chevron-forward"
                    size={scale(22)}
                    color={theme.subText}
                  />
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
        ) : selectedTab === "pending" ? (
          <FlatList
            data={pendingGroups}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.cardItemBox}>
                <View
                  style={[
                    styles.cardItem,
                    { backgroundColor: theme.card, shadowColor: theme.card },
                  ]}
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
                    </View>
                    <Text
                      style={[styles.noAnnouncement, { color: theme.subText }]}
                    >
                      {TEXT.waiting[lang]}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text
                style={{
                  color: theme.subText,
                  alignSelf: "center",
                  marginTop: scale(38),
                }}
              >
                {TEXT.noPending[lang]}
              </Text>
            }
          />
        ) : (
          <FlatList
            data={groupInvites}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.cardItemBox}>
                <View
                  style={[
                    styles.cardItem,
                    { backgroundColor: theme.card, shadowColor: theme.card },
                  ]}
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
                    </View>
                    <View style={{ flexDirection: "row", marginTop: scale(6) }}>
                      <TouchableOpacity
                        style={[
                          styles.modalBtn,
                          {
                            backgroundColor: theme.primary,
                            marginRight: scale(8),
                          },
                        ]}
                        onPress={() => {
                          Alert.alert(
                            TEXT.success[lang],
                            TEXT.joinSuccess[lang].replace("{name}", item.name),
                          );
                        }}
                      >
                        <Text style={{ color: "#fff" }}>
                          {TEXT.accept[lang]}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.modalBtn,
                          { backgroundColor: theme.card },
                        ]}
                        onPress={() => {
                          Alert.alert(TEXT.successReject[lang]);
                        }}
                      >
                        <Text style={{ color: theme.text }}>
                          {TEXT.reject[lang]}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text
                style={{
                  color: theme.subText,
                  alignSelf: "center",
                  marginTop: scale(38),
                }}
              >
                {TEXT.noInvite[lang]}
              </Text>
            }
          />
        )}
      </View>
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
  tabsRow: {
    flexDirection: "row",
    marginLeft: scale(24),
    marginBottom: scale(8),
    alignItems: "center",
  },
  tab: {
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    marginRight: scale(10),
    borderRadius: scale(16),
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  tabText: { fontSize: scale(15), color: "#BFC8D6", fontWeight: "600" },
  tabActive: {
    backgroundColor: "#3B5EFF",
    borderRadius: scale(16),
    paddingHorizontal: scale(18),
    paddingVertical: scale(6),
  },
  tabActiveText: { fontSize: scale(15), color: "#fff", fontWeight: "bold" },
  badge: {
    minWidth: scale(18),
    height: scale(18),
    backgroundColor: "#FF3B30",
    borderRadius: scale(9),
    alignItems: "center",
    justifyContent: "center",
    marginLeft: scale(5),
    paddingHorizontal: scale(4),
  },
  badgeText: { color: "#fff", fontSize: scale(12), fontWeight: "bold" },
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
  filterBtn: { padding: scale(6), marginLeft: scale(10) },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: scale(8),
    padding: scale(2),
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
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(40,40,50,0.22)",
    zIndex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: scale(32),
    borderTopRightRadius: scale(32),
    paddingVertical: scale(24),
    paddingHorizontal: scale(20),
    minHeight: height * 0.56,
    zIndex: 2,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: scale(16),
  },
  modalTitle: { fontSize: scale(22), fontWeight: "700", color: "#222" },
  sectionTitle: {
    fontSize: scale(17),
    fontWeight: "600",
    marginVertical: scale(10),
    color: "#232323",
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(10),
    marginBottom: scale(8),
  },
  chip: {
    backgroundColor: "#F4F4FC",
    borderRadius: scale(10),
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
    margin: scale(4),
  },
  chipActive: { backgroundColor: "#2C4BFF" },
  chipText: { color: "#b9b9c9", fontWeight: "500", fontSize: scale(15) },
  chipTextActive: { color: "#fff" },
  btnRow: {
    flexDirection: "row",
    marginTop: scale(18),
    marginBottom: scale(10),
    justifyContent: "space-between",
  },
  clearBtn: {
    borderWidth: 1,
    borderColor: "#2C4BFF",
    backgroundColor: "#fff",
    borderRadius: scale(12),
    paddingVertical: scale(13),
    paddingHorizontal: scale(30),
  },
  applyBtn: {
    backgroundColor: "#2C4BFF",
    borderRadius: scale(12),
    paddingVertical: scale(13),
    paddingHorizontal: scale(30),
  },
  btnText: { fontSize: scale(17), fontWeight: "600" },
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
    flexDirection: "row",
    alignItems: "center",
    minWidth: scale(64),
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    right: scale(32),
    bottom: scale(36),
    backgroundColor: "#3B5EFF",
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    zIndex: 20,
  },
  fabMenuBtn: {
    position: "absolute",
    right: scale(38),
    backgroundColor: "#3B5EFF",
    paddingHorizontal: scale(17),
    paddingVertical: scale(11),
    borderRadius: scale(18),
    zIndex: 30,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
    minWidth: scale(130),
  },
  fabMenuText: {
    color: "#fff",
    marginLeft: scale(8),
    fontWeight: "bold",
    fontSize: scale(15),
  },
  fabOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(60,60,80,0.1)",
    zIndex: 15,
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
  qrOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(40,40,50,0.12)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  qrContent: {
    backgroundColor: "#fff",
    borderRadius: scale(24),
    alignItems: "center",
    padding: scale(30),
    width: width * 0.8,
    shadowColor: "#222",
    shadowOpacity: 0.11,
    shadowRadius: scale(10),
    elevation: 6,
  },
});
