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
import { useDarkMode } from "../DarkModeContext";
import { lightTheme, darkTheme } from "../theme";
import { useLanguage } from "../LanguageContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;

// Đa ngữ cho giao diện thông báo nhóm
const TEXT = {
  groupAnnouncements: { vi: "Thông báo nhóm", en: "Group Announcements" },
  createAnnouncement: { vi: "Tạo thông báo mới", en: "Create Announcement" },
  titlePlaceholder: { vi: "Tiêu đề", en: "Title" },
  contentPlaceholder: { vi: "Nội dung thông báo", en: "Announcement content" },
  cancel: { vi: "Huỷ", en: "Cancel" },
  create: { vi: "Tạo", en: "Create" },
  creating: { vi: "Đang tạo...", en: "Creating..." },
  error: { vi: "Lỗi", en: "Error" },
  errorContent: {
    vi: "Vui lòng nhập đầy đủ tiêu đề và nội dung.",
    en: "Please enter both title and content.",
  },
  noAnnouncement: {
    vi: "Chưa có thông báo nào.",
    en: "No announcements yet.",
  },
};

const initialAnnouncements = [
  {
    id: "a1",
    title: { vi: "Lịch họp tuần này", en: "This week's schedule" },
    content: {
      vi: "Nhóm sẽ họp vào 20:00 tối Chủ nhật, các bạn nhớ tham gia đúng giờ!",
      en: "Group will meet at 8:00 PM on Sunday. Please join on time!",
    },
    createdAt: new Date("2025-06-16T10:00:00"),
    author: "Huy Nguyen",
  },
  {
    id: "a2",
    title: { vi: "Tài liệu mới đã được cập nhật", en: "New documents updated" },
    content: {
      vi: "File PDF đề thi thử IELTS 2025 đã được thêm vào thư mục Tài liệu.",
      en: "IELTS 2025 PDF mock test has been added to the Documents folder.",
    },
    createdAt: new Date("2025-06-15T16:30:00"),
    author: "Lan Pham",
  },
  {
    id: "a3",
    title: { vi: "Chào mừng thành viên mới", en: "Welcome new members" },
    content: {
      vi: "Chúng ta vừa kết nạp thêm 3 thành viên mới! Hãy cùng chào đón các bạn nhé.",
      en: "We have just welcomed 3 new members! Let's greet them together.",
    },
    createdAt: new Date("2025-06-14T08:15:00"),
    author: "Minh Tran",
  },
];

export default function GroupAnnouncements({ navigation }: any) {
  const { darkMode } = useDarkMode();
  const theme = darkMode ? darkTheme : lightTheme;
  const { lang } = useLanguage();

  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Xử lý tạo thông báo mới
  const handleCreateAnnouncement = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert(TEXT.error[lang], TEXT.errorContent[lang]);
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      const newAnn = {
        id: `a${Date.now()}`,
        title: { vi: title.trim(), en: title.trim() }, // Nếu muốn đa ngữ thực sự, cần nhập riêng từng ngôn ngữ
        content: { vi: content.trim(), en: content.trim() },
        createdAt: new Date(),
        author: "Bạn", // Thay bằng tên user thật nếu có
      };
      setAnnouncements([newAnn, ...announcements]);
      setTitle("");
      setContent("");
      setShowModal(false);
      setSubmitting(false);
    }, 500);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: theme.section, borderBottomColor: theme.card },
        ]}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack?.()}
        >
          <Ionicons
            name="chevron-back"
            size={scale(26)}
            color={theme.primary}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.primary }]}>
          {TEXT.groupAnnouncements[lang]}
        </Text>
        <View style={{ width: scale(32), alignItems: "flex-end" }}>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowModal(true)}
          >
            <Ionicons
              name="add-circle"
              size={scale(26)}
              color={theme.primary}
            />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={announcements}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: scale(16) }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.announcementCard,
              { backgroundColor: theme.section, shadowColor: theme.primary },
            ]}
          >
            <Text style={[styles.title, { color: theme.primary }]}>
              {item.title[lang]}
            </Text>
            <Text style={[styles.content, { color: theme.text }]}>
              {item.content[lang]}
            </Text>
            <View style={styles.metaRow}>
              <Ionicons
                name="person-circle-outline"
                size={scale(16)}
                color={theme.subText}
              />
              <Text style={[styles.metaText, { color: theme.subText }]}>
                {item.author}
              </Text>
              <Ionicons
                name="time-outline"
                size={scale(15)}
                color={theme.subText}
                style={{ marginLeft: scale(10) }}
              />
              <Text style={[styles.metaText, { color: theme.subText }]}>
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
            <Text style={[styles.emptyText, { color: theme.subText }]}>
              {TEXT.noAnnouncement[lang]}
            </Text>
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
          style={[
            styles.modalOverlay,
            {
              backgroundColor: darkMode
                ? "rgba(44,75,255,0.22)"
                : "rgba(44,75,255,0.13)",
            },
          ]}
          onPress={() => setShowModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Pressable
              style={[
                styles.modalCard,
                { backgroundColor: theme.section, shadowColor: theme.primary },
              ]}
            >
              <Text style={[styles.modalTitle, { color: theme.primary }]}>
                {TEXT.createAnnouncement[lang]}
              </Text>
              <TextInput
                placeholder={TEXT.titlePlaceholder[lang]}
                placeholderTextColor={theme.subText}
                style={[
                  styles.input,
                  { backgroundColor: theme.card, color: theme.text },
                ]}
                value={title}
                onChangeText={setTitle}
                editable={!submitting}
              />
              <TextInput
                placeholder={TEXT.contentPlaceholder[lang]}
                placeholderTextColor={theme.subText}
                style={[
                  styles.input,
                  {
                    height: scale(80),
                    textAlignVertical: "top",
                    backgroundColor: theme.card,
                    color: theme.text,
                  },
                ]}
                value={content}
                onChangeText={setContent}
                multiline
                editable={!submitting}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: theme.subText }]}
                  onPress={() => setShowModal(false)}
                  disabled={submitting}
                >
                  <Text style={{ color: "#fff" }}>{TEXT.cancel[lang]}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalBtn,
                    { backgroundColor: theme.primary, marginLeft: scale(10) },
                  ]}
                  onPress={handleCreateAnnouncement}
                  disabled={submitting}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    {submitting ? TEXT.creating[lang] : TEXT.create[lang]}
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
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(12),
    paddingTop: scale(6),
    paddingBottom: scale(8),
    borderBottomWidth: 0.5,
    justifyContent: "space-between",
  },
  backBtn: { width: scale(32), alignItems: "flex-start" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: scale(18),
    fontWeight: "bold",
    marginHorizontal: scale(2),
  },
  addBtn: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  announcementCard: {
    borderRadius: scale(14),
    padding: scale(14),
    elevation: 2,
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: scale(4) },
    shadowRadius: scale(10),
  },
  title: {
    fontSize: scale(16),
    fontWeight: "bold",
    marginBottom: scale(3),
  },
  content: {
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
    marginLeft: scale(4),
    marginRight: scale(10),
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: scale(50),
  },
  emptyText: {
    fontSize: scale(15),
    fontStyle: "italic",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    borderRadius: scale(18),
    padding: scale(22),
    width: scale(320),
    elevation: 7,
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: scale(6) },
    shadowRadius: scale(20),
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: scale(17),
    marginBottom: scale(14),
    textAlign: "center",
  },
  input: {
    borderRadius: scale(10),
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
    fontSize: scale(15),
    marginBottom: scale(10),
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
