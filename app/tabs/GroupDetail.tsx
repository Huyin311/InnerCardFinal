import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ToastAndroid,
  Platform,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import QRCode from "react-native-qrcode-svg";

const { width, height } = Dimensions.get("window");

// Giả lập dữ liệu nhóm
const group = {
  id: "g1",
  name: "IELTS Speaking Club",
  owner: "Huy Nguyen",
  memberCount: 123,
  cardCount: 456,
  avatar: require("../../assets/images/avatar.png"),
  description:
    "Nơi mọi người luyện nói tiếng Anh, chia sẻ tài liệu, cùng nhau tiến bộ.",
  category: "Education",
  createdAt: new Date("2024-05-01"),
  joinCode: "IELTS2024",
};

const features = [
  {
    key: "members",
    icon: "people",
    label: "Thành viên",
    color: "#4F8CFF",
    desc: "Xem danh sách & vai trò",
  },
  {
    key: "announcements",
    icon: "notifications",
    label: "Thông báo",
    color: "#FFB300",
    desc: "Tin tức mới nhất từ nhóm",
  },
  {
    key: "cards",
    icon: "albums",
    label: "Thẻ",
    color: "#00C48C",
    desc: "Tổng số thẻ học nhóm",
  },
  {
    key: "activities",
    icon: "pulse",
    label: "Hoạt động",
    color: "#8C54FF",
    desc: "Lịch sử tương tác nhóm",
  },
  {
    key: "settings",
    icon: "settings",
    label: "Cài đặt",
    color: "#FF647C",
    desc: "Quản lý nhóm",
  },
  {
    key: "create_test",
    icon: "create",
    label: "Tạo bài kiểm tra",
    color: "#FF7A00",
    desc: "Tạo bài quiz cho nhóm",
  },
];

// Các chức năng menu dấu 3 chấm
const menuOptions = [
  {
    key: "edit",
    icon: "create-outline",
    label: "Chỉnh sửa thông tin nhóm",
    color: "#2C4BFF",
    onPress: () =>
      Alert.alert(
        "Chỉnh sửa thông tin nhóm",
        "Điều hướng sang màn hình chỉnh sửa nhóm (chức năng mẫu)",
      ),
  },
  {
    key: "invite",
    icon: "person-add-outline",
    label: "Mời thành viên",
    color: "#00C48C",
    onPress: () =>
      Alert.alert(
        "Mời thành viên",
        "Điều hướng sang màn hình mời thành viên (chức năng mẫu)",
      ),
  },
  {
    key: "statistics",
    icon: "bar-chart-outline",
    label: "Thống kê nhóm",
    color: "#FFB300",
    onPress: () =>
      Alert.alert(
        "Thống kê nhóm",
        "Điều hướng sang màn hình thống kê (chức năng mẫu)",
      ),
  },
  {
    key: "settings",
    icon: "settings-outline",
    label: "Quản lý quyền",
    color: "#8C54FF",
    onPress: () =>
      Alert.alert(
        "Quản lý quyền",
        "Điều hướng sang màn hình quản lý quyền (chức năng mẫu)",
      ),
  },
  {
    key: "leave",
    icon: "log-out-outline",
    label: "Rời nhóm",
    color: "#e74c3c",
    onPress: () =>
      Alert.alert("Rời nhóm", "Bạn chắc chắn muốn rời nhóm?", [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Rời nhóm",
          style: "destructive",
          onPress: () =>
            ToastAndroid.show("Đã rời nhóm (mẫu)", ToastAndroid.SHORT),
        },
      ]),
  },
];

export default function GroupDetail({ navigation }: any) {
  const [showQR, setShowQR] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const qrRef = useRef<any>(null);

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(group.joinCode);
    if (Platform.OS === "android") {
      ToastAndroid.show("Đã sao chép mã nhóm!", ToastAndroid.SHORT);
    } else {
      Alert.alert("Đã sao chép mã nhóm!");
    }
  };

  const handleShowQR = () => setShowQR(true);
  const handleHideQR = () => setShowQR(false);

  // Action cho từng chức năng
  const handleFeaturePress = (key: string) => {
    switch (key) {
      case "create_test":
        Alert.alert(
          "Chức năng mới",
          "Điều hướng đến màn hình tạo bài kiểm tra (quiz)!",
        );
        break;
      default:
        // TODO: Điều hướng sang màn hình chi tiết tương ứng
        break;
    }
  };

  const handleMenuOption = (option: (typeof menuOptions)[0]) => {
    setShowMenu(false);
    setTimeout(() => option.onPress(), 150);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack?.()}
        >
          <Ionicons name="chevron-back" size={28} color="#4F8CFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {group.name}
        </Text>
        <TouchableOpacity
          onPress={() => setShowMenu(true)}
          style={{ width: 32, alignItems: "flex-end" }}
        >
          <Ionicons name="ellipsis-horizontal" size={24} color="#4F8CFF" />
        </TouchableOpacity>
      </View>

      {/* Menu dấu ba chấm */}
      <Modal
        visible={showMenu}
        animationType="fade"
        transparent
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            {menuOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={styles.menuItem}
                activeOpacity={0.7}
                onPress={() => handleMenuOption(option)}
              >
                <Ionicons
                  name={option.icon as any}
                  size={20}
                  color={option.color}
                  style={{ marginRight: 10 }}
                />
                <Text
                  style={[
                    styles.menuText,
                    option.key === "leave" ? { color: "#e74c3c" } : {},
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Nhóm info */}
        <View style={styles.groupCard}>
          <Image source={group.avatar} style={styles.avatar} />
          <View style={{ marginLeft: 16, flex: 1 }}>
            <Text style={styles.groupName}>{group.name}</Text>
            <Text style={styles.groupDesc} numberOfLines={2}>
              {group.description}
            </Text>
            <View style={styles.metaRow}>
              <Ionicons name="person" size={14} color="#4F8CFF" />
              <Text style={styles.metaText}>{group.owner}</Text>
              <Ionicons
                name="people"
                size={14}
                color="#4F8CFF"
                style={{ marginLeft: 10 }}
              />
              <Text style={styles.metaText}>
                {group.memberCount} thành viên
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                marginTop: 4,
                alignItems: "center",
              }}
            >
              <Ionicons name="calendar" size={13} color="#aaa" />
              <Text style={styles.metaSub}>
                Tạo ngày {group.createdAt.toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Mã nhóm nổi bật + QR */}
        <View style={styles.codeRow}>
          <TouchableOpacity
            style={styles.codeBox}
            activeOpacity={0.85}
            onPress={handleCopyCode}
          >
            <Ionicons name="key-outline" size={18} color="#2C4BFF" />
            <Text style={styles.codeText}>{group.joinCode}</Text>
            <Ionicons
              name="copy-outline"
              size={18}
              color="#2C4BFF"
              style={{ marginLeft: 6 }}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.qrBtn} onPress={handleShowQR}>
            <Ionicons name="qr-code-outline" size={23} color="#2C4BFF" />
            <Text style={styles.qrText}>QR nhóm</Text>
          </TouchableOpacity>
        </View>

        {/* Hiển thị QR khi cần */}
        {showQR && (
          <View style={styles.qrModalOverlay}>
            <TouchableOpacity
              style={styles.qrModalBack}
              onPress={handleHideQR}
            />
            <View style={styles.qrModalCard}>
              <Text
                style={{ fontWeight: "bold", fontSize: 17, color: "#2C4BFF" }}
              >
                Quét QR để tham gia nhóm
              </Text>
              <View style={{ marginVertical: 18 }}>
                <QRCode
                  value={group.joinCode}
                  size={180}
                  color="#2C4BFF"
                  backgroundColor="#fff"
                  getRef={qrRef}
                />
              </View>
              <Text style={{ color: "#444", marginBottom: 12 }}>
                Mã: <Text style={{ fontWeight: "bold" }}>{group.joinCode}</Text>
              </Text>
              <TouchableOpacity
                style={styles.qrCloseBtn}
                onPress={handleHideQR}
              >
                <Ionicons name="close" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Dòng nút tính năng */}
        <View style={styles.smartButtonRow}>
          {features.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.smartBtn}
              activeOpacity={0.8}
              onPress={() => handleFeaturePress(item.key)}
            >
              <View
                style={[
                  styles.smartBtnIconBox,
                  { backgroundColor: item.color + "22" },
                ]}
              >
                <Ionicons
                  name={item.icon as any}
                  size={24}
                  color={item.color}
                />
              </View>
              <Text style={styles.smartBtnLabel}>{item.label}</Text>
              <Text style={styles.smartBtnDesc} numberOfLines={1}>
                {item.desc}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9FC" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 0.5,
    borderBottomColor: "#E4EAF2",
  },
  backBtn: { width: 32, alignItems: "flex-start" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C4BFF",
    marginHorizontal: 2,
  },
  menuOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(44,75,255,0.08)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    zIndex: 100,
  },
  menuContainer: {
    backgroundColor: "#fff",
    marginTop: 56,
    marginRight: 8,
    borderRadius: 16,
    minWidth: 210,
    paddingVertical: 8,
    shadowColor: "#2C4BFF",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 18,
    elevation: 7,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 18,
  },
  menuText: {
    fontSize: 15,
    color: "#222",
    fontWeight: "500",
  },
  groupCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 18,
    padding: 16,
    shadowColor: "#2C4BFF",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 4,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "#E4EAF2",
  },
  groupName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#2C4BFF",
    marginBottom: 1,
  },
  groupDesc: {
    fontSize: 14,
    color: "#444",
    marginBottom: 2,
    fontStyle: "italic",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  metaText: {
    fontSize: 13,
    color: "#4F8CFF",
    marginLeft: 3,
    marginRight: 10,
    fontWeight: "500",
  },
  metaSub: {
    fontSize: 12,
    color: "#aaa",
    marginLeft: 3,
    marginRight: 8,
  },
  codeRow: {
    marginTop: 10,
    marginBottom: 12,
    marginHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  codeBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6ECFF",
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 20,
    flex: 1,
    marginRight: 10,
    elevation: 2,
    shadowColor: "#2C4BFF",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    borderWidth: 1.2,
    borderColor: "#2C4BFF",
  },
  codeText: {
    color: "#2C4BFF",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 2,
    marginLeft: 8,
  },
  qrBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1.1,
    borderColor: "#2C4BFF",
    elevation: 2,
    shadowColor: "#2C4BFF",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  qrText: {
    color: "#2C4BFF",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 4,
  },
  smartButtonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: 10,
    marginTop: 16,
    marginBottom: 10,
    rowGap: 12,
  },
  smartBtn: {
    width: (width - 48) / 2,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    alignItems: "flex-start",
    marginBottom: 10,
    elevation: 3,
    shadowColor: "#2C4BFF",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  smartBtnIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  smartBtnLabel: {
    fontWeight: "bold",
    color: "#222",
    fontSize: 15,
    marginBottom: 2,
  },
  smartBtnDesc: {
    color: "#888",
    fontSize: 12,
    marginTop: 0,
  },
  qrModalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width,
    height: height,
    backgroundColor: "rgba(36,45,77,0.24)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99,
  },
  qrModalBack: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  qrModalCard: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 26,
    alignItems: "center",
    width: width * 0.77,
    elevation: 9,
    shadowColor: "#2C4BFF",
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
  },
  qrCloseBtn: {
    backgroundColor: "#2C4BFF",
    borderRadius: 999,
    padding: 6,
    position: "absolute",
    top: 9,
    right: 9,
  },
});
