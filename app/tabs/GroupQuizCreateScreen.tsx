import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useRoute } from "@react-navigation/native";

const fallbackImage = require("../../assets/images/avatar.png");
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;

type Flashcard = {
  id: string;
  front: string;
  back: string;
  example: string;
  phonetic: string;
  partOfSpeech: string;
  image?: string;
};

type Quiz = {
  id: string;
  title: string;
  flashcards: Flashcard[];
  timeLimit: number;
  description: string;
  startTime?: Date;
  endTime?: Date;
  isPublic?: boolean;
};

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
    }
    const viMeaning = await translateToVietnamese(word);
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

export default function GroupQuizCreateScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [newCards, setNewCards] = useState<Flashcard[]>([]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState<Flashcard>({
    id: "",
    front: "",
    back: "",
    example: "",
    phonetic: "",
    partOfSpeech: "",
    image: "",
  });

  const [description, setDescription] = useState("");
  const [imgPreview, setImgPreview] = useState("");
  const [loadingAuto, setLoadingAuto] = useState(false);
  const [importing, setImporting] = useState(false);

  // New features
  const [timeLimit, setTimeLimit] = useState<number>(15); // in minutes

  const [startTime, setStartTime] = useState<Date | undefined>(undefined);
  const [endTime, setEndTime] = useState<Date | undefined>(undefined);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  function handleAddCardToQuiz() {
    if (!newCard.front.trim() || !newCard.back.trim()) {
      Alert.alert("Thiếu thông tin", "Phải nhập mặt trước và mặt sau!");
      return;
    }
    setNewCards((prev) => [
      ...prev,
      {
        ...newCard,
        id: (Math.random() * 100000).toFixed(0),
      },
    ]);
    setNewCard({
      id: "",
      front: "",
      back: "",
      example: "",
      phonetic: "",
      partOfSpeech: "",
      image: "",
    });
    setImgPreview("");
    setShowAddCard(false);
  }

  async function handleBulkImport() {
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
      const newCardsImported = cards.map((card) => ({
        ...card,
        id: (Math.random() * 100000).toFixed(0),
      }));
      setNewCards((prev) => [...prev, ...newCardsImported]);
      setShowAddCard(false);
      Alert.alert(`Đã nhập thành công ${newCardsImported.length} thẻ!`);
    } catch (err) {
      Alert.alert("Có lỗi khi đọc file hoặc định dạng không đúng!");
    }
    setImporting(false);
  }

  function handleSaveQuiz() {
    if (!newQuizTitle.trim() || newCards.length === 0) {
      Alert.alert("Nhập tên bài kiểm tra và ít nhất 1 thẻ!");
      return;
    }
    if (endTime && startTime && endTime <= startTime) {
      Alert.alert("Thời gian kết thúc phải sau thời gian bắt đầu");
      return;
    }
    const addQuiz = route.params?.addQuiz;
    if (addQuiz) {
      addQuiz({
        id: (Math.random() * 100000).toFixed(0),
        title: newQuizTitle,
        flashcards: newCards,
        description,
        timeLimit,
        startTime,
        endTime,
        isPublic,
      });
    }
    navigation.goBack();
  }

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons name="arrow-back" size={scale(24)} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Tạo bài kiểm tra</Text>
        <View style={{ width: scale(24) }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Tên bài kiểm tra</Text>
          <TextInput
            style={styles.input}
            placeholder="VD: Từ vựng chuyên đề 1"
            value={newQuizTitle}
            onChangeText={setNewQuizTitle}
          />

          <Text style={styles.label}>Mô tả bài kiểm tra</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập mô tả cho bài kiểm tra"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text style={styles.label}>Thời gian làm bài (phút)</Text>
          <TextInput
            style={[styles.input, { width: 110 }]}
            keyboardType="numeric"
            value={timeLimit.toString()}
            onChangeText={(t) => setTimeLimit(parseInt(t) || 0)}
            placeholder="VD: 15"
            maxLength={3}
          />

          <Text style={styles.label}>Thời gian mở bài kiểm tra</Text>
          <TouchableOpacity
            style={styles.timeBtn}
            onPress={() => setShowStartPicker(true)}
          >
            <Ionicons name="calendar-outline" size={18} color="#2C4BFF" />
            <Text style={styles.timeBtnText}>
              {startTime
                ? startTime.toLocaleString()
                : "Chọn thời gian bắt đầu"}
            </Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startTime || new Date()}
              mode="datetime"
              display="default"
              onChange={(_event: any, date?: Date) => {
                setShowStartPicker(false);
                if (date) setStartTime(date);
              }}
            />
          )}

          <Text style={styles.label}>Thời gian đóng bài kiểm tra</Text>
          <TouchableOpacity
            style={styles.timeBtn}
            onPress={() => setShowEndPicker(true)}
          >
            <Ionicons name="calendar-outline" size={18} color="#2C4BFF" />
            <Text style={styles.timeBtnText}>
              {endTime ? endTime.toLocaleString() : "Chọn thời gian kết thúc"}
            </Text>
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={endTime || new Date()}
              mode="datetime"
              display="default"
              onChange={(_event: any, date?: Date) => {
                setShowEndPicker(false);
                if (date) setEndTime(date);
              }}
            />
          )}

          <Text style={styles.label}>Công khai bài kiểm tra?</Text>
          <View style={{ flexDirection: "row", marginBottom: 14 }}>
            <TouchableOpacity
              style={[
                styles.publicBtn,
                isPublic && { backgroundColor: "#2C4BFF" },
              ]}
              onPress={() => setIsPublic(true)}
            >
              <Ionicons
                name={isPublic ? "checkmark-circle" : "ellipse-outline"}
                size={18}
                color={isPublic ? "#fff" : "#2C4BFF"}
              />
              <Text
                style={{ color: isPublic ? "#fff" : "#2C4BFF", marginLeft: 6 }}
              >
                Công khai
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.publicBtn,
                !isPublic && { backgroundColor: "#e74c3c" },
                { marginLeft: 14 },
              ]}
              onPress={() => setIsPublic(false)}
            >
              <Ionicons
                name={!isPublic ? "checkmark-circle" : "ellipse-outline"}
                size={18}
                color={!isPublic ? "#fff" : "#2C4BFF"}
              />
              <Text
                style={{ color: !isPublic ? "#fff" : "#2C4BFF", marginLeft: 6 }}
              >
                Chỉ quản trị viên
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Danh sách thẻ */}
        <View style={styles.section}>
          <Text style={styles.label}>Danh sách thẻ ({newCards.length})</Text>
          {newCards.length === 0 && (
            <Text style={{ color: "#aaa", marginBottom: scale(8) }}>
              Chưa có thẻ nào
            </Text>
          )}
          {newCards.map((card, idx) => (
            <View key={card.id} style={styles.cardListItem}>
              <Text style={styles.flashFront}>
                {idx + 1}. {card.front}
              </Text>
              <Text style={styles.flashBack}>
                ({card.partOfSpeech}) {card.back}
              </Text>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowAddCard(true)}
          >
            <Ionicons name="add" size={scale(20)} color="#fff" />
            <Text style={{ color: "#fff", marginLeft: 7, fontWeight: "bold" }}>
              Thêm thẻ mới
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleSaveQuiz}>
          <Ionicons name="save" size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>Lưu bài kiểm tra</Text>
        </TouchableOpacity>
      </ScrollView>
      {/* Modal thêm thẻ */}
      <Modal visible={showAddCard} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.centeredModalWrapper}
            keyboardVerticalOffset={Platform.OS === "ios" ? scale(40) : 0}
          >
            <View style={styles.modalContent}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>Thêm thẻ flashcard</Text>
                <View style={{ flexDirection: "row", marginBottom: scale(12) }}>
                  <TouchableOpacity
                    style={[
                      styles.modalBtn,
                      { flex: 1, backgroundColor: "#2C4BFF" },
                    ]}
                    disabled
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
                        marginLeft: scale(8),
                        borderWidth: 1,
                        borderColor: "#2C4BFF",
                      },
                    ]}
                    disabled={importing}
                    onPress={handleBulkImport}
                  >
                    <Text style={{ color: "#2C4BFF", textAlign: "center" }}>
                      Nhập hàng loạt từ file
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text
                  style={{
                    color: "#888",
                    fontSize: scale(13),
                    marginBottom: scale(8),
                  }}
                >
                  {importing
                    ? "Đang nhập file..."
                    : "Bạn có thể chọn nhập từng thẻ hoặc nhập hàng loạt từ file CSV/JSON"}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Từ/cụm từ (mặt trước)"
                  value={newCard.front}
                  onChangeText={(t) => setNewCard({ ...newCard, front: t })}
                />
                <View style={{ flexDirection: "row", marginBottom: scale(8) }}>
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
                    style={[styles.modalBtn, { flex: 1, marginLeft: scale(8) }]}
                    onPress={handleRegenerateImage}
                    disabled={loadingAuto}
                  >
                    <Text>Tạo lại ảnh khác</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ alignItems: "center", marginBottom: scale(8) }}>
                  <Image
                    source={
                      imgPreview || newCard.image
                        ? { uri: imgPreview || newCard.image }
                        : fallbackImage
                    }
                    style={{
                      width: scale(80),
                      height: scale(80),
                      borderRadius: scale(8),
                      backgroundColor: "#eee",
                    }}
                    resizeMode="cover"
                    onError={() => setImgPreview("")}
                  />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Phiên âm (nếu có)"
                  value={newCard.phonetic}
                  onChangeText={(t) => setNewCard({ ...newCard, phonetic: t })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Loại từ (danh từ, động từ...)"
                  value={newCard.partOfSpeech}
                  onChangeText={(t) =>
                    setNewCard({ ...newCard, partOfSpeech: t })
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nghĩa tiếng Việt (mặt sau)"
                  value={newCard.back}
                  onChangeText={(t) => setNewCard({ ...newCard, back: t })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ tiếng Anh"
                  value={newCard.example}
                  onChangeText={(t) => setNewCard({ ...newCard, example: t })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Link ảnh minh hoạ (nếu có)"
                  value={newCard.image}
                  onChangeText={(t) => {
                    setNewCard({ ...newCard, image: t });
                    setImgPreview(t);
                  }}
                />
                <View
                  style={{ flexDirection: "row", justifyContent: "flex-end" }}
                >
                  <TouchableOpacity
                    style={styles.modalBtn}
                    onPress={() => setShowAddCard(false)}
                  >
                    <Text>Huỷ</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: "#2C4BFF" }]}
                    onPress={handleAddCardToQuiz}
                    disabled={loadingAuto}
                  >
                    <Text style={{ color: "#fff" }}>Thêm</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9FC" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(14),
    paddingTop: scale(12),
    paddingBottom: scale(10),
    backgroundColor: "#fff",
    borderBottomWidth: 0.5,
    borderBottomColor: "#E4EAF2",
    justifyContent: "space-between",
  },
  title: {
    fontSize: scale(18),
    fontWeight: "bold",
    color: "#2C4BFF",
    flex: 1,
    textAlign: "center",
    marginLeft: scale(-24),
    marginRight: scale(-24),
  },
  content: { padding: scale(14), paddingBottom: scale(36) },
  section: { marginBottom: scale(18) },
  label: {
    fontWeight: "bold",
    color: "#3B5EFF",
    fontSize: scale(15),
    marginBottom: scale(7),
  },
  cardListItem: {
    backgroundColor: "#F7F8FB",
    borderRadius: scale(8),
    padding: scale(9),
    marginBottom: scale(6),
  },
  flashFront: { fontWeight: "bold", color: "#2C4BFF", fontSize: scale(15) },
  flashBack: { fontWeight: "500", color: "#333", fontSize: scale(15) },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C4BFF",
    borderRadius: scale(10),
    paddingVertical: scale(10),
    paddingHorizontal: scale(16),
    alignSelf: "flex-start",
    marginTop: scale(6),
  },
  primaryBtn: {
    flexDirection: "row",
    backgroundColor: "#2C4BFF",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 11,
    paddingVertical: scale(13),
    marginTop: scale(16),
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: scale(16),
    marginLeft: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E4EAF2",
    borderRadius: scale(8),
    padding: scale(10),
    marginBottom: scale(10),
    backgroundColor: "#F7F9FC",
    fontSize: scale(15),
  },
  timeBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6ECFF",
    borderRadius: scale(8),
    paddingVertical: scale(8),
    paddingHorizontal: scale(10),
    marginBottom: scale(7),
  },
  timeBtnText: { marginLeft: 8, color: "#2C4BFF", fontSize: scale(15) },
  publicBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: scale(10),
    borderWidth: 1,
    borderColor: "#2C4BFF",
    paddingVertical: scale(7),
    paddingHorizontal: scale(14),
    backgroundColor: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.13)",
    justifyContent: "center",
    alignItems: "center",
  },
  centeredModalWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: scale(18),
    padding: scale(22),
    width: "92%",
    maxWidth: scale(420),
    alignSelf: "center",
    shadowColor: "#222",
    shadowOpacity: 0.11,
    shadowRadius: scale(10),
    elevation: 5,
    maxHeight: scale(520),
  },
  modalTitle: {
    fontSize: scale(18),
    fontWeight: "700",
    marginBottom: scale(10),
    color: "#2C4BFF",
    textAlign: "center",
  },
  modalBtn: {
    paddingHorizontal: scale(20),
    paddingVertical: scale(10),
    borderRadius: scale(8),
    marginLeft: scale(10),
    backgroundColor: "#F4F4FB",
    marginTop: scale(6),
    alignItems: "center",
  },
});
