import React, { useState } from "react";
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
} from "react-native";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";

// Ảnh mặc định
const fallbackImage = require("../../assets/images/avatar.png");

const initialCardSet = {
  id: "1",
  name: "IELTS Vocabulary Mastery",
  price: 0,
  isOwner: true,
  cover: fallbackImage,
  description:
    "Bộ flashcard giúp bạn hệ thống toàn bộ từ vựng IELTS, chia chủ đề dễ học, kèm mẹo ghi nhớ và ví dụ thực tế.",
  totalCards: 5,
  cards: [
    {
      id: "1",
      front: "abandon",
      back: "từ bỏ",
      example: "She abandoned the project.",
      phonetic: "/əˈbæn.dən/",
      partOfSpeech: "verb",
      image: "",
    },
    {
      id: "2",
      front: "benefit",
      back: "lợi ích",
      example: "There are many benefits to exercise.",
      phonetic: "/ˈben.ɪ.fɪt/",
      partOfSpeech: "noun",
      image: "",
    },
    {
      id: "3",
      front: "cautious",
      back: "thận trọng",
      example: "He is cautious when investing.",
      phonetic: "/ˈkɔː.ʃəs/",
      partOfSpeech: "adjective",
      image: "",
    },
    {
      id: "4",
      front: "demand",
      back: "nhu cầu",
      example: "There is a high demand for nurses.",
      phonetic: "/dɪˈmɑːnd/",
      partOfSpeech: "noun",
      image: "",
    },
    {
      id: "5",
      front: "efficient",
      back: "hiệu quả",
      example: "The new system is more efficient.",
      phonetic: "/ɪˈfɪʃ.ənt/",
      partOfSpeech: "adjective",
      image: "",
    },
  ],
  topics: [
    { name: "Education", total: 2, unlocked: true },
    { name: "Environment", total: 1, unlocked: true },
    { name: "Health", total: 2, unlocked: true },
  ],
};

const { width } = Dimensions.get("window");

// Lấy phiên âm, từ loại, nghĩa, ví dụ từ API
async function fetchWordData(word: string) {
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
        word,
      )}`,
    );
    const data = await res.json();
    let phonetic = "",
      partOfSpeech = "",
      example = "",
      audio = "";
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
      audio = data[0].phonetics?.find((p: any) => p.audio)?.audio || "";
    }
    let viMeaning = "";
    try {
      const resVi = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/vi/${encodeURIComponent(
          word,
        )}`,
      );
      const dataVi = await resVi.json();
      if (
        Array.isArray(dataVi) &&
        dataVi[0]?.meanings?.[0]?.definitions?.[0]?.definition
      ) {
        viMeaning = dataVi[0].meanings[0].definitions[0].definition;
      }
    } catch {}
    return {
      phonetic,
      partOfSpeech,
      audio,
      example,
      viMeaning,
    };
  } catch {
    return {};
  }
}

// Lấy ảnh minh họa Pixabay (random trong 3 ảnh đầu)
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
  const navigation = useNavigation<any>(); // Type any để không lỗi TS
  const [cardSet, setCardSet] = useState(initialCardSet);
  const [editSet, setEditSet] = useState(false);
  const [editCard, setEditCard] = useState<null | (typeof cardSet.cards)[0]>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);

  // Trạng thái form thêm thẻ mới
  const [newCard, setNewCard] = useState({
    front: "",
    back: "",
    example: "",
    phonetic: "",
    partOfSpeech: "",
    image: "",
  });
  const [loadingAuto, setLoadingAuto] = useState(false);
  const [imgPreview, setImgPreview] = useState("");

  // Edit bộ thẻ
  const [editName, setEditName] = useState(cardSet.name);
  const [editDesc, setEditDesc] = useState(cardSet.description);

  // Bulk import state
  const [importing, setImporting] = useState(false);

  const isOwner = cardSet.isOwner;

  // Xử lý import file từ trong modal
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
      let cards: any[] = [];
      if (name.endsWith(".json")) {
        cards = JSON.parse(content);
      } else {
        cards = content
          .split(/\r?\n/)
          .map((line) => {
            if (!line.trim()) return null;
            const [front, back, example, phonetic, partOfSpeech, image] =
              line.split(",");
            return front && back
              ? { front, back, example, phonetic, partOfSpeech, image }
              : null;
          })
          .filter(Boolean);
      }
      if (!cards.length) {
        Alert.alert("Không có dữ liệu hợp lệ trong file!");
        setImporting(false);
        return;
      }
      const newCards = cards.map((card) => ({
        ...card,
        id: (Math.random() * 100000).toFixed(0),
      }));
      setCardSet((prev) => ({
        ...prev,
        cards: [...prev.cards, ...newCards],
        totalCards: prev.totalCards + newCards.length,
      }));
      setModalVisible(false);
      Alert.alert(`Đã nhập thành công ${newCards.length} thẻ!`);
    } catch (err) {
      Alert.alert("Có lỗi khi đọc file hoặc định dạng không đúng!");
    }
    setImporting(false);
  }

  function handleDeleteCard(cardId: string) {
    Alert.alert("Xóa thẻ?", "Bạn có chắc muốn xóa thẻ này?", [
      { text: "Hủy" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => {
          setCardSet((prev) => ({
            ...prev,
            cards: prev.cards.filter((c) => c.id !== cardId),
            totalCards: prev.totalCards - 1,
          }));
        },
      },
    ]);
  }

  function handleSaveEditCard() {
    if (!editCard) return;
    setCardSet((prev) => ({
      ...prev,
      cards: prev.cards.map((c) => (c.id === editCard.id ? editCard : c)),
    }));
    setEditCard(null);
  }

  async function handleAddCard() {
    if (!newCard.front.trim() || !newCard.back.trim()) {
      Alert.alert(
        "Thiếu thông tin",
        "Mặt trước và mặt sau không được để trống",
      );
      return;
    }
    setCardSet((prev) => ({
      ...prev,
      cards: [
        ...prev.cards,
        {
          ...newCard,
          id: (Math.random() * 100000).toFixed(0),
        },
      ],
      totalCards: prev.totalCards + 1,
    }));
    setNewCard({
      front: "",
      back: "",
      example: "",
      phonetic: "",
      partOfSpeech: "",
      image: "",
    });
    setImgPreview("");
    setModalVisible(false);
    setLoadingAuto(false);
  }

  function handleSaveSetInfo() {
    setCardSet((prev) => ({
      ...prev,
      name: editName,
      description: editDesc,
    }));
    setEditSet(false);
  }

  // Tự động điền phiên âm, từ loại, nghĩa, ví dụ, ảnh
  async function handleAutoFill() {
    if (!newCard.front.trim()) {
      Alert.alert("Nhập từ vựng trước đã!");
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

  // Lấy lại ảnh ngẫu nhiên
  async function handleRegenerateImage() {
    if (!newCard.front.trim()) {
      Alert.alert("Nhập từ vựng trước đã!");
      return;
    }
    setLoadingAuto(true);
    const img = await fetchPixabayImage(newCard.front.trim());
    setNewCard((prev) => ({ ...prev, image: img || "" }));
    setImgPreview(img || "");
    setLoadingAuto(false);
  }

  // Khi user gõ link ảnh thủ công thì preview cũng thay đổi
  function handleImageInput(t: string) {
    setNewCard((c) => ({ ...c, image: t }));
    setImgPreview(t);
  }

  const renderHeader = () => (
    <View>
      <Text style={styles.cardSetTitle}>{cardSet.name}</Text>
      <Text style={styles.subInfo}>{cardSet.totalCards} thẻ</Text>
      <Text style={styles.sectionTitle}>Mô tả bộ thẻ</Text>
      <Text style={styles.description}>{cardSet.description}</Text>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>
          Danh sách thẻ ({cardSet.totalCards})
        </Text>
        {isOwner && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={22} color="#fff" />
            <Text style={{ color: "#fff", marginLeft: 4, fontWeight: "bold" }}>
              Thêm thẻ
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {/* Chủ đề */}
      <Text style={styles.sectionTitle}>Chủ đề</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 24 }}
      >
        {cardSet.topics.map((topic, idx) => (
          <View style={styles.topicChip} key={topic.name}>
            <Ionicons
              name={topic.unlocked ? "lock-open" : "lock-closed"}
              size={16}
              color={topic.unlocked ? "#2C4BFF" : "#bfc8d6"}
            />
            <Text style={styles.topicChipText}>
              {topic.name} ({topic.total})
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header Flashcard Info */}
      <View style={styles.headerBox}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{cardSet.name}</Text>
        <Image source={cardSet.cover} style={styles.headerImage} />
        {isOwner && (
          <View
            style={{
              flexDirection: "row",
              position: "absolute",
              right: 18,
              top: 48,
              zIndex: 99,
            }}
          ></View>
        )}
      </View>
      {/* Danh sách thẻ */}
      <FlatList
        data={cardSet.cards}
        keyExtractor={(item) => item.id}
        style={styles.contentBox}
        ListHeaderComponent={renderHeader()}
        renderItem={({ item }) => (
          <View style={styles.flashCardRow}>
            {/* Ảnh bên trái */}
            <View style={{ alignItems: "center", marginRight: 14 }}>
              <View pointerEvents="none">
                <Image
                  source={item.image ? { uri: item.image } : fallbackImage}
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: 10,
                    backgroundColor: "#eee",
                  }}
                  resizeMode="cover"
                />
              </View>
              <Text style={{ color: "#aaa", fontSize: 12, marginTop: 2 }}>
                Ảnh minh họa
              </Text>
            </View>
            {/* Nội dung bên phải */}
            <View style={{ flex: 1 }}>
              <Text style={styles.flashCardFront}>
                {item.front}{" "}
                {item.partOfSpeech ? (
                  <Text style={styles.cardPOS}>({item.partOfSpeech})</Text>
                ) : null}
                {item.phonetic ? (
                  <Text style={styles.cardPhonetic}> {item.phonetic}</Text>
                ) : null}
              </Text>
              <Text style={styles.flashCardBack}>{item.back}</Text>
              {item.example ? (
                <Text style={styles.flashCardExample}>
                  <Ionicons name="bulb" size={13} color="#FFD600" />{" "}
                  <Text style={{ color: "#888" }}>{item.example}</Text>
                </Text>
              ) : null}
              {isOwner && (
                <View style={{ flexDirection: "row", marginTop: 8 }}>
                  <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => setEditCard({ ...item })}
                  >
                    <Feather name="edit-2" size={18} color="#2C4BFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => handleDeleteCard(item.id)}
                  >
                    <Feather name="trash-2" size={18} color="#e74c3c" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: "#bbb", textAlign: "center", marginTop: 30 }}>
            Bộ thẻ này chưa có thẻ nào
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      {/* Thanh action dưới cùng */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.favBtn}>
          <MaterialIcons name="star-border" size={28} color="#FF7F00" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buyBtn}
          onPress={() => navigation.navigate("Study" as never)}
        >
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
            Học
          </Text>
        </TouchableOpacity>
        {isOwner && (
          <TouchableOpacity
            style={[
              styles.buyBtn,
              { marginLeft: 8, backgroundColor: "#BFC8D6" },
            ]}
            onPress={() => setEditSet(true)}
          >
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
              Chỉnh sửa bộ thẻ
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal thêm thẻ mới */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.centeredModalWrapper}
            keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={[styles.modalContent, { marginTop: 70, marginBottom: 30 }]}
            >
              <ScrollView
                contentContainerStyle={{ paddingBottom: 12, paddingTop: 16 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 500 }}
              >
                <Text style={styles.modalTitle}>Thêm thẻ mới</Text>
                {/* Lựa chọn thêm từng thẻ hoặc hàng loạt */}
                <View style={{ flexDirection: "row", marginBottom: 12 }}>
                  <TouchableOpacity
                    style={[
                      styles.modalBtn,
                      { flex: 1, backgroundColor: "#2C4BFF" },
                    ]}
                    disabled={true}
                  >
                    <Text style={{ color: "#fff", textAlign: "center" }}>
                      Nhập thủ công
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalBtn,
                      {
                        flex: 1,
                        backgroundColor: "#fff",
                        marginLeft: 8,
                        borderWidth: 1,
                        borderColor: "#2C4BFF",
                      },
                    ]}
                    disabled={importing}
                    onPress={handleBulkImportFromModal}
                  >
                    <Text style={{ color: "#2C4BFF", textAlign: "center" }}>
                      Nhập hàng loạt từ file
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={{ color: "#888", fontSize: 13, marginBottom: 8 }}>
                  {importing
                    ? "Đang nhập file..."
                    : "Bạn có thể chọn nhập từng thẻ hoặc nhập hàng loạt từ file CSV/JSON"}
                </Text>
                {/* Form thêm từng thẻ thủ công */}
                <TextInput
                  style={styles.input}
                  placeholder="Mặt trước (từ/cụm từ)"
                  value={newCard.front}
                  onChangeText={(t) => setNewCard((c) => ({ ...c, front: t }))}
                  returnKeyType="next"
                />
                <View style={{ flexDirection: "row", marginBottom: 8 }}>
                  <TouchableOpacity
                    style={[styles.modalBtn, { flex: 1 }]}
                    onPress={handleAutoFill}
                    disabled={loadingAuto}
                  >
                    <Text>
                      {loadingAuto ? "Đang lấy dữ liệu..." : "Tự động gợi ý"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, { flex: 1, marginLeft: 8 }]}
                    onPress={handleRegenerateImage}
                    disabled={loadingAuto}
                  >
                    <Text>Tạo lại ảnh khác</Text>
                  </TouchableOpacity>
                </View>
                {/* Preview ảnh minh họa */}
                <View style={{ alignItems: "center", marginBottom: 8 }}>
                  <View pointerEvents="none">
                    <Image
                      source={
                        imgPreview || newCard.image
                          ? { uri: imgPreview || newCard.image }
                          : fallbackImage
                      }
                      style={{
                        width: 120,
                        height: 120,
                        borderRadius: 12,
                        marginBottom: 8,
                        backgroundColor: "#eee",
                      }}
                      resizeMode="cover"
                      onError={() => setImgPreview("")}
                    />
                  </View>
                  <Text style={{ color: "#aaa", fontSize: 13 }}>
                    Ảnh minh họa (có thể sửa hoặc tạo lại)
                  </Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Phiên âm (có thể tự nhập hoặc để trống)"
                  value={newCard.phonetic}
                  onChangeText={(t) =>
                    setNewCard((c) => ({ ...c, phonetic: t }))
                  }
                  returnKeyType="next"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Từ loại (danh từ, động từ...)"
                  value={newCard.partOfSpeech}
                  onChangeText={(t) =>
                    setNewCard((c) => ({ ...c, partOfSpeech: t }))
                  }
                  returnKeyType="next"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Mặt sau (nghĩa/giải thích)"
                  value={newCard.back}
                  onChangeText={(t) => setNewCard((c) => ({ ...c, back: t }))}
                  returnKeyType="next"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ (không bắt buộc)"
                  value={newCard.example}
                  onChangeText={(t) =>
                    setNewCard((c) => ({ ...c, example: t }))
                  }
                  returnKeyType="next"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Link ảnh (tùy chọn, nếu không có sẽ dùng ảnh gợi ý hoặc mặc định)"
                  value={newCard.image}
                  onChangeText={handleImageInput}
                  returnKeyType="done"
                />
                <View
                  style={{ flexDirection: "row", justifyContent: "flex-end" }}
                >
                  <TouchableOpacity
                    style={styles.modalBtn}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: "#2C4BFF" }]}
                    onPress={handleAddCard}
                    disabled={loadingAuto}
                  >
                    <Text style={{ color: "#fff" }}>Thêm</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Modal sửa thẻ */}
      <Modal visible={!!editCard} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sửa thẻ</Text>
            <TextInput
              style={styles.input}
              placeholder="Mặt trước"
              value={editCard?.front || ""}
              onChangeText={(t) => setEditCard((c) => c && { ...c, front: t })}
            />
            <TextInput
              style={styles.input}
              placeholder="Phiên âm"
              value={editCard?.phonetic || ""}
              onChangeText={(t) =>
                setEditCard((c) => c && { ...c, phonetic: t })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Từ loại"
              value={editCard?.partOfSpeech || ""}
              onChangeText={(t) =>
                setEditCard((c) => c && { ...c, partOfSpeech: t })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Mặt sau"
              value={editCard?.back || ""}
              onChangeText={(t) => setEditCard((c) => c && { ...c, back: t })}
            />
            <TextInput
              style={styles.input}
              placeholder="Ví dụ"
              value={editCard?.example || ""}
              onChangeText={(t) =>
                setEditCard((c) => c && { ...c, example: t })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Link ảnh"
              value={editCard?.image || ""}
              onChangeText={(t) => setEditCard((c) => c && { ...c, image: t })}
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={() => setEditCard(null)}
              >
                <Text>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#2C4BFF" }]}
                onPress={handleSaveEditCard}
              >
                <Text style={{ color: "#fff" }}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal sửa bộ thẻ */}
      <Modal visible={editSet} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chỉnh sửa bộ thẻ</Text>
            <TextInput
              style={styles.input}
              placeholder="Tên bộ thẻ"
              value={editName}
              onChangeText={setEditName}
            />
            <TextInput
              style={styles.input}
              placeholder="Mô tả bộ thẻ"
              value={editDesc}
              onChangeText={setEditDesc}
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={() => setEditSet(false)}
              >
                <Text>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#2C4BFF" }]}
                onPress={handleSaveSetInfo}
              >
                <Text style={{ color: "#fff" }}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerBox: {
    backgroundColor: "#FFEFF6",
    paddingTop: 80,
    paddingBottom: 24,
    paddingHorizontal: 18,
    alignItems: "flex-start",
    position: "relative",
    marginBottom: 0,
  },
  backBtn: {
    position: "absolute",
    left: 18,
    top: 48,
    zIndex: 99,
    borderRadius: 16,
    padding: 4,
  },
  editSetBtn: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: "#eee",
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: "700",
    color: "#2C2C2C",
    marginTop: 6,
    marginBottom: 12,
    maxWidth: "75%",
    marginLeft: 0,
  },
  headerImage: {
    width: width * 0.29,
    height: width * 0.29,
    position: "absolute",
    right: 8,
    top: 42,
    resizeMode: "contain",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#fff",
  },
  contentBox: {
    backgroundColor: "#fff",
    marginTop: -10,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 22,
    flex: 1,
  },
  cardSetTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 2,
    flexWrap: "wrap",
  },
  subInfo: {
    color: "#BFC8D6",
    marginBottom: 10,
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 5,
    color: "#232323",
  },
  description: {
    color: "#444",
    fontSize: 15,
    marginBottom: 12,
    lineHeight: 22,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 5,
  },
  addBtn: {
    backgroundColor: "#2C4BFF",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  flashCardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F7F8FB",
    borderRadius: 14,
    marginBottom: 12,
    padding: 14,
    shadowColor: "#BFC8D6",
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  flashCardFront: { fontSize: 16, fontWeight: "bold", color: "#2C4BFF" },
  cardPOS: { fontWeight: "normal", color: "#444", fontSize: 15 },
  cardPhonetic: { fontWeight: "normal", color: "#888", fontSize: 15 },
  flashCardBack: { fontSize: 16, color: "#222", marginTop: 2 },
  flashCardExample: { fontSize: 13, color: "#888", marginTop: 5 },
  iconBtn: {
    padding: 7,
    marginLeft: 8,
    borderRadius: 7,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#F3F3F7",
  },
  topicChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F4FB",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginTop: 2,
    marginBottom: 8,
  },
  topicChipText: { color: "#232323", fontWeight: "600", marginLeft: 6 },
  bottomBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 14,
    paddingBottom: 28,
    shadowColor: "#222",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  favBtn: {
    backgroundColor: "#FFEFF6",
    padding: 14,
    borderRadius: 16,
    marginRight: 12,
  },
  buyBtn: {
    flex: 1,
    backgroundColor: "#2C4BFF",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
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
  centeredModalWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 22,
    width: "92%",
    maxWidth: 420,
    alignSelf: "center",
    shadowColor: "#222",
    shadowOpacity: 0.11,
    shadowRadius: 10,
    elevation: 5,
    maxHeight: 520,
  },
  modalTitle: { fontSize: 19, fontWeight: "700", marginBottom: 12 },
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
    alignItems: "center",
  },
});
