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
import { useDarkMode } from "../DarkModeContext";
import { lightTheme, darkTheme } from "../theme";
import { useLanguage } from "../LanguageContext"; // Thêm vào để hỗ trợ đa ngữ

// ====== MULTILINGUAL TEXT KEYS ======
const TEXT = {
  your_card_sets: { vi: "Bộ Thẻ Của Bạn", en: "Your Card Sets" },
  search_placeholder: { vi: "Tìm bộ thẻ", en: "Search card sets" },
  sort: { vi: "Sắp xếp", en: "Sort" },
  all: { vi: "Tất cả", en: "All" },
  mine: { vi: "Của tôi", en: "Mine" },
  saved: { vi: "Đã lưu", en: "Saved" },
  loading: { vi: "Đang tải dữ liệu...", en: "Loading..." },
  no_card_set: { vi: "Không tìm thấy bộ thẻ nào", en: "No card sets found" },
  create_card_set: { vi: "Tạo bộ thẻ mới", en: "Create New Card Set" },
  create: { vi: "Tạo", en: "Create" },
  cancel: { vi: "Huỷ", en: "Cancel" },
  edit_card_set: { vi: "Sửa bộ thẻ", en: "Edit Card Set" },
  save: { vi: "Lưu", en: "Save" },
  delete: { vi: "Xoá", en: "Delete" },
  delete_card_set: { vi: "Xoá bộ thẻ", en: "Delete Card Set" },
  delete_card_set_confirm: {
    vi: "Bạn chắc chắn muốn xoá bộ thẻ này?",
    en: "Are you sure you want to delete this card set?",
  },
  card_set_name: { vi: "Tên bộ thẻ", en: "Card Set Name" },
  card_set_desc: { vi: "Mô tả", en: "Description" },
  category: { vi: "Danh mục", en: "Category" },
  filter: { vi: "Bộ lọc", en: "Filter" },
  categories: { vi: "Danh mục", en: "Categories" },
  clear_filter: { vi: "Xóa lọc", en: "Clear filter" },
  apply: { vi: "Áp dụng", en: "Apply" },
  title_az: { vi: "Tên A-Z", en: "Title A-Z" },
  newest: { vi: "Mới nhất", en: "Newest" },
  most_cards: { vi: "Nhiều thẻ nhất", en: "Most cards" },
  info_missing: { vi: "Thiếu thông tin", en: "Missing information" },
  card_set_name_required: {
    vi: "Tên bộ thẻ không được để trống",
    en: "Card set name cannot be blank",
  },
  tab_all: { vi: "Tất cả", en: "All" },
  tab_mine: { vi: "Của tôi", en: "Mine" },
  tab_saved: { vi: "Đã lưu", en: "Saved" },
  cards: { vi: "thẻ", en: "cards" },
};

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

const filterCategories = [
  "Ngôn ngữ",
  "Mỹ thuật",
  "Lập trình",
  "Âm nhạc",
  "Toán học",
];

export default function Card() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { darkMode } = useDarkMode();
  const theme = darkMode ? darkTheme : lightTheme;
  const { lang } = useLanguage();

  // Cập nhật theo ngôn ngữ động
  const TABS = [TEXT.tab_all[lang], TEXT.tab_mine[lang], TEXT.tab_saved[lang]];
  const sortModes = [
    { label: TEXT.title_az[lang], value: "titleAsc" },
    { label: TEXT.newest[lang], value: "latest" },
    { label: TEXT.most_cards[lang], value: "mostCards" },
  ];

  const [selectedTab, setSelectedTab] = useState(TABS[0]);
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
    if (selectedTab === TEXT.tab_mine[lang]) {
      result = result.filter((set) => set.author === "Huy Nguyen");
    }
    if (selectedTab === TEXT.tab_saved[lang]) {
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
      Alert.alert(TEXT.info_missing[lang], TEXT.card_set_name_required[lang]);
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
    Alert.alert(
      TEXT.delete_card_set[lang],
      TEXT.delete_card_set_confirm[lang],
      [
        { text: TEXT.cancel[lang], onPress: () => setDeletingId(null) },
        {
          text: TEXT.delete[lang],
          style: "destructive",
          onPress: () => {
            setCardSets((prev) => prev.filter((c) => c.id !== id));
            setDeletingId(null);
          },
        },
      ],
    );
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

  // Khi đổi ngôn ngữ thì reset tab về tab đầu tiên (tránh lỗi không khớp)
  useEffect(() => {
    setSelectedTab(TABS[0]);
  }, [lang]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.text }]}>
          {TEXT.your_card_sets[lang]}
        </Text>
        <TouchableOpacity>
          <Image
            source={require("../../assets/images/avatar.png")}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      {/* Search bar + sort */}
      <View style={[styles.searchRow, { backgroundColor: theme.card }]}>
        <Ionicons
          name="search"
          size={scale(18)}
          color={theme.subText}
          style={{ marginLeft: scale(8) }}
        />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder={TEXT.search_placeholder[lang]}
          placeholderTextColor={theme.subText}
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons name="options" size={scale(20)} color={theme.subText} />
        </TouchableOpacity>
        {/* Sort */}
        <TouchableOpacity
          style={styles.sortBtn}
          onPress={() => {
            const idx = sortModes.findIndex((m) => m.value === sortMode);
            setSortMode(sortModes[(idx + 1) % sortModes.length].value);
          }}
        >
          <Ionicons
            name="swap-vertical"
            size={scale(21)}
            color={theme.subText}
          />
          <Text
            style={{
              color: theme.subText,
              fontSize: scale(13),
              marginLeft: scale(2),
            }}
          >
            {sortModes.find((m) => m.value === sortMode)?.label ||
              TEXT.sort[lang]}
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
            style={[
              styles.categoryCard,
              {
                backgroundColor: darkMode ? theme.section : cat.color,
              },
            ]}
            activeOpacity={0.8}
          >
            {cat.image && (
              <Image
                source={cat.image}
                style={styles.categoryImage}
                resizeMode="contain"
              />
            )}
            <Text style={[styles.categoryTitle, { color: theme.primary }]}>
              {cat.title}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={
              selectedTab === tab
                ? [styles.tabActive, { backgroundColor: theme.primary }]
                : styles.tab
            }
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              style={
                selectedTab === tab
                  ? [styles.tabActiveText, { color: "#fff" }]
                  : [styles.tabText, { color: theme.subText }]
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
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={{ color: theme.subText, marginTop: scale(10) }}>
              {TEXT.loading[lang]}
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
                  style={[
                    styles.cardItem,
                    {
                      backgroundColor: theme.card,
                      shadowColor: theme.subText,
                    },
                  ]}
                  onPress={() => navigation.navigate("CardDetail")}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.cardImageBox,
                      { backgroundColor: theme.section },
                    ]}
                  >
                    <Image
                      source={item.image}
                      style={styles.cardImagePlaceholder}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>
                      {item.title}
                    </Text>
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
                        color={theme.subText}
                      />
                      <Text
                        style={[styles.cardAuthor, { color: theme.subText }]}
                      >
                        {" "}
                        {item.author}
                      </Text>
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
                        color={theme.primary}
                      />
                      <Text
                        style={[
                          styles.cardTotalCards,
                          { color: theme.primary },
                        ]}
                      >
                        {"  "}
                        {item.totalCards} {TEXT.cards[lang]}
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
                      color={item.isSaved ? "#FFD600" : theme.subText}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ marginLeft: scale(2), padding: scale(6) }}
                    onPress={() => openEditModal(item)}
                  >
                    <Feather
                      name="edit"
                      size={scale(20)}
                      color={theme.primary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ marginLeft: scale(2), padding: scale(6) }}
                    onPress={() => handleDeleteCardSet(item.id)}
                  >
                    <Feather
                      name="trash-2"
                      size={scale(19)}
                      color={
                        deletingId === item.id
                          ? theme.danger || "#e74c3c"
                          : theme.subText
                      }
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
                <Text style={{ color: theme.subText, fontSize: scale(17) }}>
                  {TEXT.no_card_set[lang]}
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
                    {TEXT.create_card_set[lang]}
                  </Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => setAddModalVisible(true)}
      >
        <Ionicons name="add" size={scale(32)} color="#fff" />
      </TouchableOpacity>

      {/* Add CardSet Modal */}
      <Modal visible={addModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: theme.section }]}
          >
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {TEXT.create_card_set[lang]}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.card,
                  color: theme.text,
                  borderColor: theme.card,
                },
              ]}
              placeholder={TEXT.card_set_name[lang]}
              placeholderTextColor={theme.subText}
              value={newCardSet.title}
              onChangeText={(t) => setNewCardSet((c) => ({ ...c, title: t }))}
            />
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.card,
                  color: theme.text,
                  borderColor: theme.card,
                },
              ]}
              placeholder={TEXT.card_set_desc[lang]}
              placeholderTextColor={theme.subText}
              value={newCardSet.description}
              onChangeText={(t) =>
                setNewCardSet((c) => ({ ...c, description: t }))
              }
            />
            <Text
              style={{
                marginBottom: scale(7),
                marginTop: scale(7),
                color: theme.text,
              }}
            >
              {TEXT.category[lang]}
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
                    newCardSet.category === item && {
                      backgroundColor: theme.primary,
                    },
                  ]}
                  onPress={() =>
                    setNewCardSet((c) => ({ ...c, category: item }))
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      newCardSet.category === item && styles.chipTextActive,
                      newCardSet.category === item && { color: "#fff" },
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.card }]}
                onPress={() => setAddModalVisible(false)}
              >
                <Text style={{ color: theme.text }}>{TEXT.cancel[lang]}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.primary }]}
                onPress={handleAddCardSet}
              >
                <Text style={{ color: "#fff" }}>{TEXT.create[lang]}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Edit CardSet Modal */}
      <Modal visible={editModal.visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: theme.section }]}
          >
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {TEXT.edit_card_set[lang]}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.card,
                  color: theme.text,
                  borderColor: theme.card,
                },
              ]}
              placeholder={TEXT.card_set_name[lang]}
              placeholderTextColor={theme.subText}
              value={editCardSet.title}
              onChangeText={(t) => setEditCardSet((c) => ({ ...c, title: t }))}
            />
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.card,
                  color: theme.text,
                  borderColor: theme.card,
                },
              ]}
              placeholder={TEXT.card_set_desc[lang]}
              placeholderTextColor={theme.subText}
              value={editCardSet.description}
              onChangeText={(t) =>
                setEditCardSet((c) => ({ ...c, description: t }))
              }
            />
            <Text
              style={{
                marginBottom: scale(7),
                marginTop: scale(7),
                color: theme.text,
              }}
            >
              {TEXT.category[lang]}
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
                    editCardSet.category === item && {
                      backgroundColor: theme.primary,
                    },
                  ]}
                  onPress={() =>
                    setEditCardSet((c) => ({ ...c, category: item }))
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      editCardSet.category === item && styles.chipTextActive,
                      editCardSet.category === item && { color: "#fff" },
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.card }]}
                onPress={() => setEditModal({ visible: false, cardSetId: "" })}
              >
                <Text style={{ color: theme.text }}>{TEXT.cancel[lang]}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.primary }]}
                onPress={handleSaveEditCardSet}
              >
                <Text style={{ color: "#fff" }}>{TEXT.save[lang]}</Text>
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
              {
                transform: [{ translateY: contentAnim }],
                backgroundColor: theme.section,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setFilterVisible(false)}>
                <Ionicons name="close" size={scale(28)} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {TEXT.filter[lang]}
              </Text>
              <View style={{ width: scale(28) }} />
            </View>

            {/* Categories */}
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {TEXT.categories[lang]}
            </Text>
            <View style={styles.rowWrap}>
              {filterCategories.map((cat) => (
                <Pressable
                  key={cat}
                  style={[
                    styles.chip,
                    selectedCategories.includes(cat) && styles.chipActive,
                    selectedCategories.includes(cat) && {
                      backgroundColor: theme.primary,
                    },
                  ]}
                  onPress={() => toggleCategory(cat)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedCategories.includes(cat) && styles.chipTextActive,
                      selectedCategories.includes(cat) && { color: "#fff" },
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Buttons */}
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[
                  styles.clearBtn,
                  { borderColor: theme.primary, backgroundColor: theme.card },
                ]}
                onPress={clearFilter}
              >
                <Text style={[styles.btnText, { color: theme.primary }]}>
                  {TEXT.clear_filter[lang]}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.applyBtn, { backgroundColor: theme.primary }]}
                onPress={() => setFilterVisible(false)}
              >
                <Text style={[styles.btnText, { color: "#fff" }]}>
                  {TEXT.apply[lang]}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 0 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: scale(8),
    marginBottom: scale(18),
    paddingHorizontal: scale(24),
    justifyContent: "space-between",
  },
  title: { fontSize: scale(30), fontWeight: "bold" },
  avatar: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    backgroundColor: "#eee",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
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
  categoryTitle: { fontSize: scale(15), fontWeight: "bold" },
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
  tabText: { fontSize: scale(15), fontWeight: "600" },
  tabActive: {
    borderRadius: scale(16),
    paddingHorizontal: scale(18),
    paddingVertical: scale(6),
    marginLeft: scale(8),
  },
  tabActiveText: { fontSize: scale(15), fontWeight: "bold" },
  cardItemBox: { marginBottom: scale(11) },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: scale(16),
    marginHorizontal: scale(24),
    padding: scale(16),
    shadowOpacity: 0.12,
    shadowRadius: scale(8),
    elevation: 3,
  },
  cardImageBox: {
    width: scale(58),
    height: scale(58),
    borderRadius: scale(12),
    marginRight: scale(16),
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
  cardTitle: { fontSize: scale(17), fontWeight: "bold" },
  cardAuthor: { fontSize: scale(13), marginLeft: scale(2) },
  cardTotalCards: {
    fontSize: scale(14),
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
  modalTitle: { fontSize: scale(22), fontWeight: "700" },
  sectionTitle: {
    fontSize: scale(17),
    fontWeight: "600",
    marginVertical: scale(10),
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
  chipActive: {},
  chipText: { fontWeight: "500", fontSize: scale(15) },
  chipTextActive: {},
  btnRow: {
    flexDirection: "row",
    marginTop: scale(18),
    marginBottom: scale(10),
    justifyContent: "space-between",
  },
  clearBtn: {
    borderWidth: 1,
    borderRadius: scale(12),
    paddingVertical: scale(13),
    paddingHorizontal: scale(30),
  },
  applyBtn: {
    borderRadius: scale(12),
    paddingVertical: scale(13),
    paddingHorizontal: scale(30),
  },
  btnText: { fontSize: scale(17), fontWeight: "600" },
  modalContent: {
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
    borderRadius: scale(8),
    padding: scale(10),
    marginBottom: scale(10),
    fontSize: scale(16),
    backgroundColor: "#F7F8FB",
  },
  modalBtn: {
    paddingHorizontal: scale(20),
    paddingVertical: scale(10),
    borderRadius: scale(8),
    marginLeft: scale(10),
    marginTop: scale(6),
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    right: scale(32),
    bottom: scale(36),
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
    borderRadius: scale(18),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(20),
    paddingVertical: scale(9),
  },
});
