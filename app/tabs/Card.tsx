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
} from "react-native";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../AppNavigator";

// Responsive helpers
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;

const categories = [
  {
    id: "1",
    title: "Ngôn ngữ",
    color: "#E8F1FF",
    image: require("../../assets/images/avatar.png"),
  },
  {
    id: "2",
    title: "Mỹ thuật",
    color: "#FFF4E4",
    image: require("../../assets/images/avatar.png"),
  },
  {
    id: "3",
    title: "Lập trình",
    color: "#E8F1FF",
    image: require("../../assets/images/avatar.png"),
  },
  {
    id: "4",
    title: "Âm nhạc",
    color: "#FFF4E4",
    image: require("../../assets/images/avatar.png"),
  },
];

const initialCardSets = [
  {
    id: "1",
    title: "IELTS Vocabulary Mastery",
    author: "Huy Nguyen",
    totalCards: 150,
    image: require("../../assets/images/avatar.png"),
    description: "Bộ từ vựng IELTS đầy đủ.",
    category: "Ngôn ngữ",
    isSaved: false,
    createdAt: new Date("2024-06-01"),
  },
  {
    id: "2",
    title: "200 Kanji N5",
    author: "Huy Nguyen",
    totalCards: 200,
    image: require("../../assets/images/avatar.png"),
    description: "200 chữ Kanji N5 cơ bản.",
    category: "Ngôn ngữ",
    isSaved: true,
    createdAt: new Date("2025-01-25"),
  },
  {
    id: "3",
    title: "Tiếng Anh giao tiếp",
    author: "Huy Nguyen",
    totalCards: 90,
    image: require("../../assets/images/avatar.png"),
    description: "Cụm từ thông dụng giao tiếp.",
    category: "Ngôn ngữ",
    isSaved: false,
    createdAt: new Date("2024-12-12"),
  },
];

const TABS = ["Tất cả", "Của tôi", "Đã lưu"];
const filterCategories = [
  "Ngôn ngữ",
  "Mỹ thuật",
  "Lập trình",
  "Âm nhạc",
  "Toán học",
];
const sortModes = [
  { label: "Tên A-Z", value: "titleAsc" },
  { label: "Mới nhất", value: "latest" },
  { label: "Nhiều thẻ nhất", value: "mostCards" },
];

export default function Card() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [selectedTab, setSelectedTab] = useState("Tất cả");
  const [filterVisible, setFilterVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModal, setEditModal] = useState({ visible: false, cardSetId: "" });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter modal state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const [sortMode, setSortMode] = useState("latest");
  const [refreshing, setRefreshing] = useState(false);

  // Fake loading/skeleton
  const [loading, setLoading] = useState(true);

  // Card sets state
  const [cardSets, setCardSets] = useState(initialCardSets);

  // Animated overlay & content
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Add card set modal state
  const [newCardSet, setNewCardSet] = useState({
    title: "",
    description: "",
    category: filterCategories[0],
  });

  // Edit card set state
  const [editCardSet, setEditCardSet] = useState({
    title: "",
    description: "",
    category: "",
    id: "",
  });

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

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
          toValue: SCREEN_HEIGHT,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [filterVisible, SCREEN_HEIGHT, overlayAnim, contentAnim]);

  // Lọc bộ thẻ dựa trên tab và tìm kiếm
  const filterCardSets = () => {
    let result = [...cardSets];
    if (selectedTab === "Của tôi") {
      result = result.filter((set) => set.author === "Huy Nguyen");
    }
    if (selectedTab === "Đã lưu") {
      result = result.filter((set) => set.isSaved);
    }
    if (selectedCategories.length > 0) {
      result = result.filter((set) =>
        selectedCategories.includes(set.category),
      );
    }
    if (searchText.trim() !== "") {
      result = result.filter((set) =>
        set.title.toLowerCase().includes(searchText.toLowerCase()),
      );
    }
    // Sắp xếp
    if (sortMode === "titleAsc") {
      result = result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortMode === "mostCards") {
      result = result.sort((a, b) => b.totalCards - a.totalCards);
    } else if (sortMode === "latest") {
      result = result.sort(
        (a, b) =>
          (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0),
      );
    }
    return result;
  };

  // Toggle category selection in filter modal
  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  // Clear filter
  const clearFilter = () => {
    setSelectedCategories([]);
    setSearchText("");
  };

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  };

  // Thêm bộ thẻ mới
  const handleAddCardSet = () => {
    if (!newCardSet.title.trim()) {
      Alert.alert("Thiếu thông tin", "Tên bộ thẻ không được để trống");
      return;
    }
    setCardSets((prev) => [
      {
        id: (Math.random() * 100000).toFixed(0),
        title: newCardSet.title,
        author: "Huy Nguyen",
        totalCards: 0,
        image: require("../../assets/images/avatar.png"),
        description: newCardSet.description,
        category: newCardSet.category,
        isSaved: false,
        createdAt: new Date(),
      },
      ...prev,
    ]);
    setNewCardSet({
      title: "",
      description: "",
      category: filterCategories[0],
    });
    setAddModalVisible(false);
  };

  // Xoá bộ thẻ
  const handleDeleteCardSet = (id: string) => {
    setDeletingId(id);
    Alert.alert("Xoá bộ thẻ", "Bạn chắc chắn muốn xoá bộ thẻ này?", [
      { text: "Huỷ", onPress: () => setDeletingId(null) },
      {
        text: "Xoá",
        style: "destructive",
        onPress: () => {
          setCardSets((prev) => prev.filter((c) => c.id !== id));
          setDeletingId(null);
        },
      },
    ]);
  };

  // Lưu/bỏ lưu bộ thẻ
  const toggleSaveCardSet = (id: string) => {
    setCardSets((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isSaved: !c.isSaved } : c)),
    );
  };

  // Sửa bộ thẻ
  const openEditModal = (cardSet: any) => {
    setEditCardSet({
      title: cardSet.title,
      description: cardSet.description,
      category: cardSet.category,
      id: cardSet.id,
    });
    setEditModal({ visible: true, cardSetId: cardSet.id });
  };
  const handleSaveEditCardSet = () => {
    setCardSets((prev) =>
      prev.map((c) =>
        c.id === editCardSet.id
          ? {
              ...c,
              title: editCardSet.title,
              description: editCardSet.description,
              category: editCardSet.category,
            }
          : c,
      ),
    );
    setEditModal({ visible: false, cardSetId: "" });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Bộ Thẻ Của Bạn</Text>
        <TouchableOpacity>
          <Image
            source={require("../../assets/images/avatar.png")}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      {/* Search bar + sort */}
      <View style={styles.searchRow}>
        <Ionicons
          name="search"
          size={scale(18)}
          color="#BFC8D6"
          style={{ marginLeft: scale(8) }}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm bộ thẻ"
          placeholderTextColor="#BFC8D6"
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons name="options" size={scale(20)} color="#BFC8D6" />
        </TouchableOpacity>
        {/* Sort */}
        <TouchableOpacity
          style={styles.sortBtn}
          onPress={() => {
            const idx = sortModes.findIndex((m) => m.value === sortMode);
            setSortMode(sortModes[(idx + 1) % sortModes.length].value);
          }}
        >
          <Ionicons name="swap-vertical" size={scale(21)} color="#BFC8D6" />
          <Text
            style={{
              color: "#BFC8D6",
              fontSize: scale(13),
              marginLeft: scale(2),
            }}
          >
            {sortModes.find((m) => m.value === sortMode)?.label || "Sắp xếp"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Cards */}
      <FlatList
        data={categories}
        horizontal
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingLeft: scale(20),
          paddingBottom: 0,
          flexGrow: 1,
        }}
        style={{ marginBottom: scale(8) }}
        renderItem={({ item: cat }) => (
          <TouchableOpacity
            style={[styles.categoryCard, { backgroundColor: cat.color }]}
            activeOpacity={0.8}
          >
            {cat.image && (
              <Image
                source={cat.image}
                style={styles.categoryImage}
                resizeMode="contain"
              />
            )}
            <Text style={styles.categoryTitle}>{cat.title}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={selectedTab === tab ? styles.tabActive : styles.tab}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              style={
                selectedTab === tab ? styles.tabActiveText : styles.tabText
              }
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Card Set List */}
      <View style={{ flex: 1 }}>
        {loading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color="#2C4BFF" />
            <Text style={{ color: "#aaa", marginTop: scale(10) }}>
              Đang tải dữ liệu...
            </Text>
          </View>
        ) : (
          <FlatList
            data={filterCardSets()}
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
                  style={styles.cardItem}
                  onPress={() => navigation.navigate("CardDetail")}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardImageBox}>
                    <Image
                      source={item.image}
                      style={styles.cardImagePlaceholder}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: scale(2),
                      }}
                    >
                      <Ionicons
                        name="person"
                        size={scale(13)}
                        color="#BFC8D6"
                      />
                      <Text style={styles.cardAuthor}> {item.author}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: scale(8),
                      }}
                    >
                      <Ionicons
                        name="layers-outline"
                        size={scale(15)}
                        color="#3B5EFF"
                      />
                      <Text style={styles.cardTotalCards}>
                        {"  "}
                        {item.totalCards} thẻ
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={{ marginLeft: scale(12) }}
                    onPress={() => toggleSaveCardSet(item.id)}
                  >
                    <MaterialIcons
                      name={item.isSaved ? "bookmark" : "bookmark-border"}
                      size={scale(25)}
                      color={item.isSaved ? "#FFD600" : "#BFC8D6"}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ marginLeft: scale(2), padding: scale(6) }}
                    onPress={() => openEditModal(item)}
                  >
                    <Feather name="edit" size={scale(20)} color="#3B5EFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ marginLeft: scale(2), padding: scale(6) }}
                    onPress={() => handleDeleteCardSet(item.id)}
                  >
                    <Feather
                      name="trash-2"
                      size={scale(19)}
                      color={deletingId === item.id ? "#e74c3c" : "#ccc"}
                    />
                  </TouchableOpacity>
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
                <Text style={{ color: "#BFC8D6", fontSize: scale(17) }}>
                  Không tìm thấy bộ thẻ nào
                </Text>
                <TouchableOpacity
                  style={styles.emptyAddBtn}
                  onPress={() => setAddModalVisible(true)}
                >
                  <Ionicons name="add" size={scale(22)} color="#fff" />
                  <Text style={{ color: "#fff", marginLeft: scale(5) }}>
                    Tạo bộ thẻ mới
                  </Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setAddModalVisible(true)}
      >
        <Ionicons name="add" size={scale(32)} color="#fff" />
      </TouchableOpacity>

      {/* Add CardSet Modal */}
      <Modal visible={addModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tạo bộ thẻ mới</Text>
            <TextInput
              style={styles.input}
              placeholder="Tên bộ thẻ"
              value={newCardSet.title}
              onChangeText={(t) => setNewCardSet((c) => ({ ...c, title: t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Mô tả"
              value={newCardSet.description}
              onChangeText={(t) =>
                setNewCardSet((c) => ({ ...c, description: t }))
              }
            />
            <Text style={{ marginBottom: scale(7), marginTop: scale(7) }}>
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
                    newCardSet.category === item && styles.chipActive,
                  ]}
                  onPress={() =>
                    setNewCardSet((c) => ({ ...c, category: item }))
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      newCardSet.category === item && styles.chipTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={() => setAddModalVisible(false)}
              >
                <Text>Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#2C4BFF" }]}
                onPress={handleAddCardSet}
              >
                <Text style={{ color: "#fff" }}>Tạo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Edit CardSet Modal */}
      <Modal visible={editModal.visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sửa bộ thẻ</Text>
            <TextInput
              style={styles.input}
              placeholder="Tên bộ thẻ"
              value={editCardSet.title}
              onChangeText={(t) => setEditCardSet((c) => ({ ...c, title: t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Mô tả"
              value={editCardSet.description}
              onChangeText={(t) =>
                setEditCardSet((c) => ({ ...c, description: t }))
              }
            />
            <Text style={{ marginBottom: scale(7), marginTop: scale(7) }}>
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
                    editCardSet.category === item && styles.chipActive,
                  ]}
                  onPress={() =>
                    setEditCardSet((c) => ({ ...c, category: item }))
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      editCardSet.category === item && styles.chipTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={() => setEditModal({ visible: false, cardSetId: "" })}
              >
                <Text>Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#2C4BFF" }]}
                onPress={handleSaveEditCardSet}
              >
                <Text style={{ color: "#fff" }}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Filter Modal with animated overlay and slide up content */}
      <Modal
        visible={filterVisible}
        transparent
        animationType="none"
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.modalRoot}>
          {/* Overlay */}
          <TouchableWithoutFeedback onPress={() => setFilterVisible(false)}>
            <Animated.View
              pointerEvents={filterVisible ? "auto" : "none"}
              style={[styles.modalOverlay, { opacity: overlayAnim }]}
            />
          </TouchableWithoutFeedback>
          {/* Content */}
          <Animated.View
            style={[
              styles.modalContainer,
              { transform: [{ translateY: contentAnim }] },
            ]}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setFilterVisible(false)}>
                <Ionicons name="close" size={scale(28)} color="#222" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Bộ lọc</Text>
              <View style={{ width: scale(28) }} />
            </View>

            {/* Categories */}
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
                      selectedCategories.includes(cat) && styles.chipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Buttons */}
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.clearBtn} onPress={clearFilter}>
                <Text style={[styles.btnText, { color: "#2C4BFF" }]}>
                  Xóa lọc
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => setFilterVisible(false)}
              >
                <Text style={[styles.btnText, { color: "#fff" }]}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
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
  filterBtn: { padding: scale(6), marginLeft: scale(10) },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: scale(8),
    padding: scale(2),
  },
  categoriesRow: {
    marginHorizontal: scale(24),
  },
  categoryCard: {
    width: scale(140),
    height: scale(90),
    borderRadius: scale(16),
    marginRight: scale(14),
    alignItems: "flex-start",
    justifyContent: "flex-end",
    padding: scale(14),
    overflow: "hidden",
  },
  categoryImage: {
    position: "absolute",
    top: scale(4),
    right: 0,
    width: scale(80),
    height: scale(80),
    opacity: 0.95,
  },
  categoryTitle: { fontSize: scale(15), fontWeight: "bold", color: "#408BFF" },
  tabsRow: {
    flexDirection: "row",
    marginLeft: scale(24),
    marginBottom: scale(10),
    marginTop: scale(-400),
    alignItems: "center",
  },
  tab: {
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    marginLeft: scale(8),
    borderRadius: scale(16),
    backgroundColor: "transparent",
  },
  tabText: { fontSize: scale(15), color: "#BFC8D6", fontWeight: "600" },
  tabActive: {
    backgroundColor: "#3B5EFF",
    borderRadius: scale(16),
    paddingHorizontal: scale(18),
    paddingVertical: scale(6),
    marginLeft: scale(8),
  },
  tabActiveText: { fontSize: scale(15), color: "#fff", fontWeight: "bold" },
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
  cardAuthor: { fontSize: scale(13), color: "#BFC8D6", marginLeft: scale(2) },
  cardTotalCards: {
    fontSize: scale(14),
    color: "#3B5EFF",
    marginLeft: scale(2),
    fontWeight: "bold",
  },
  // Modal & Overlay
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
    minHeight: SCREEN_HEIGHT * 0.68,
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
    width: SCREEN_WIDTH * 0.85,
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
  emptyAddBtn: {
    marginTop: scale(18),
    backgroundColor: "#3B5EFF",
    borderRadius: scale(18),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(20),
    paddingVertical: scale(9),
  },
});
