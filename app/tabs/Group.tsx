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
  Pressable,
  Dimensions,
  Animated,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const filterCategories = [
  "Ngôn ngữ",
  "Kỹ năng",
  "Lập trình",
  "Cộng đồng",
  "Học thuật",
];

const sortModes = [
  { label: "Tên A-Z", value: "titleAsc" },
  { label: "Mới nhất", value: "latest" },
  { label: "Nhiều thành viên", value: "mostMembers" },
];

const TABS = [
  { key: "my", label: "Nhóm của bạn" },
  { key: "pending", label: "Chờ duyệt" },
  { key: "invite", label: "Lời mời" },
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

const { height, width } = Dimensions.get("window");

export default function Group() {
  const navigation = useNavigation();
  const [groups, setGroups] = useState(initialGroups);
  const [searchText, setSearchText] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortMode, setSortMode] = useState("latest");
  const [loading, setLoading] = useState(true);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState("my");

  // Nhập mã nhóm
  const [enterCodeModalVisible, setEnterCodeModalVisible] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);

  // Quét mã QR (mô phỏng)
  const [scanQRModalVisible, setScanQRModalVisible] = useState(false);

  // Floating Action Button menu
  const [fabMenuOpen, setFabMenuOpen] = useState(false);

  // Animated overlay & content for filter modal
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(height)).current;

  // Add group modal state
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    category: filterCategories[0],
  });

  // Animated for fade modal
  const addModalFade = useRef(new Animated.Value(0)).current;
  const enterCodeModalFade = useRef(new Animated.Value(0)).current;
  const scanQRModalFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  // Fade in/out for addModalVisible
  useEffect(() => {
    if (addModalVisible) {
      Animated.timing(addModalFade, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    } else {
      addModalFade.setValue(0);
    }
  }, [addModalVisible]);
  useEffect(() => {
    if (enterCodeModalVisible) {
      Animated.timing(enterCodeModalFade, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    } else {
      enterCodeModalFade.setValue(0);
    }
  }, [enterCodeModalVisible]);
  useEffect(() => {
    if (scanQRModalVisible) {
      Animated.timing(scanQRModalFade, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    } else {
      scanQRModalFade.setValue(0);
    }
  }, [scanQRModalVisible]);

  useEffect(() => {
    if (filterVisible) {
      Animated.parallel([
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(contentAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(contentAnim, {
          toValue: height,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [filterVisible]);

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
      Alert.alert("Thiếu thông tin", "Tên nhóm không được để trống");
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

  const handleJoinByCode = () => {
    setJoinLoading(true);
    setTimeout(() => {
      const found = [...groups, ...pendingGroups, ...groupInvites].find(
        (g) =>
          g.joinCode &&
          g.joinCode.toUpperCase() === inputCode.trim().toUpperCase(),
      );
      if (found) {
        Alert.alert("Thành công", `Bạn đã tham gia nhóm "${found.name}"!`);
        setEnterCodeModalVisible(false);
        setInputCode("");
      } else {
        Alert.alert("Lỗi", "Mã nhóm không chính xác!");
      }
      setJoinLoading(false);
    }, 900);
  };

  const handleMockScan = () => {
    setScanQRModalVisible(false);
    setTimeout(() => {
      setInputCode("JSDEV2025");
      setEnterCodeModalVisible(true);
    }, 500);
  };

  const handleFAB = () => setFabMenuOpen((v) => !v);

  const badgePending = pendingGroups.length;
  const badgeInvite = groupInvites.length;

  const renderTabContent = () => {
    if (selectedTab === "my") {
      return (
        <FlatList
          data={filterGroups()}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={{
            paddingBottom: 24,
            flexGrow: 1,
            minHeight: 220,
          }}
          renderItem={({ item }) => (
            <View style={styles.cardItemBox}>
              <TouchableOpacity
                style={styles.cardItem}
                activeOpacity={0.82}
                onPress={() => {
                  navigation.navigate("GroupDetail" as never);
                }}
              >
                <View style={styles.cardImageBox}>
                  <Image
                    source={item.avatar}
                    style={styles.cardImagePlaceholder}
                    resizeMode="contain"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardDesc} numberOfLines={1}>
                    {item.description}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 3,
                    }}
                  >
                    <Ionicons name="person" size={14} color="#BFC8D6" />
                    <Text style={styles.cardAuthor}> {item.owner}</Text>
                    <Ionicons
                      name="people-outline"
                      size={15}
                      color="#BFC8D6"
                      style={{ marginLeft: 10 }}
                    />
                    <Text style={styles.cardTotalCards}>
                      {"  "}
                      {item.memberCount} thành viên
                    </Text>
                  </View>
                  {item.latestAnnouncement ? (
                    <View style={styles.announcementBox}>
                      <Ionicons
                        name="notifications"
                        size={14}
                        color="#3B5EFF"
                      />
                      <Text style={styles.announcementText} numberOfLines={1}>
                        {item.latestAnnouncement.content}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.noAnnouncement}>Chưa có thông báo</Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={22} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                marginTop: 50,
              }}
            >
              <Image
                source={require("../../assets/images/avatar.png")}
                style={{ width: 110, height: 110, marginBottom: 14 }}
              />
              <Text style={{ color: "#BFC8D6", fontSize: 17 }}>
                Không tìm thấy nhóm nào
              </Text>
              <TouchableOpacity
                style={styles.emptyAddBtn}
                onPress={() => setAddModalVisible(true)}
              >
                <Ionicons name="add" size={22} color="#fff" />
                <Text style={{ color: "#fff", marginLeft: 5 }}>
                  Tạo nhóm mới
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      );
    }
    if (selectedTab === "pending") {
      return (
        <FlatList
          data={pendingGroups}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.cardItemBox}>
              <View style={styles.cardItem}>
                <View style={styles.cardImageBox}>
                  <Image
                    source={item.avatar}
                    style={styles.cardImagePlaceholder}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardDesc} numberOfLines={1}>
                    {item.description}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 3,
                    }}
                  >
                    <Ionicons name="person" size={14} color="#BFC8D6" />
                    <Text style={styles.cardAuthor}> {item.owner}</Text>
                  </View>
                  <Text style={styles.noAnnouncement}>Đang chờ duyệt...</Text>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text
              style={{ color: "#BFC8D6", alignSelf: "center", marginTop: 38 }}
            >
              Không có nhóm nào đang chờ duyệt
            </Text>
          }
        />
      );
    }
    if (selectedTab === "invite") {
      return (
        <FlatList
          data={groupInvites}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.cardItemBox}>
              <View style={styles.cardItem}>
                <View style={styles.cardImageBox}>
                  <Image
                    source={item.avatar}
                    style={styles.cardImagePlaceholder}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardDesc} numberOfLines={1}>
                    {item.description}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 3,
                    }}
                  >
                    <Ionicons name="person" size={14} color="#BFC8D6" />
                    <Text style={styles.cardAuthor}> {item.owner}</Text>
                  </View>
                  <View style={{ flexDirection: "row", marginTop: 6 }}>
                    <TouchableOpacity
                      style={[
                        styles.modalBtn,
                        { backgroundColor: "#2C4BFF", marginRight: 8 },
                      ]}
                      onPress={() => {
                        Alert.alert(
                          "Thành công",
                          `Bạn đã tham gia nhóm "${item.name}"!`,
                        );
                      }}
                    >
                      <Text style={{ color: "#fff" }}>Chấp nhận</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.modalBtn}
                      onPress={() => {
                        Alert.alert("Đã từ chối lời mời");
                      }}
                    >
                      <Text>Từ chối</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text
              style={{ color: "#BFC8D6", alignSelf: "center", marginTop: 38 }}
            >
              Không có lời mời nào
            </Text>
          }
        />
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Nhóm</Text>
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
            style={[styles.tab, selectedTab === tab.key && styles.tabActive]}
            onPress={() => setSelectedTab(tab.key)}
          >
            <Text
              style={
                selectedTab === tab.key ? styles.tabActiveText : styles.tabText
              }
            >
              {tab.label}
            </Text>
            {tab.key === "pending" && badgePending > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badgePending}</Text>
              </View>
            )}
            {tab.key === "invite" && badgeInvite > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badgeInvite}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Search + Filter + Sort (chỉ tab my mới hiển thị) */}
      {selectedTab === "my" && (
        <View style={styles.searchRow}>
          <Ionicons
            name="search"
            size={18}
            color="#BFC8D6"
            style={{ marginLeft: 8 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm nhóm"
            placeholderTextColor="#BFC8D6"
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setFilterVisible(true)}
          >
            <Ionicons name="options" size={20} color="#BFC8D6" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sortBtn}
            onPress={() => {
              const idx = sortModes.findIndex((m) => m.value === sortMode);
              setSortMode(sortModes[(idx + 1) % sortModes.length].value);
            }}
          >
            <Ionicons name="swap-vertical" size={21} color="#BFC8D6" />
            <Text style={{ color: "#BFC8D6", fontSize: 13, marginLeft: 2 }}>
              {sortModes.find((m) => m.value === sortMode)?.label || "Sắp xếp"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ flex: 1 }}>
        {loading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color="#2C4BFF" />
            <Text style={{ color: "#aaa", marginTop: 10 }}>
              Đang tải dữ liệu...
            </Text>
          </View>
        ) : (
          renderTabContent()
        )}
      </View>

      {/* Floating Action Button & Menu */}
      {fabMenuOpen && (
        <>
          <TouchableOpacity
            style={[styles.fabMenuBtn, { bottom: 128 }]}
            onPress={() => {
              setFabMenuOpen(false);
              setEnterCodeModalVisible(true);
            }}
          >
            <Ionicons name="key" size={22} color="#fff" />
            <Text style={styles.fabMenuText}>Nhập mã nhóm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.fabMenuBtn, { bottom: 74 }]}
            onPress={() => {
              setFabMenuOpen(false);
              setScanQRModalVisible(true);
            }}
          >
            <Ionicons name="qr-code" size={22} color="#fff" />
            <Text style={styles.fabMenuText}>Quét mã QR</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.fabMenuBtn, { bottom: 182 }]}
            onPress={() => {
              setFabMenuOpen(false);
              setAddModalVisible(true);
            }}
          >
            <Ionicons name="add-circle" size={22} color="#fff" />
            <Text style={styles.fabMenuText}>Tạo nhóm mới</Text>
          </TouchableOpacity>
          <TouchableWithoutFeedback onPress={() => setFabMenuOpen(false)}>
            <View style={styles.fabOverlay} />
          </TouchableWithoutFeedback>
        </>
      )}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleFAB}
        activeOpacity={0.9}
      >
        <Ionicons name={fabMenuOpen ? "close" : "add"} size={32} color="#fff" />
      </TouchableOpacity>

      {/* Add Group Modal */}
      <Modal visible={addModalVisible} animationType="none" transparent>
        <TouchableWithoutFeedback onPress={() => setAddModalVisible(false)}>
          <Animated.View
            style={[styles.modalOverlay, { opacity: addModalFade }]}
          >
            <TouchableWithoutFeedback>
              <KeyboardAvoidingView
                style={{ width: "100%", alignItems: "center" }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
              >
                <Animated.View
                  style={[styles.modalContent, { opacity: addModalFade }]}
                >
                  <Text style={styles.modalTitle}>Tạo nhóm mới</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Tên nhóm"
                    value={newGroup.name}
                    onChangeText={(t) =>
                      setNewGroup((c) => ({ ...c, name: t }))
                    }
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Mô tả"
                    value={newGroup.description}
                    onChangeText={(t) =>
                      setNewGroup((c) => ({ ...c, description: t }))
                    }
                  />
                  <Text style={{ marginBottom: 7, marginTop: 7 }}>
                    Danh mục
                  </Text>
                  <FlatList
                    horizontal
                    data={filterCategories}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.chip,
                          newGroup.category === item && styles.chipActive,
                        ]}
                        onPress={() =>
                          setNewGroup((c) => ({ ...c, category: item }))
                        }
                      >
                        <Text
                          style={[
                            styles.chipText,
                            newGroup.category === item && styles.chipTextActive,
                          ]}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                  <View
                    style={{ flexDirection: "row", justifyContent: "flex-end" }}
                  >
                    <TouchableOpacity
                      style={styles.modalBtn}
                      onPress={() => setAddModalVisible(false)}
                    >
                      <Text>Huỷ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalBtn, { backgroundColor: "#2C4BFF" }]}
                      onPress={handleAddGroup}
                    >
                      <Text style={{ color: "#fff" }}>Tạo</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal nhập mã nhóm */}
      <Modal
        visible={enterCodeModalVisible}
        animationType="none"
        transparent
        onRequestClose={() => setEnterCodeModalVisible(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => setEnterCodeModalVisible(false)}
        >
          <Animated.View
            style={[styles.modalOverlay, { opacity: enterCodeModalFade }]}
          >
            <TouchableWithoutFeedback>
              <KeyboardAvoidingView
                style={{ width: "100%", alignItems: "center" }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
              >
                <Animated.View
                  style={[styles.modalContent, { opacity: enterCodeModalFade }]}
                >
                  <Text style={styles.modalTitle}>Nhập mã nhóm</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập mã nhóm..."
                    value={inputCode}
                    onChangeText={setInputCode}
                    autoCapitalize="characters"
                    autoFocus
                  />
                  <View
                    style={{ flexDirection: "row", justifyContent: "flex-end" }}
                  >
                    <TouchableOpacity
                      style={styles.modalBtn}
                      onPress={() => setEnterCodeModalVisible(false)}
                    >
                      <Text>Huỷ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.modalBtn,
                        { backgroundColor: "#2C4BFF", minWidth: 70 },
                      ]}
                      onPress={handleJoinByCode}
                      disabled={joinLoading}
                    >
                      {joinLoading ? (
                        <ActivityIndicator size={20} color="#fff" />
                      ) : (
                        <Text style={{ color: "#fff" }}>Tham gia</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Quét mã QR (mô phỏng) */}
      <Modal
        visible={scanQRModalVisible}
        animationType="none"
        transparent
        onRequestClose={() => setScanQRModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setScanQRModalVisible(false)}>
          <Animated.View
            style={[styles.qrOverlay, { opacity: scanQRModalFade }]}
          >
            <TouchableWithoutFeedback>
              <Animated.View
                style={[styles.qrContent, { opacity: scanQRModalFade }]}
              >
                <Ionicons name="qr-code" size={60} color="#2C4BFF" />
                <Text
                  style={{ fontSize: 19, fontWeight: "bold", marginTop: 10 }}
                >
                  Quét mã QR nhóm
                </Text>
                <Text style={{ color: "#3B5EFF", marginVertical: 12 }}>
                  (Demo) Nhấn nút bên dưới để mô phỏng quét thành công
                </Text>
                <TouchableOpacity
                  style={[
                    styles.modalBtn,
                    { backgroundColor: "#2C4BFF", marginTop: 20 },
                  ]}
                  onPress={handleMockScan}
                >
                  <Ionicons name="qr-code-outline" size={22} color="#fff" />
                  <Text style={{ color: "#fff", marginLeft: 8 }}>
                    Quét thành công
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, { marginTop: 8 }]}
                  onPress={() => setScanQRModalVisible(false)}
                >
                  <Text>Huỷ</Text>
                </TouchableOpacity>
              </Animated.View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Filter Modal with animated overlay and slide up content */}
      <Modal
        visible={filterVisible}
        transparent
        animationType="none"
        onRequestClose={() => setFilterVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setFilterVisible(false)}>
          <View style={styles.modalRoot}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.modalContainer,
                  { transform: [{ translateY: contentAnim }] },
                ]}
              >
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setFilterVisible(false)}>
                    <Ionicons name="close" size={28} color="#222" />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Bộ lọc</Text>
                  <View style={{ width: 28 }} />
                </View>
                <Text style={styles.sectionTitle}>Danh mục</Text>
                <View style={styles.rowWrap}>
                  {filterCategories.map((cat) => (
                    <Pressable
                      key={cat}
                      style={[
                        styles.chip,
                        selectedCategories.includes(cat) && styles.chipActive,
                      ]}
                      onPress={() => toggleCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selectedCategories.includes(cat) &&
                            styles.chipTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <View style={styles.btnRow}>
                  <TouchableOpacity
                    style={styles.clearBtn}
                    onPress={clearFilter}
                  >
                    <Text style={[styles.btnText, { color: "#2C4BFF" }]}>
                      Xóa lọc
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.applyBtn}
                    onPress={() => setFilterVisible(false)}
                  >
                    <Text style={[styles.btnText, { color: "#fff" }]}>
                      Áp dụng
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 0 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 18,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  title: { fontSize: 30, fontWeight: "bold", color: "#222" },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#eee" },
  tabsRow: {
    flexDirection: "row",
    marginLeft: 24,
    marginBottom: 8,
    alignItems: "center",
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 10,
    borderRadius: 16,
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  tabText: { fontSize: 15, color: "#BFC8D6", fontWeight: "600" },
  tabActive: {
    backgroundColor: "#3B5EFF",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  tabActiveText: { fontSize: 15, color: "#fff", fontWeight: "bold" },
  badge: {
    minWidth: 18,
    height: 18,
    backgroundColor: "#FF3B30",
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 5,
    paddingHorizontal: 4,
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F8FB",
    borderRadius: 16,
    marginHorizontal: 24,
    paddingHorizontal: 8,
    marginBottom: 18,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 6,
    color: "#222",
    backgroundColor: "transparent",
  },
  filterBtn: { padding: 6, marginLeft: 10 },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    padding: 2,
  },
  cardItemBox: { marginBottom: 11 },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 24,
    padding: 16,
    shadowColor: "#BFC8D6",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImageBox: {
    width: 58,
    height: 58,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  cardImagePlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#D9DBE9",
  },
  cardTitle: { fontSize: 17, fontWeight: "bold", color: "#222" },
  cardDesc: { color: "#BFC8D6", fontSize: 13, marginTop: 2, marginBottom: 0 },
  cardAuthor: { fontSize: 13, color: "#BFC8D6", marginLeft: 2 },
  cardTotalCards: {
    fontSize: 13,
    color: "#3B5EFF",
    marginLeft: 2,
    fontWeight: "bold",
  },
  announcementBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
    backgroundColor: "#F1F6FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  announcementText: {
    marginLeft: 4,
    color: "#3B5EFF",
    fontSize: 13,
    flex: 1,
    fontWeight: "bold",
  },
  noAnnouncement: {
    fontSize: 12,
    color: "#BFC8D6",
    marginTop: 7,
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
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingVertical: 24,
    paddingHorizontal: 20,
    minHeight: height * 0.56,
    zIndex: 2,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 22, fontWeight: "700", color: "#222" },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginVertical: 10,
    color: "#232323",
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8,
  },
  chip: {
    backgroundColor: "#F4F4FC",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 4,
  },
  chipActive: { backgroundColor: "#2C4BFF" },
  chipText: { color: "#b9b9c9", fontWeight: "500", fontSize: 15 },
  chipTextActive: { color: "#fff" },
  btnRow: {
    flexDirection: "row",
    marginTop: 18,
    marginBottom: 10,
    justifyContent: "space-between",
  },
  clearBtn: {
    borderWidth: 1,
    borderColor: "#2C4BFF",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 30,
  },
  applyBtn: {
    backgroundColor: "#2C4BFF",
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 30,
  },
  btnText: { fontSize: 17, fontWeight: "600" },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 22,
    width: width * 0.85,
    shadowColor: "#222",
    shadowOpacity: 0.11,
    shadowRadius: 10,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E4E6EF",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    color: "#222",
    backgroundColor: "#F7F8FB",
  },
  modalBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 10,
    backgroundColor: "#F4F4FB",
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 64,
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    right: 32,
    bottom: 36,
    backgroundColor: "#3B5EFF",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    zIndex: 20,
  },
  fabMenuBtn: {
    position: "absolute",
    right: 38,
    backgroundColor: "#3B5EFF",
    paddingHorizontal: 17,
    paddingVertical: 11,
    borderRadius: 18,
    zIndex: 30,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
    minWidth: 130,
  },
  fabMenuText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "bold",
    fontSize: 15,
  },
  fabOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(60,60,80,0.1)",
    zIndex: 15,
  },
  emptyAddBtn: {
    marginTop: 18,
    backgroundColor: "#3B5EFF",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 9,
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
    borderRadius: 24,
    alignItems: "center",
    padding: 30,
    width: width * 0.8,
    shadowColor: "#222",
    shadowOpacity: 0.11,
    shadowRadius: 10,
    elevation: 6,
  },
});
