import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  FlatList,
  TextInput,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useDarkMode } from "../DarkModeContext";
import { lightTheme, darkTheme } from "../theme";
import { useLanguage } from "../LanguageContext";
import { supabase } from "../../supabase/supabaseClient";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const fallbackImage = require("../../assets/images/avatar.png");

const TEXT = {
  card_set_title: { vi: "Tên bộ thẻ", en: "Card Set Name" },
  cards: { vi: "thẻ", en: "cards" },
  set_description: { vi: "Mô tả bộ thẻ", en: "Set description" },
  card_list: { vi: "Danh sách thẻ", en: "Card List" },
  add_card: { vi: "Thêm thẻ", en: "Add Card" },
  illustration: { vi: "Ảnh minh họa", en: "Illustration" },
  auto_suggest: { vi: "Tự động gợi ý", en: "Auto Suggest" },
  auto_loading: { vi: "...", en: "..." },
  regenerate_image: { vi: "Tạo lại ảnh khác", en: "Regenerate Image" },
  edit_card: { vi: "Sửa thẻ", en: "Edit Card" },
  delete_card_confirm: { vi: "Xóa thẻ?", en: "Delete card?" },
  delete_card_desc: {
    vi: "Bạn có chắc muốn xóa thẻ này?",
    en: "Are you sure you want to delete this card?",
  },
  cancel: { vi: "Hủy", en: "Cancel" },
  delete: { vi: "Xóa", en: "Delete" },
  save: { vi: "Lưu", en: "Save" },
  add_manual: { vi: "Nhập thủ công", en: "Manual Entry" },
  add_bulk: { vi: "Nhập hàng loạt từ file", en: "Bulk Import" },
  import_hint: {
    vi: "Bạn có thể chọn nhập từng thẻ hoặc nhập hàng loạt từ file CSV/JSON",
    en: "You can add cards manually or import from CSV/JSON file",
  },
  import_loading: { vi: "Đang nhập file...", en: "Importing file..." },
  card_front: { vi: "Mặt trước (từ/cụm từ)", en: "Front (word/phrase)" },
  card_phonetic: {
    vi: "Phiên âm (có thể tự nhập hoặc để trống)",
    en: "Phonetic (optional)",
  },
  card_pos: {
    vi: "Từ loại (danh từ, động từ...)",
    en: "Part of Speech (noun, verb, ...)",
  },
  card_back: {
    vi: "Mặt sau (nghĩa/giải thích)",
    en: "Back (meaning/definition)",
  },
  card_example: { vi: "Ví dụ (không bắt buộc)", en: "Example (optional)" },
  card_image: {
    vi: "Link ảnh (tùy chọn, nếu không có sẽ dùng ảnh mặc định)",
    en: "Image url (optional, will use default if empty)",
  },
  illustration_hint: {
    vi: "Ảnh minh họa (có thể sửa hoặc tạo lại)",
    en: "Illustration (can be edited or regenerated)",
  },
  no_card: {
    vi: "Bộ thẻ này chưa có thẻ nào",
    en: "This set has no cards yet",
  },
  edit_set: { vi: "Chỉnh sửa bộ thẻ", en: "Edit Card Set" },
  set_name: { vi: "Tên bộ thẻ", en: "Set Name" },
  set_desc: { vi: "Mô tả bộ thẻ", en: "Set Description" },
  add: { vi: "Thêm", en: "Add" },
  study: { vi: "Học", en: "Study" },
  edit_set_action: { vi: "Chỉnh sửa bộ thẻ", en: "Edit Card Set" },
  new_card_title: { vi: "Thêm thẻ mới", en: "Add new card" },
  missing_info: { vi: "Thiếu thông tin", en: "Missing information" },
  missing_info_detail: {
    vi: "Mặt trước và mặt sau không được để trống",
    en: "Front and back cannot be empty",
  },
  import_invalid: {
    vi: "Không có dữ liệu hợp lệ trong file!",
    en: "No valid data in file!",
  },
  import_success: {
    vi: "Đã nhập thành công {count} thẻ!",
    en: "Successfully imported {count} cards!",
  },
  import_fail: {
    vi: "Có lỗi khi đọc file hoặc định dạng không đúng!",
    en: "Failed to read file or invalid format!",
  },
  enter_vocab_first: {
    vi: "Nhập từ vựng trước đã!",
    en: "Please enter the vocabulary first!",
  },
  edit_card_title: { vi: "Sửa thẻ", en: "Edit Card" },
  add_card_modal_title: { vi: "Thêm thẻ mới", en: "Add new card" },
  edit_set_modal_title: { vi: "Chỉnh sửa bộ thẻ", en: "Edit Card Set" },
};

async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

// --- API tự động điền ---
async function translateToVietnamese(word: string): Promise<string> {
  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(word)}`,
    );
    const data = await res.json();
    return data?.[0]?.[0]?.[0] || "";
  } catch {
    return "";
  }
}

async function fetchWordData(word: string) {
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
    );
    const data = await res.json();
    let phonetic = "",
      partOfSpeech = "",
      example = "";
    if (Array.isArray(data) && data[0]) {
      phonetic =
        data[0].phonetic ||
        (data[0].phonetics &&
          data[0].phonetics.find((p: any) => p.text)?.text) ||
        "";
      partOfSpeech = data[0].meanings?.[0]?.partOfSpeech || "";
      example =
        data[0].meanings
          ?.flatMap((m: any) => m.definitions)
          .find((def: any) => def.example)?.example ||
        data[0].meanings?.[0]?.definitions?.[0]?.example ||
        "";
    }
    const viMeaning = await translateToVietnamese(word);
    return {
      phonetic,
      partOfSpeech,
      example,
      viMeaning,
    };
  } catch {
    return {};
  }
}

async function fetchPixabayImage(word: string) {
  const PIXABAY_API_KEY = "32527145-1448acf0aed3630c8387734cf";
  try {
    const res = await fetch(
      `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(
        word,
      )}&image_type=photo&per_page=3&safesearch=true`,
    );
    const data = await res.json();
    if (data.hits && data.hits.length > 0) {
      const idx = Math.floor(Math.random() * Math.min(3, data.hits.length));
      return data.hits[idx].webformatURL || data.hits[idx].previewURL;
    }
    return "";
  } catch {
    return "";
  }
}

export default function CardDetail() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: { deckId: number } }, "params">>();
  const { darkMode } = useDarkMode();
  const theme = darkMode ? darkTheme : lightTheme;
  const { lang } = useLanguage();

  const [deck, setDeck] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editCard, setEditCard] = useState<any>(null);
  const [editSet, setEditSet] = useState(false);
  const [newCard, setNewCard] = useState({
    front: "",
    back: "",
    example: "",
    phonetic: "",
    partOfSpeech: "",
    image: "",
  });
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [importing, setImporting] = useState(false);
  const [loadingAuto, setLoadingAuto] = useState(false);
  const [imgPreview, setImgPreview] = useState("");

  const deckId = route.params?.deckId;

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: deckData } = await supabase
        .from("decks")
        .select("*")
        .eq("id", deckId)
        .single();
      if (!deckData) {
        Alert.alert("Không tìm thấy bộ thẻ");
        setLoading(false);
        return;
      }
      setDeck(deckData);
      setEditName(deckData.title);
      setEditDesc(deckData.description);

      const { data: cardsData } = await supabase
        .from("cards")
        .select("*")
        .eq("deck_id", deckId)
        .order("id");
      setCards(cardsData || []);

      const user = await getCurrentUser();
      setIsOwner(deckData.user_id === user?.id);

      setLoading(false);
    }
    if (deckId) load();
  }, [deckId]);

  // Tự động điền
  async function handleAutoFill() {
    if (!newCard.front.trim()) {
      Alert.alert(TEXT.enter_vocab_first[lang]);
      return;
    }
    setLoadingAuto(true);
    const info = await fetchWordData(newCard.front.trim());
    const img = await fetchPixabayImage(newCard.front.trim());
    setNewCard((prev) => ({
      ...prev,
      phonetic: info.phonetic || "",
      partOfSpeech: info.partOfSpeech || "",
      back: info.viMeaning || prev.back,
      example: info.example || prev.example,
      image: img || "",
    }));
    setImgPreview(img || "");
    setLoadingAuto(false);
  }

  async function handleRegenerateImage() {
    if (!newCard.front.trim()) {
      Alert.alert(TEXT.enter_vocab_first[lang]);
      return;
    }
    setLoadingAuto(true);
    const img = await fetchPixabayImage(newCard.front.trim());
    setNewCard((prev) => ({ ...prev, image: img || "" }));
    setImgPreview(img || "");
    setLoadingAuto(false);
  }

  // Thêm thẻ mới
  async function handleAddCard() {
    if (!newCard.front.trim() || !newCard.back.trim()) {
      Alert.alert(TEXT.missing_info[lang], TEXT.missing_info_detail[lang]);
      return;
    }
    const { error, data } = await supabase
      .from("cards")
      .insert({
        deck_id: deckId,
        front_text: newCard.front,
        back_text: newCard.back,
        image_url: newCard.image || null,
        phonetic: newCard.phonetic,
        part_of_speech: newCard.partOfSpeech,
        example: newCard.example,
      })
      .select()
      .single();
    if (error) {
      Alert.alert("Lỗi", error.message);
      return;
    }
    setCards((prev) => [...prev, data]);
    setNewCard({
      front: "",
      back: "",
      example: "",
      phonetic: "",
      partOfSpeech: "",
      image: "",
    });
    setModalVisible(false);
    setImgPreview("");
    setLoadingAuto(false);
  }

  // Xoá thẻ
  async function handleDeleteCard(cardId: number) {
    Alert.alert(TEXT.delete_card_confirm[lang], TEXT.delete_card_desc[lang], [
      { text: TEXT.cancel[lang] },
      {
        text: TEXT.delete[lang],
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase
            .from("cards")
            .delete()
            .eq("id", cardId);
          if (!error) setCards(cards.filter((c) => c.id !== cardId));
        },
      },
    ]);
  }

  // Sửa thẻ
  async function handleSaveEditCard() {
    if (!editCard) return;
    const { error, data } = await supabase
      .from("cards")
      .update({
        front_text: editCard.front_text,
        back_text: editCard.back_text,
        image_url: editCard.image_url,
        phonetic: editCard.phonetic,
        part_of_speech: editCard.part_of_speech,
        example: editCard.example,
      })
      .eq("id", editCard.id)
      .select()
      .single();
    if (!error) {
      setCards(cards.map((c) => (c.id === editCard.id ? data : c)));
      setEditCard(null);
    }
  }

  // Sửa thông tin bộ thẻ
  async function handleSaveSetInfo() {
    const { error, data } = await supabase
      .from("decks")
      .update({
        title: editName,
        description: editDesc,
      })
      .eq("id", deckId)
      .select()
      .single();
    if (!error && data) {
      setDeck(data);
      setEditSet(false);
    }
  }

  // Nhập nhiều thẻ từ file (nếu thiếu ảnh sẽ tự lấy minh họa)
  async function handleBulkImportFromModal() {
    try {
      setImporting(true);
      const res = await DocumentPicker.getDocumentAsync({
        type: ["text/csv", "application/json", "text/plain"] as any,
        copyToCacheDirectory: true,
      });
      if (res.canceled || !res.assets || !res.assets[0]?.uri) {
        setImporting(false);
        return;
      }
      const file = res.assets[0];
      const uri = file.uri;
      const name = file.name ?? "file";
      const content = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      let cardsImported: any[] = [];
      if (name.endsWith(".json")) {
        cardsImported = JSON.parse(content);
      } else {
        // Duyệt từng dòng, nếu thiếu ảnh thì tự động lấy ảnh từ API
        cardsImported = await Promise.all(
          content.split(/\r?\n/).map(async (line) => {
            if (!line.trim()) return null;
            const [front, back, example, phonetic, partOfSpeech, image] =
              line.split(",");
            if (!front || !back) return null;
            let image_url = image || "";
            if (!image_url) {
              image_url = await fetchPixabayImage(front.trim());
            }
            return {
              front_text: front,
              back_text: back,
              example: example || "",
              phonetic: phonetic || "",
              part_of_speech: partOfSpeech || "",
              image_url: image_url || "",
            };
          }),
        );
        cardsImported = cardsImported.filter(Boolean);
      }
      if (!cardsImported.length) {
        Alert.alert(TEXT.import_invalid[lang]);
        setImporting(false);
        return;
      }
      const { data, error } = await supabase
        .from("cards")
        .insert(cardsImported.map((c) => ({ ...c, deck_id: deckId })))
        .select();
      if (!error) setCards((prev) => [...prev, ...(data || [])]);
      setModalVisible(false);
      Alert.alert(
        TEXT.import_success[lang].replace(
          "{count}",
          (data?.length || 0).toString(),
        ),
      );
    } catch (err) {
      Alert.alert(TEXT.import_fail[lang]);
    }
    setImporting(false);
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (!deck) return null;

  const renderHeader = () => (
    <View>
      <Text style={[styles.cardSetTitle, { color: theme.text }]}>
        {deck.title}
      </Text>
      <Text style={[styles.subInfo, { color: theme.subText || "#BFC8D6" }]}>
        {cards.length} {TEXT.cards[lang]}
      </Text>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        {TEXT.set_description[lang]}
      </Text>
      <Text style={[styles.description, { color: theme.text }]}>
        {deck.description}
      </Text>
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {TEXT.card_list[lang]} ({cards.length})
        </Text>
        {isOwner && (
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: theme.primary }]}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={scale(22)} color="#fff" />
            <Text
              style={{
                color: "#fff",
                marginLeft: scale(4),
                fontWeight: "bold",
              }}
            >
              {TEXT.add_card[lang]}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.headerBox, { backgroundColor: theme.section }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back" size={scale(24)} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {deck.title}
        </Text>
        <Image source={fallbackImage} style={styles.headerImage} />
      </View>
      <FlatList
        data={cards}
        keyExtractor={(item) => item.id + ""}
        style={[styles.contentBox, { backgroundColor: theme.section }]}
        ListHeaderComponent={renderHeader()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.flashCardRow,
              { backgroundColor: theme.card || "#F7F8FB" },
            ]}
          >
            <View style={{ alignItems: "center", marginRight: scale(14) }}>
              <View pointerEvents="none">
                <Image
                  source={
                    item.image_url ? { uri: item.image_url } : fallbackImage
                  }
                  style={{
                    width: scale(62),
                    height: scale(62),
                    borderRadius: scale(10),
                    backgroundColor: "#eee",
                  }}
                  resizeMode="cover"
                />
              </View>
              <Text
                style={{
                  color: theme.subText || "#aaa",
                  fontSize: scale(12),
                  marginTop: scale(2),
                }}
              >
                {TEXT.illustration[lang]}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.flashCardFront, { color: theme.primary }]}>
                {item.front_text}
                {item.part_of_speech ? (
                  <Text style={styles.cardPOS}> ({item.part_of_speech})</Text>
                ) : null}
                {item.phonetic ? (
                  <Text style={styles.cardPhonetic}> {item.phonetic}</Text>
                ) : null}
              </Text>
              <Text style={[styles.flashCardBack, { color: theme.text }]}>
                {item.back_text}
              </Text>
              {item.example ? (
                <Text
                  style={[
                    styles.flashCardExample,
                    { color: theme.subText || "#888" },
                  ]}
                >
                  {item.example}
                </Text>
              ) : null}
              {isOwner && (
                <View style={{ flexDirection: "row", marginTop: scale(8) }}>
                  <TouchableOpacity
                    style={[
                      styles.iconBtn,
                      {
                        backgroundColor: theme.section,
                        borderColor: theme.card,
                      },
                    ]}
                    onPress={() =>
                      setEditCard({
                        ...item,
                        image_url: item.image_url || "",
                        front_text: item.front_text,
                        back_text: item.back_text,
                        phonetic: item.phonetic,
                        part_of_speech: item.part_of_speech,
                        example: item.example,
                      })
                    }
                  >
                    <Feather
                      name="edit-2"
                      size={scale(18)}
                      color={theme.primary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.iconBtn,
                      {
                        backgroundColor: theme.section,
                        borderColor: theme.card,
                      },
                    ]}
                    onPress={() => handleDeleteCard(item.id)}
                  >
                    <Feather
                      name="trash-2"
                      size={scale(18)}
                      color={theme.danger || "#e74c3c"}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text
            style={{
              color: theme.subText || "#bbb",
              textAlign: "center",
              marginTop: scale(30),
            }}
          >
            {TEXT.no_card[lang]}
          </Text>
        }
        contentContainerStyle={{ paddingBottom: scale(120) }}
      />

      <View
        style={[
          styles.bottomBar,
          { backgroundColor: theme.section, shadowColor: theme.text },
        ]}
      >
        <TouchableOpacity
          style={[styles.favBtn, { backgroundColor: theme.card || "#FFEFF6" }]}
        >
          <MaterialIcons name="star-border" size={scale(28)} color="#FF7F00" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buyBtn, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate("Study", { deckId })}
        >
          <Text
            style={{ color: "#fff", fontWeight: "bold", fontSize: scale(18) }}
          >
            {TEXT.study[lang]}
          </Text>
        </TouchableOpacity>
        {isOwner && (
          <TouchableOpacity
            style={[
              styles.buyBtn,
              { marginLeft: scale(8), backgroundColor: "#BFC8D6" },
            ]}
            onPress={() => setEditSet(true)}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: "bold",
                fontSize: scale(18),
              }}
            >
              {TEXT.edit_set_action[lang]}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal thêm thẻ mới */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{
              flex: 1,
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
            keyboardVerticalOffset={Platform.OS === "ios" ? scale(40) : 0}
          >
            <View
              style={[
                styles.modalContent,
                {
                  maxHeight: SCREEN_HEIGHT * 0.85,
                  backgroundColor: theme.section,
                },
              ]}
            >
              <ScrollView
                contentContainerStyle={{
                  paddingBottom: scale(12),
                  paddingTop: scale(16),
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  {TEXT.add_card_modal_title[lang]}
                </Text>
                <View style={{ flexDirection: "row", marginBottom: scale(12) }}>
                  <TouchableOpacity
                    style={[
                      styles.modalBtn,
                      { flex: 1, backgroundColor: theme.primary },
                    ]}
                    disabled={true}
                  >
                    <Text style={{ color: "#fff", textAlign: "center" }}>
                      {TEXT.add_manual[lang]}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalBtn,
                      {
                        flex: 1,
                        backgroundColor: theme.section,
                        marginLeft: scale(8),
                        borderWidth: 1,
                        borderColor: theme.primary,
                      },
                    ]}
                    disabled={importing}
                    onPress={handleBulkImportFromModal}
                  >
                    <Text style={{ color: theme.primary, textAlign: "center" }}>
                      {TEXT.add_bulk[lang]}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text
                  style={{
                    color: theme.subText || "#888",
                    fontSize: scale(13),
                    marginBottom: scale(8),
                  }}
                >
                  {importing
                    ? TEXT.import_loading[lang]
                    : TEXT.import_hint[lang]}
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
                  placeholder={TEXT.card_front[lang]}
                  placeholderTextColor={theme.subText || "#888"}
                  value={newCard.front}
                  onChangeText={(t) => setNewCard((c) => ({ ...c, front: t }))}
                  returnKeyType="next"
                />
                <View style={{ flexDirection: "row", marginBottom: scale(8) }}>
                  <TouchableOpacity
                    style={[
                      styles.modalBtn,
                      { flex: 1, backgroundColor: theme.card },
                    ]}
                    onPress={handleAutoFill}
                    disabled={loadingAuto}
                  >
                    <Text style={{ color: theme.text }}>
                      {loadingAuto
                        ? TEXT.auto_loading[lang]
                        : TEXT.auto_suggest[lang]}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalBtn,
                      {
                        flex: 1,
                        marginLeft: scale(8),
                        backgroundColor: theme.card,
                      },
                    ]}
                    onPress={handleRegenerateImage}
                    disabled={loadingAuto}
                  >
                    <Text style={{ color: theme.text }}>
                      {TEXT.regenerate_image[lang]}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={{ alignItems: "center", marginBottom: scale(8) }}>
                  <View pointerEvents="none">
                    <Image
                      source={
                        imgPreview || newCard.image
                          ? { uri: imgPreview || newCard.image }
                          : fallbackImage
                      }
                      style={{
                        width: scale(120),
                        height: scale(120),
                        borderRadius: scale(12),
                        marginBottom: scale(8),
                        backgroundColor: "#eee",
                      }}
                      resizeMode="cover"
                      onError={() => setImgPreview("")}
                    />
                  </View>
                  <Text
                    style={{
                      color: theme.subText || "#aaa",
                      fontSize: scale(13),
                    }}
                  >
                    {TEXT.illustration_hint[lang]}
                  </Text>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.card,
                      color: theme.text,
                      borderColor: theme.card,
                    },
                  ]}
                  placeholder={TEXT.card_phonetic[lang]}
                  placeholderTextColor={theme.subText || "#888"}
                  value={newCard.phonetic}
                  onChangeText={(t) =>
                    setNewCard((c) => ({ ...c, phonetic: t }))
                  }
                  returnKeyType="next"
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
                  placeholder={TEXT.card_pos[lang]}
                  placeholderTextColor={theme.subText || "#888"}
                  value={newCard.partOfSpeech}
                  onChangeText={(t) =>
                    setNewCard((c) => ({ ...c, partOfSpeech: t }))
                  }
                  returnKeyType="next"
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
                  placeholder={TEXT.card_back[lang]}
                  placeholderTextColor={theme.subText || "#888"}
                  value={newCard.back}
                  onChangeText={(t) => setNewCard((c) => ({ ...c, back: t }))}
                  returnKeyType="next"
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
                  placeholder={TEXT.card_example[lang]}
                  placeholderTextColor={theme.subText || "#888"}
                  value={newCard.example}
                  onChangeText={(t) =>
                    setNewCard((c) => ({ ...c, example: t }))
                  }
                  returnKeyType="next"
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
                  placeholder={TEXT.card_image[lang]}
                  placeholderTextColor={theme.subText || "#888"}
                  value={newCard.image}
                  onChangeText={(t) => setNewCard((c) => ({ ...c, image: t }))}
                  returnKeyType="done"
                />
                <View
                  style={{ flexDirection: "row", justifyContent: "flex-end" }}
                >
                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: theme.card }]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={{ color: theme.text }}>
                      {TEXT.cancel[lang]}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalBtn,
                      { backgroundColor: theme.primary },
                    ]}
                    onPress={handleAddCard}
                    disabled={loadingAuto}
                  >
                    <Text style={{ color: "#fff" }}>{TEXT.add[lang]}</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal visible={!!editCard} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: theme.section }]}
          >
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {TEXT.edit_card_title[lang]}
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
              placeholder={TEXT.card_front[lang]}
              placeholderTextColor={theme.subText || "#888"}
              value={editCard?.front_text || ""}
              onChangeText={(t) =>
                setEditCard((c: any) => c && { ...c, front_text: t })
              }
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
              placeholder={TEXT.card_phonetic[lang]}
              placeholderTextColor={theme.subText || "#888"}
              value={editCard?.phonetic || ""}
              onChangeText={(t) =>
                setEditCard((c: any) => c && { ...c, phonetic: t })
              }
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
              placeholder={TEXT.card_pos[lang]}
              placeholderTextColor={theme.subText || "#888"}
              value={editCard?.part_of_speech || ""}
              onChangeText={(t) =>
                setEditCard((c: any) => c && { ...c, part_of_speech: t })
              }
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
              placeholder={TEXT.card_back[lang]}
              placeholderTextColor={theme.subText || "#888"}
              value={editCard?.back_text || ""}
              onChangeText={(t) =>
                setEditCard((c: any) => c && { ...c, back_text: t })
              }
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
              placeholder={TEXT.card_example[lang]}
              placeholderTextColor={theme.subText || "#888"}
              value={editCard?.example || ""}
              onChangeText={(t) =>
                setEditCard((c: any) => c && { ...c, example: t })
              }
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
              placeholder={TEXT.card_image[lang]}
              placeholderTextColor={theme.subText || "#888"}
              value={editCard?.image_url || ""}
              onChangeText={(t) =>
                setEditCard((c: any) => c && { ...c, image_url: t })
              }
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.card }]}
                onPress={() => setEditCard(null)}
              >
                <Text style={{ color: theme.text }}>{TEXT.cancel[lang]}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.primary }]}
                onPress={handleSaveEditCard}
              >
                <Text style={{ color: "#fff" }}>{TEXT.save[lang]}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={editSet} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: theme.section }]}
          >
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {TEXT.edit_set_modal_title[lang]}
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
              placeholder={TEXT.set_name[lang]}
              placeholderTextColor={theme.subText || "#888"}
              value={editName}
              onChangeText={setEditName}
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
              placeholder={TEXT.set_desc[lang]}
              placeholderTextColor={theme.subText || "#888"}
              value={editDesc}
              onChangeText={setEditDesc}
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.card }]}
                onPress={() => setEditSet(false)}
              >
                <Text style={{ color: theme.text }}>{TEXT.cancel[lang]}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.primary }]}
                onPress={handleSaveSetInfo}
              >
                <Text style={{ color: "#fff" }}>{TEXT.save[lang]}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBox: {
    paddingTop: scale(80),
    paddingBottom: scale(24),
    paddingHorizontal: scale(18),
    alignItems: "flex-start",
    position: "relative",
    marginBottom: 0,
  },
  backBtn: {
    position: "absolute",
    left: scale(18),
    top: scale(48),
    zIndex: 99,
    borderRadius: scale(16),
    padding: scale(4),
  },
  headerTitle: {
    fontSize: scale(25),
    fontWeight: "700",
    marginTop: scale(6),
    marginBottom: scale(12),
    maxWidth: "75%",
    marginLeft: 0,
  },
  headerImage: {
    width: SCREEN_WIDTH * 0.29,
    height: SCREEN_WIDTH * 0.29,
    position: "absolute",
    right: scale(8),
    top: scale(42),
    resizeMode: "contain",
    borderRadius: scale(14),
    borderWidth: 2,
  },
  contentBox: {
    marginTop: scale(-10),
    borderTopLeftRadius: scale(32),
    borderTopRightRadius: scale(32),
    padding: scale(22),
    flex: 1,
  },
  cardSetTitle: {
    fontSize: scale(22),
    fontWeight: "bold",
    marginBottom: scale(2),
    flexWrap: "wrap",
  },
  subInfo: {
    marginBottom: scale(10),
    fontSize: scale(15),
  },
  sectionTitle: {
    fontSize: scale(17),
    fontWeight: "700",
    marginTop: scale(8),
    marginBottom: scale(5),
  },
  description: {
    fontSize: scale(15),
    marginBottom: scale(12),
    lineHeight: scale(22),
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: scale(10),
    marginBottom: scale(5),
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: scale(12),
    paddingVertical: scale(6),
    paddingHorizontal: scale(14),
  },
  flashCardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: scale(14),
    marginBottom: scale(12),
    padding: scale(14),
    shadowOpacity: 0.06,
    shadowRadius: scale(3),
    elevation: 1,
  },
  flashCardFront: { fontSize: scale(16), fontWeight: "bold" },
  cardPOS: { fontWeight: "normal", color: "#444", fontSize: scale(15) },
  cardPhonetic: { fontWeight: "normal", color: "#888", fontSize: scale(15) },
  flashCardBack: { fontSize: scale(16), marginTop: scale(2) },
  flashCardExample: { fontSize: scale(13), marginTop: scale(5) },
  iconBtn: {
    padding: scale(7),
    marginLeft: scale(8),
    borderRadius: scale(7),
    borderWidth: 1,
  },
  bottomBar: {
    flexDirection: "row",
    borderTopLeftRadius: scale(18),
    borderTopRightRadius: scale(18),
    padding: scale(14),
    paddingBottom: scale(28),
    shadowOpacity: 0.06,
    shadowRadius: scale(6),
    elevation: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  favBtn: {
    padding: scale(14),
    borderRadius: scale(16),
    marginRight: scale(12),
  },
  buyBtn: {
    flex: 1,
    borderRadius: scale(16),
    paddingVertical: scale(16),
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: scale(4),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(40,40,50,0.22)",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: scale(18),
    padding: scale(22),
    width: "92%",
    maxWidth: scale(420),
    alignSelf: "center",
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
    alignItems: "center",
  },
});
