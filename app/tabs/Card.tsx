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

const { height } = Dimensions.get("window");

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
  const contentAnim = useRef(new Animated.Value(height)).current;

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
          toValue: height,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [filterVisible]);

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
          size={18}
          color="#BFC8D6"
          style={{ marginLeft: 8 }}
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
          <Ionicons name="options" size={20} color="#BFC8D6" />
        </TouchableOpacity>
        {/* Sort */}
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

      {/* Category Cards */}
      <FlatList
        data={categories}
        horizontal
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingLeft: 20,
          paddingBottom: 0,
          flexGrow: 1,
        }}
        style={{ marginBottom: 8 }}
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
            <Text style={{ color: "#aaa", marginTop: 10 }}>
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
              paddingBottom: 24,
              flexGrow: 1,
              minHeight: 220,
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
                        marginTop: 2,
                      }}
                    >
                      <Ionicons name="person" size={13} color="#BFC8D6" />
                      <Text style={styles.cardAuthor}> {item.author}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 8,
                      }}
                    >
                      <Ionicons
                        name="layers-outline"
                        size={15}
                        color="#3B5EFF"
                      />
                      <Text style={styles.cardTotalCards}>
                        {"  "}
                        {item.totalCards} thẻ
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={{ marginLeft: 12 }}
                    onPress={() => toggleSaveCardSet(item.id)}
                  >
                    <MaterialIcons
                      name={item.isSaved ? "bookmark" : "bookmark-border"}
                      size={25}
                      color={item.isSaved ? "#FFD600" : "#BFC8D6"}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ marginLeft: 2, padding: 6 }}
                    onPress={() => openEditModal(item)}
                  >
                    <Feather name="edit" size={20} color="#3B5EFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ marginLeft: 2, padding: 6 }}
                    onPress={() => handleDeleteCardSet(item.id)}
                  >
                    <Feather
                      name="trash-2"
                      size={19}
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
                  marginTop: 50,
                }}
              >
                <Image
                  source={require("../../assets/images/avatar.png")}
                  style={{ width: 110, height: 110, marginBottom: 14 }}
                />
                <Text style={{ color: "#BFC8D6", fontSize: 17 }}>
                  Không tìm thấy bộ thẻ nào
                </Text>
                <TouchableOpacity
                  style={styles.emptyAddBtn}
                  onPress={() => setAddModalVisible(true)}
                >
                  <Ionicons name="add" size={22} color="#fff" />
                  <Text style={{ color: "#fff", marginLeft: 5 }}>
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
        <Ionicons name="add" size={32} color="#fff" />
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
            <Text style={{ marginBottom: 7, marginTop: 7 }}>Danh mục</Text>
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
            <Text style={{ marginBottom: 7, marginTop: 7 }}>Danh mục</Text>
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
                <Ionicons name="close" size={28} color="#222" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Bộ lọc</Text>
              <View style={{ width: 28 }} />
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

const { width } = Dimensions.get("window");

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
  categoriesRow: {
    marginHorizontal: 24,
  },
  categoryCard: {
    width: 140,
    height: 90,
    borderRadius: 16,
    marginRight: 14,
    alignItems: "flex-start",
    justifyContent: "flex-end",
    padding: 14,
    overflow: "hidden",
  },
  categoryImage: {
    position: "absolute",
    top: 4,
    right: 0,
    width: 80,
    height: 80,
    opacity: 0.95,
  },
  categoryTitle: { fontSize: 15, fontWeight: "bold", color: "#408BFF" },
  tabsRow: {
    flexDirection: "row",
    marginLeft: 24,
    marginBottom: 10,
    marginTop: -470,
    alignItems: "center",
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  tabText: { fontSize: 15, color: "#BFC8D6", fontWeight: "600" },
  tabActive: {
    backgroundColor: "#3B5EFF",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 6,
    marginLeft: 8,
  },
  tabActiveText: { fontSize: 15, color: "#fff", fontWeight: "bold" },
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
  cardAuthor: { fontSize: 13, color: "#BFC8D6", marginLeft: 2 },
  cardTotalCards: {
    fontSize: 14,
    color: "#3B5EFF",
    marginLeft: 2,
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
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingVertical: 24,
    paddingHorizontal: 20,
    minHeight: height * 0.68,
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
  emptyAddBtn: {
    marginTop: 18,
    backgroundColor: "#3B5EFF",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 9,
  },
});
