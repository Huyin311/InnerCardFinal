import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Responsive helpers
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;

// Giả lập dữ liệu thông báo nhóm (ban đầu)
const initialAnnouncements = [
  {
    id: "a1",
    title: "Lịch họp tuần này",
    content:
      "Nhóm sẽ họp vào 20:00 tối Chủ nhật, các bạn nhớ tham gia đúng giờ!",
    createdAt: new Date("2025-06-16T10:00:00"),
    author: "Huy Nguyen",
  },
  {
    id: "a2",
    title: "Tài liệu mới đã được cập nhật",
    content:
      "File PDF đề thi thử IELTS 2025 đã được thêm vào thư mục Tài liệu.",
    createdAt: new Date("2025-06-15T16:30:00"),
    author: "Lan Pham",
  },
  {
    id: "a3",
    title: "Chào mừng thành viên mới",
    content:
      "Chúng ta vừa kết nạp thêm 3 thành viên mới! Hãy cùng chào đón các bạn nhé.",
    createdAt: new Date("2025-06-14T08:15:00"),
    author: "Minh Tran",
  },
];

export default function GroupAnnouncements({ navigation }: any) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Xử lý tạo thông báo mới
  const handleCreateAnnouncement = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ tiêu đề và nội dung.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      const newAnn = {
        id: `a${Date.now()}`,
        title: title.trim(),
        content: content.trim(),
        createdAt: new Date(),
        author: "Bạn", // Có thể thay bằng user thực tế
      };
      setAnnouncements([newAnn, ...announcements]);
      setTitle("");
      setContent("");
      setShowModal(false);
      setSubmitting(false);
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack?.()}
        >
          <Ionicons name="chevron-back" size={scale(26)} color="#4F8CFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo nhóm</Text>
        <View style={{ width: scale(32), alignItems: "flex-end" }}>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowModal(true)}
          >
            <Ionicons name="add-circle" size={scale(26)} color="#4F8CFF" />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={announcements}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: scale(16) }}
        renderItem={({ item }) => (
          <View style={styles.announcementCard}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.content}>{item.content}</Text>
            <View style={styles.metaRow}>
              <Ionicons
                name="person-circle-outline"
                size={scale(16)}
                color="#888"
              />
              <Text style={styles.metaText}>{item.author}</Text>
              <Ionicons
                name="time-outline"
                size={scale(15)}
                color="#888"
                style={{ marginLeft: scale(10) }}
              />
              <Text style={styles.metaText}>
                {item.createdAt instanceof Date
                  ? item.createdAt.toLocaleString()
                  : new Date(item.createdAt).toLocaleString()}
              </Text>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: scale(12) }} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có thông báo nào.</Text>
          </View>
        }
      />

      {/* Modal tạo thông báo */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Pressable style={styles.modalCard}>
              <Text style={styles.modalTitle}>Tạo thông báo mới</Text>
              <TextInput
                placeholder="Tiêu đề"
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                editable={!submitting}
              />
              <TextInput
                placeholder="Nội dung thông báo"
                style={[
                  styles.input,
                  { height: scale(80), textAlignVertical: "top" },
                ]}
                value={content}
                onChangeText={setContent}
                multiline
                editable={!submitting}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: "#aaa" }]}
                  onPress={() => setShowModal(false)}
                  disabled={submitting}
                >
                  <Text style={{ color: "#fff" }}>Huỷ</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalBtn,
                    { backgroundColor: "#2C4BFF", marginLeft: scale(10) },
                  ]}
                  onPress={handleCreateAnnouncement}
                  disabled={submitting}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    {submitting ? "Đang tạo..." : "Tạo"}
                  </Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9FC" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(12),
    paddingTop: scale(6),
    paddingBottom: scale(8),
    backgroundColor: "#fff",
    borderBottomWidth: 0.5,
    borderBottomColor: "#E4EAF2",
    justifyContent: "space-between",
  },
  backBtn: { width: scale(32), alignItems: "flex-start" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: scale(18),
    fontWeight: "bold",
    color: "#2C4BFF",
    marginHorizontal: scale(2),
  },
  addBtn: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  announcementCard: {
    backgroundColor: "#fff",
    borderRadius: scale(14),
    padding: scale(14),
    elevation: 2,
    shadowColor: "#2C4BFF",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: scale(4) },
    shadowRadius: scale(10),
  },
  title: {
    fontSize: scale(16),
    fontWeight: "bold",
    color: "#2C4BFF",
    marginBottom: scale(3),
  },
  content: {
    color: "#222",
    fontSize: scale(15),
    marginBottom: scale(7),
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: scale(2),
  },
  metaText: {
    fontSize: scale(13),
    color: "#888",
    marginLeft: scale(4),
    marginRight: scale(10),
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: scale(50),
  },
  emptyText: {
    color: "#888",
    fontSize: scale(15),
    fontStyle: "italic",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(44,75,255,0.13)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: scale(18),
    padding: scale(22),
    width: scale(320),
    elevation: 7,
    shadowColor: "#2C4BFF",
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: scale(6) },
    shadowRadius: scale(20),
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: scale(17),
    color: "#2C4BFF",
    marginBottom: scale(14),
    textAlign: "center",
  },
  input: {
    backgroundColor: "#F0F3FA",
    borderRadius: scale(10),
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
    fontSize: scale(15),
    marginBottom: scale(10),
    color: "#222",
  },
  modalActions: {
    flexDirection: "row",
    marginTop: scale(12),
    justifyContent: "flex-end",
  },
  modalBtn: {
    borderRadius: scale(10),
    paddingVertical: scale(8),
    paddingHorizontal: scale(24),
  },
});
