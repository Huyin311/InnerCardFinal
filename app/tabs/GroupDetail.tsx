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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import QRCode from "react-native-qrcode-svg";

// Responsive helpers
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const BASE_WIDTH = 390; // iPhone 12 width
const BASE_HEIGHT = 844; // iPhone 12 height
const scale = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;

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
    key: "quiz",
    icon: "create",
    label: "Tạo bài kiểm tra",
    color: "#FF7A00",
    desc: "Tạo bài quiz cho nhóm",
  },
];

export default function GroupDetail({ navigation }: any) {
  const [showQR, setShowQR] = useState(false);
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
      case "members":
        navigation.navigate("MemberGroup");
        break;
      case "announcements":
        navigation.navigate("GroupAnnouncements");
        break;
      case "cards":
        navigation.navigate("CardDetail", { groupId: group.id });
        break;
      case "activities":
        navigation.navigate("GroupActivities");
        break;
      case "settings":
        navigation.navigate("GroupSetting"); // Đưa tất cả chức năng quản trị vào màn settings
        break;
      case "create_test":
        Alert.alert(
          "Chức năng mới",
          "Điều hướng đến màn hình tạo bài kiểm tra (quiz)!",
        );
        break;
      default:
        Alert.alert(
          "Chức năng đang phát triển",
          "Tính năng này sẽ sớm có mặt!",
        );
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack?.()}
        >
          <Ionicons name="chevron-back" size={scale(28)} color="#4F8CFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {group.name}
        </Text>
        {/* Không còn menu dấu ba chấm ở đây nữa */}
        <View style={{ width: scale(32) }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: verticalScale(32) }}>
        {/* Nhóm info */}
        <View style={styles.groupCard}>
          <Image source={group.avatar} style={styles.avatar} />
          <View style={{ marginLeft: scale(16), flex: 1 }}>
            <Text style={styles.groupName}>{group.name}</Text>
            <Text style={styles.groupDesc} numberOfLines={2}>
              {group.description}
            </Text>
            <View style={styles.metaRow}>
              <Ionicons name="person" size={scale(14)} color="#4F8CFF" />
              <Text style={styles.metaText}>{group.owner}</Text>
              <Ionicons
                name="people"
                size={scale(14)}
                color="#4F8CFF"
                style={{ marginLeft: scale(10) }}
              />
              <Text style={styles.metaText}>
                {group.memberCount} thành viên
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                marginTop: scale(4),
                alignItems: "center",
              }}
            >
              <Ionicons name="calendar" size={scale(13)} color="#aaa" />
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
            <Ionicons name="key-outline" size={scale(18)} color="#2C4BFF" />
            <Text style={styles.codeText}>{group.joinCode}</Text>
            <Ionicons
              name="copy-outline"
              size={scale(18)}
              color="#2C4BFF"
              style={{ marginLeft: scale(6) }}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.qrBtn} onPress={handleShowQR}>
            <Ionicons name="qr-code-outline" size={scale(23)} color="#2C4BFF" />
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
                style={{
                  fontWeight: "bold",
                  fontSize: scale(17),
                  color: "#2C4BFF",
                }}
              >
                Quét QR để tham gia nhóm
              </Text>
              <View style={{ marginVertical: verticalScale(18) }}>
                <QRCode
                  value={group.joinCode}
                  size={scale(180)}
                  color="#2C4BFF"
                  backgroundColor="#fff"
                  getRef={(c) => {
                    qrRef.current = c;
                  }}
                />
              </View>
              <Text style={{ color: "#444", marginBottom: verticalScale(12) }}>
                Mã: <Text style={{ fontWeight: "bold" }}>{group.joinCode}</Text>
              </Text>
              <TouchableOpacity
                style={styles.qrCloseBtn}
                onPress={handleHideQR}
              >
                <Ionicons name="close" size={scale(22)} color="#fff" />
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
                  size={scale(24)}
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
    paddingHorizontal: scale(12),
    paddingTop: verticalScale(6),
    paddingBottom: verticalScale(8),
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
  groupCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: scale(16),
    marginTop: scale(16),
    marginBottom: scale(8),
    borderRadius: scale(18),
    padding: scale(16),
    shadowColor: "#2C4BFF",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: scale(6) },
    shadowRadius: scale(16),
    elevation: 4,
  },
  avatar: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(16),
    backgroundColor: "#E4EAF2",
  },
  groupName: {
    fontSize: scale(17),
    fontWeight: "bold",
    color: "#2C4BFF",
    marginBottom: 1,
  },
  groupDesc: {
    fontSize: scale(14),
    color: "#444",
    marginBottom: 2,
    fontStyle: "italic",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: scale(2),
  },
  metaText: {
    fontSize: scale(13),
    color: "#4F8CFF",
    marginLeft: scale(3),
    marginRight: scale(10),
    fontWeight: "500",
  },
  metaSub: {
    fontSize: scale(12),
    color: "#aaa",
    marginLeft: scale(3),
    marginRight: scale(8),
  },
  codeRow: {
    marginTop: scale(10),
    marginBottom: scale(12),
    marginHorizontal: scale(16),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: scale(12),
  },
  codeBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6ECFF",
    borderRadius: scale(14),
    paddingVertical: scale(11),
    paddingHorizontal: scale(20),
    flex: 1,
    marginRight: scale(10),
    elevation: 2,
    shadowColor: "#2C4BFF",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: scale(2) },
    shadowRadius: scale(6),
    borderWidth: 1.2,
    borderColor: "#2C4BFF",
  },
  codeText: {
    color: "#2C4BFF",
    fontWeight: "bold",
    fontSize: scale(16),
    letterSpacing: 2,
    marginLeft: scale(8),
  },
  qrBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: scale(12),
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
    borderWidth: 1.1,
    borderColor: "#2C4BFF",
    elevation: 2,
    shadowColor: "#2C4BFF",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: scale(2) },
    shadowRadius: scale(6),
  },
  qrText: {
    color: "#2C4BFF",
    fontWeight: "bold",
    fontSize: scale(14),
    marginLeft: scale(4),
  },
  smartButtonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: scale(10),
    marginTop: scale(16),
    marginBottom: scale(10),
    rowGap: scale(12),
  },
  smartBtn: {
    width: (SCREEN_WIDTH - scale(48)) / 2,
    backgroundColor: "#fff",
    borderRadius: scale(16),
    padding: scale(14),
    alignItems: "flex-start",
    marginBottom: scale(10),
    elevation: 3,
    shadowColor: "#2C4BFF",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: scale(4) },
    shadowRadius: scale(12),
  },
  smartBtnIconBox: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(12),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: scale(6),
  },
  smartBtnLabel: {
    fontWeight: "bold",
    color: "#222",
    fontSize: scale(15),
    marginBottom: 2,
  },
  smartBtnDesc: {
    color: "#888",
    fontSize: scale(12),
    marginTop: 0,
  },
  qrModalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
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
    borderRadius: scale(22),
    padding: scale(26),
    alignItems: "center",
    width: SCREEN_WIDTH * 0.77,
    elevation: 9,
    shadowColor: "#2C4BFF",
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: scale(8) },
    shadowRadius: scale(24),
  },
  qrCloseBtn: {
    backgroundColor: "#2C4BFF",
    borderRadius: 999,
    padding: scale(6),
    position: "absolute",
    top: scale(9),
    right: scale(9),
  },
});
