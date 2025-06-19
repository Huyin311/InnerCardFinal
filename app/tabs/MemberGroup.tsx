import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Responsive helpers
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;

// Giả lập dữ liệu thành viên
const members = [
  {
    id: "u1",
    name: "Huy Nguyen",
    avatar: require("../../assets/images/avatar.png"),
    role: "Chủ nhóm",
  },
  {
    id: "u2",
    name: "Lan Pham",
    avatar: require("../../assets/images/avatar.png"),
    role: "Thành viên",
  },
  {
    id: "u3",
    name: "Minh Tran",
    avatar: require("../../assets/images/avatar.png"),
    role: "Thành viên",
  },
  // ... thêm thành viên nếu cần
];

// Đề xuất các chức năng quản lý thành viên
const memberOptions = [
  {
    key: "view",
    icon: "person-circle-outline",
    label: "Xem thông tin",
    color: "#4F8CFF",
    onPress: (member: any, navigation: any) =>
      navigation.navigate("MemberInfo", { member }),
  },
  {
    key: "promote",
    icon: "arrow-up-circle-outline",
    label: "Thăng quyền (Thành viên → Quản trị)",
    color: "#00C48C",
    onPress: (member: any) =>
      Alert.alert(
        "Thăng quyền",
        `Bạn muốn thăng ${member.name} thành quản trị viên? (chức năng mẫu)`,
      ),
    onlyForMember: true,
  },
  {
    key: "demote",
    icon: "arrow-down-circle-outline",
    label: "Giáng quyền (Quản trị → Thành viên)",
    color: "#FFB300",
    onPress: (member: any) =>
      Alert.alert(
        "Giáng quyền",
        `Bạn muốn giáng ${member.name} xuống thành viên? (chức năng mẫu)`,
      ),
    onlyForAdmin: true,
  },
  {
    key: "remove",
    icon: "person-remove-outline",
    label: "Xóa khỏi nhóm",
    color: "#e74c3c",
    onPress: (member: any) =>
      Alert.alert(
        "Xóa thành viên",
        `Bạn chắc chắn muốn xóa ${member.name} khỏi nhóm?`,
        [
          { text: "Huỷ", style: "cancel" },
          {
            text: "Xóa",
            style: "destructive",
            onPress: () =>
              Alert.alert("Đã xóa", `${member.name} đã bị xóa khỏi nhóm (mẫu)`),
          },
        ],
      ),
    onlyForOthers: true,
  },
];

export default function MemberGroup({ navigation }: any) {
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showOptions, setShowOptions] = useState(false);

  // Mở menu tùy chọn cho 1 thành viên
  const handleOpenOptions = (member: any) => {
    setSelectedMember(member);
    setShowOptions(true);
  };

  // Đóng menu
  const handleCloseOptions = () => {
    setShowOptions(false);
    setSelectedMember(null);
  };

  // Lấy danh sách chức năng phù hợp với từng loại thành viên
  const getOptionsForMember = (member: any) => {
    const isOwner = member.role === "Chủ nhóm";
    const isAdmin = member.role === "Quản trị viên";
    const isMember = member.role === "Thành viên";
    return memberOptions.filter((opt) => {
      if (opt.onlyForOthers && isOwner) return false;
      if (opt.onlyForMember && !isMember) return false;
      if (opt.onlyForAdmin && !isAdmin) return false;
      return true;
    });
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
        <Text style={styles.headerTitle}>Thành viên nhóm</Text>
        <View style={{ width: scale(26) }} />
      </View>
      {/* Danh sách thành viên */}
      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: scale(16) }}
        renderItem={({ item }) => (
          <View style={styles.memberCard}>
            <Image source={item.avatar} style={styles.avatar} />
            <View style={{ marginLeft: scale(14), flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.role}>{item.role}</Text>
            </View>
            {/* Nút tuỳ chọn */}
            <TouchableOpacity
              style={styles.optionBtn}
              onPress={() => handleOpenOptions(item)}
            >
              <Ionicons
                name="ellipsis-vertical"
                size={scale(20)}
                color="#666"
              />
            </TouchableOpacity>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: scale(10) }} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có thành viên nào.</Text>
          </View>
        }
      />

      {/* Modal chức năng thành viên */}
      <Modal
        visible={showOptions}
        animationType="fade"
        transparent
        onRequestClose={handleCloseOptions}
      >
        <Pressable style={styles.modalOverlay} onPress={handleCloseOptions}>
          <View style={styles.optionsContainer}>
            <Text style={styles.optionsTitle}>
              {selectedMember?.name} - {selectedMember?.role}
            </Text>
            {getOptionsForMember(selectedMember || {}).map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={styles.optionRow}
                activeOpacity={0.7}
                onPress={() => {
                  handleCloseOptions();
                  setTimeout(() => {
                    if (opt.key === "view") {
                      opt.onPress(selectedMember, navigation); // truyền navigation cho "view"
                    } else {
                      opt.onPress(selectedMember); // các trường hợp khác vẫn truyền 1 tham số
                    }
                  }, 150);
                }}
              >
                <Ionicons
                  name={opt.icon as any}
                  size={scale(20)}
                  color={opt.color}
                  style={{ marginRight: scale(12) }}
                />
                <Text
                  style={[
                    styles.optionLabel,
                    opt.key === "remove" && { color: "#e74c3c" },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: scale(14),
    padding: scale(12),
    elevation: 2,
    shadowColor: "#2C4BFF",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: scale(4) },
    shadowRadius: scale(10),
  },
  avatar: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(12),
    backgroundColor: "#E4EAF2",
  },
  name: {
    fontSize: scale(16),
    fontWeight: "bold",
    color: "#222",
  },
  role: {
    fontSize: scale(13),
    color: "#4F8CFF",
    marginTop: scale(2),
  },
  optionBtn: {
    padding: scale(8),
    borderRadius: scale(14),
    backgroundColor: "#F0F3FA",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: scale(40),
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
    backgroundColor: "rgba(44,75,255,0.07)",
    justifyContent: "center",
    alignItems: "center",
  },
  optionsContainer: {
    backgroundColor: "#fff",
    borderRadius: scale(20),
    padding: scale(18),
    width: scale(290),
    elevation: 5,
    shadowColor: "#2C4BFF",
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: scale(6) },
    shadowRadius: scale(20),
  },
  optionsTitle: {
    fontWeight: "bold",
    color: "#2C4BFF",
    fontSize: scale(16),
    marginBottom: scale(12),
    textAlign: "center",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: scale(13),
    paddingHorizontal: scale(4),
    borderBottomWidth: 0.5,
    borderBottomColor: "#F0F3FA",
  },
  optionLabel: {
    fontSize: scale(15),
    color: "#222",
    fontWeight: "500",
  },
});
