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
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../AppNavigator";
import { useDarkMode } from "../DarkModeContext";
import { lightTheme, darkTheme } from "../theme";
import { useLanguage } from "../LanguageContext";
import { supabase } from "../../supabase/supabaseClient";

// Helper for short string (chỉ dùng cho description)
const shortText = (text: string, max: number = 13) =>
  text && text.length > max ? text.slice(0, max) + "..." : text;

// MarqueeText cho title (có hiệu ứng trôi)
const MarqueeText = ({
  text,
  style,
  width,
  duration = 6000,
  numberOfLines = 1,
}: {
  text: string;
  style?: any;
  width: number;
  duration?: number;
  numberOfLines?: number;
}) => {
  const [shouldScroll, setShouldScroll] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const textRef = useRef<Text>(null);
  const [textWidth, setTextWidth] = useState(0);

  useEffect(() => {
    if (textWidth > width) {
      setShouldScroll(true);
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: -textWidth + width - 10,
            duration: duration,
            useNativeDriver: true,
            delay: 800,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
            delay: 1000,
          }),
        ]),
      ).start();
    } else {
      setShouldScroll(false);
      animatedValue.setValue(0);
    }
  }, [textWidth, width, text, duration, animatedValue]);

  return (
    <View style={{ width, overflow: "hidden", flexDirection: "row" }}>
      <Animated.Text
        ref={textRef}
        style={[
          style,
          shouldScroll && {
            transform: [{ translateX: animatedValue }],
            minWidth: textWidth,
          },
        ]}
        numberOfLines={numberOfLines}
        ellipsizeMode="tail"
        onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
      >
        {text}
      </Animated.Text>
    </View>
  );
};

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
  filter: { vi: "Bộ lọc", en: "Filter" },
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

export default function Card() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { darkMode } = useDarkMode();
  const theme = darkMode ? darkTheme : lightTheme;
  const { lang } = useLanguage();

  const TABS = [TEXT.tab_all[lang], TEXT.tab_mine[lang], TEXT.tab_saved[lang]];
  const sortModes = [
    { label: TEXT.title_az[lang], value: "titleAsc" },
    { label: TEXT.newest[lang], value: "latest" },
    { label: TEXT.most_cards[lang], value: "mostCards" },
  ];

  const [selectedTab, setSelectedTab] = useState(TABS[0]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModal, setEditModal] = useState({ visible: false, cardSetId: "" });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [searchText, setSearchText] = useState("");
  const [sortMode, setSortMode] = useState("latest");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [cardSets, setCardSets] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  const overlayAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const [newCardSet, setNewCardSet] = useState({
    title: "",
    description: "",
  });

  const [editCardSet, setEditCardSet] = useState({
    title: "",
    description: "",
    id: "",
  });

  // Fetch user & decks, username
  const fetchData = async () => {
    setLoading(true);
    try {
      const {
        data: { user: authUser },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr) throw new Error(userErr.message);
      if (!authUser) {
        setLoading(false);
        Alert.alert("Lỗi xác thực", "Không thể lấy thông tin người dùng!");
        console.error("Không thể lấy thông tin người dùng!");
        return;
      }
      setUser(authUser);
      // Fetch decks, với users:users(username) để lấy username tác giả
      const { data: decksData, error: decksError } = await supabase
        .from("decks")
        .select(
          "id, title, description, created_at, user_id, users:users(username)",
        )
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false });
      if (decksError) throw new Error(decksError.message);

      // Fetch card count cho mỗi deck
      let decksWithCount = await Promise.all(
        (decksData || []).map(async (deck) => {
          const { count, error: cardsError } = await supabase
            .from("cards")
            .select("id", { count: "exact", head: true })
            .eq("deck_id", deck.id);
          if (cardsError) {
            Alert.alert("Lỗi lấy số thẻ", cardsError.message);
            console.error("Lỗi lấy số thẻ:", cardsError);
          }
          return {
            id: String(deck.id),
            title: deck.title,
            username:
              (deck.users && typeof deck.users === "object"
                ? deck.users.username
                : "") ?? "",
            totalCards: count || 0,
            image: require("../../assets/images/avatar.png"),
            description: deck.description,
            isSaved: false,
            createdAt: deck.created_at ? new Date(deck.created_at) : new Date(),
            user_id: deck.user_id,
          };
        }),
      );
      setCardSets(decksWithCount);

      // Log liên kết cardSets
      console.log("Fetched cardSets:");
      decksWithCount.forEach((cs) =>
        console.log(
          `deck_id=${cs.id}, user_id=${cs.user_id}, username=${cs.username}, title=${cs.title}, createdAt=${cs.createdAt}`,
        ),
      );
    } catch (err: any) {
      Alert.alert(
        "Lỗi hệ thống",
        err?.message || "Đã xảy ra lỗi không xác định",
      );
      console.error("Lỗi hệ thống:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Log lại mỗi khi cardSets thay đổi
  useEffect(() => {
    if (cardSets?.length) {
      console.log("cardSets state updated:");
      cardSets.forEach((cs) =>
        console.log(
          `deck_id=${cs.id}, user_id=${cs.user_id}, username=${cs.username}, title=${cs.title}, createdAt=${cs.createdAt}`,
        ),
      );
    }
  }, [cardSets]);

  useEffect(() => {
    setSelectedTab(TABS[0]);
  }, [lang]);

  // Modal animation
  useEffect(() => {
    if (addModalVisible || editModal.visible) {
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
  }, [
    addModalVisible,
    editModal.visible,
    SCREEN_HEIGHT,
    overlayAnim,
    contentAnim,
  ]);

  // Filter cardSets
  const filterCardSets = () => {
    let result = [...cardSets];
    if (selectedTab === TEXT.tab_mine[lang]) {
      result = result.filter((set) => set.user_id === user?.id);
    }
    if (selectedTab === TEXT.tab_saved[lang]) {
      result = result.filter((set) => set.isSaved);
    }
    if (searchText.trim() !== "") {
      result = result.filter((set) =>
        set.title.toLowerCase().includes(searchText.toLowerCase()),
      );
    }
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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Sau khi thêm mới, luôn gọi fetchData lại để đảm bảo đồng bộ DB/state
  const handleAddCardSet = async () => {
    if (!newCardSet.title.trim()) {
      Alert.alert(TEXT.info_missing[lang], TEXT.card_set_name_required[lang]);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("decks")
        .insert([
          {
            title: newCardSet.title,
            description: newCardSet.description,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw new Error(error.message);

      setNewCardSet({ title: "", description: "" });
      setAddModalVisible(false);

      // Fetch lại toàn bộ decks sau khi thêm
      await fetchData();
    } catch (err: any) {
      Alert.alert(
        "Lỗi thêm bộ thẻ",
        err?.message || "Đã xảy ra lỗi khi thêm bộ thẻ",
      );
      console.error("Lỗi thêm bộ thẻ:", err);
    }
  };

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
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("decks")
                .delete()
                .eq("id", id);
              if (error) throw new Error(error.message);

              // Fetch lại toàn bộ decks sau khi xoá
              await fetchData();
            } catch (err: any) {
              Alert.alert(
                "Lỗi xoá bộ thẻ",
                err?.message || "Không thể xoá bộ thẻ",
              );
              console.error("Lỗi xoá bộ thẻ:", err);
            }
            setDeletingId(null);
          },
        },
      ],
    );
  };

  const toggleSaveCardSet = (id: string) => {
    setCardSets((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isSaved: !c.isSaved } : c)),
    );
  };

  const openEditModal = (cardSet: any) => {
    setEditCardSet({
      title: cardSet.title,
      description: cardSet.description,
      id: cardSet.id,
    });
    setEditModal({ visible: true, cardSetId: cardSet.id });
  };

  const handleSaveEditCardSet = async () => {
    try {
      const { error } = await supabase
        .from("decks")
        .update({
          title: editCardSet.title,
          description: editCardSet.description,
        })
        .eq("id", editCardSet.id);
      if (error) throw new Error(error.message);

      setEditModal({ visible: false, cardSetId: "" });
      // Fetch lại toàn bộ decks sau khi sửa
      await fetchData();
    } catch (err: any) {
      Alert.alert("Lỗi cập nhật", err?.message || "Không thể cập nhật bộ thẻ");
      console.error("Lỗi cập nhật bộ thẻ:", err);
    }
  };

  // ====== UI Render ======
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
                  onPress={() =>
                    navigation.navigate("CardDetail", { deckId: item.id })
                  }
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
                    <MarqueeText
                      text={item.title}
                      style={[styles.cardTitle, { color: theme.text }]}
                      width={SCREEN_WIDTH - scale(180)}
                      duration={5500}
                    />
                    <Text
                      style={[
                        styles.cardDescription,
                        {
                          color: theme.subText,
                          width: SCREEN_WIDTH - scale(180),
                        },
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {shortText(item.description || "", 13)}
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
                        {item.username?.length > 13
                          ? item.username.slice(0, 13) + "..."
                          : item.username}
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
            <Text
              style={[
                styles.modalTitle,
                {
                  color: theme.text,
                  fontSize: scale(22),
                  fontWeight: "700",
                  marginBottom: scale(10),
                },
              ]}
            >
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
            <Text
              style={[
                styles.modalTitle,
                {
                  color: theme.text,
                  fontSize: scale(22),
                  fontWeight: "700",
                  marginBottom: scale(10),
                },
              ]}
            >
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
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: scale(8),
    padding: scale(2),
  },
  tabsRow: {
    flexDirection: "row",
    marginLeft: scale(24),
    marginBottom: scale(10),
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
  cardDescription: { fontSize: scale(13), color: "#888", marginTop: scale(2) },
  cardAuthor: { fontSize: scale(13), marginLeft: scale(2) },
  cardTotalCards: {
    fontSize: scale(14),
    marginLeft: scale(2),
    fontWeight: "bold",
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(40,40,50,0.22)",
    zIndex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: scale(18),
    padding: scale(22),
    width: SCREEN_WIDTH * 0.85,
    shadowColor: "#222",
    shadowOpacity: 0.11,
    shadowRadius: scale(10),
    elevation: 5,
  },
  modalTitle: {
    fontSize: scale(22),
    fontWeight: "700",
    marginBottom: scale(10),
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
