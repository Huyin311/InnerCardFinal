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
} from "react-native";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as Speech from "expo-speech";

// Giả lập dữ liệu flashcard
const initialCardSet = {
  id: "1",
  name: "IELTS Vocabulary Mastery",
  price: 0,
  isOwner: true,
  cover: require("../../assets/images/avatar.png"),
  description:
    "Bộ flashcard giúp bạn hệ thống toàn bộ từ vựng IELTS, chia chủ đề dễ học, kèm mẹo ghi nhớ và ví dụ thực tế.",
  totalCards: 5,
  cards: [
    {
      id: "1",
      front: "abandon",
      back: "từ bỏ",
      example: "She abandoned the project.",
    },
    {
      id: "2",
      front: "benefit",
      back: "lợi ích",
      example: "There are many benefits to exercise.",
    },
    {
      id: "3",
      front: "cautious",
      back: "thận trọng",
      example: "He is cautious when investing.",
    },
    {
      id: "4",
      front: "demand",
      back: "nhu cầu",
      example: "There is a high demand for nurses.",
    },
    {
      id: "5",
      front: "efficient",
      back: "hiệu quả",
      example: "The new system is more efficient.",
    },
  ],
  topics: [
    { name: "Education", total: 2, unlocked: true },
    { name: "Environment", total: 1, unlocked: true },
    { name: "Health", total: 2, unlocked: true },
  ],
};

const { width } = Dimensions.get("window");

export default function CardDetail() {
  const navigation = useNavigation();
  const [cardSet, setCardSet] = useState(initialCardSet);
  const [editSet, setEditSet] = useState(false);
  const [editCard, setEditCard] = useState<null | (typeof cardSet.cards)[0]>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [newCard, setNewCard] = useState({ front: "", back: "", example: "" });

  // Edit bộ thẻ
  const [editName, setEditName] = useState(cardSet.name);
  const [editDesc, setEditDesc] = useState(cardSet.description);

  const isOwner = cardSet.isOwner;

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

  function handleAddCard() {
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
    setNewCard({ front: "", back: "", example: "" });
    setModalVisible(false);
  }

  function handleSaveSetInfo() {
    setCardSet((prev) => ({
      ...prev,
      name: editName,
      description: editDesc,
    }));
    setEditSet(false);
  }

  // Header gồm mô tả, chủ đề, thêm thẻ (nếu là owner)
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
          <TouchableOpacity
            style={styles.editSetBtn}
            onPress={() => setEditSet(true)}
          >
            <Feather name="edit" size={22} color="#2C4BFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Danh sách thẻ (không bọc trong ScrollView!) */}
      <FlatList
        data={cardSet.cards}
        keyExtractor={(item) => item.id}
        style={styles.contentBox}
        ListHeaderComponent={renderHeader()}
        renderItem={({ item }) => (
          <View style={styles.flashCardRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.flashCardFront}>{item.front}</Text>
              <Text style={styles.flashCardBack}>{item.back}</Text>
              {item.example ? (
                <Text style={styles.flashCardExample}>
                  <Ionicons name="bulb" size={13} color="#FFD600" />{" "}
                  <Text style={{ color: "#888" }}>{item.example}</Text>
                </Text>
              ) : null}
            </View>
            {isOwner && (
              <View style={{ flexDirection: "row" }}>
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
        {isOwner ? (
          <TouchableOpacity
            style={styles.buyBtn}
            onPress={() => setEditSet(true)}
          >
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
              Chỉnh sửa bộ thẻ
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.buyBtn}>
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
              Học ngay
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal thêm thẻ mới */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm thẻ mới</Text>
            <TextInput
              style={styles.input}
              placeholder="Mặt trước (từ/cụm từ)"
              value={newCard.front}
              onChangeText={(t) => setNewCard((c) => ({ ...c, front: t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Mặt sau (nghĩa/giải thích)"
              value={newCard.back}
              onChangeText={(t) => setNewCard((c) => ({ ...c, back: t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Ví dụ (không bắt buộc)"
              value={newCard.example}
              onChangeText={(t) => setNewCard((c) => ({ ...c, example: t }))}
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#2C4BFF" }]}
                onPress={handleAddCard}
              >
                <Text style={{ color: "#fff" }}>Thêm</Text>
              </TouchableOpacity>
            </View>
          </View>
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
              value={editCard?.front}
              onChangeText={(t) => setEditCard((c) => c && { ...c, front: t })}
            />
            <TextInput
              style={styles.input}
              placeholder="Mặt sau"
              value={editCard?.back}
              onChangeText={(t) => setEditCard((c) => c && { ...c, back: t })}
            />
            <TextInput
              style={styles.input}
              placeholder="Ví dụ"
              value={editCard?.example}
              onChangeText={(t) =>
                setEditCard((c) => c && { ...c, example: t })
              }
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
    position: "absolute",
    right: 18,
    top: 48,
    zIndex: 99,
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
  },
  // Modal & input
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(40,40,50,0.22)",
    justifyContent: "center",
    alignItems: "center",
  },
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
  },
});
