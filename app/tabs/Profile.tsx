import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;

// Mock user data, replace by real user context or props
const user = {
  avatar: "https://i.pravatar.cc/180?img=3",
  name: "Nguyễn Văn A",
  email: "nguyenvana@example.com",
  username: "nguyenvana",
  phone: "0123456789",
  role: "Thành viên",
  joined: "2024-08-01",
  group: "Nhóm TOEIC 900+",
};

export default function ProfileScreen({ navigation }: any) {
  function handleEditProfile() {
    Alert.alert("Chỉnh sửa", "Chức năng chỉnh sửa thông tin cá nhân.");
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarWrap}>
          <Image
            source={
              user.avatar
                ? { uri: user.avatar }
                : require("../../assets/images/avatar.png")
            }
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editBtn} onPress={handleEditProfile}>
            <Ionicons name="pencil" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.role}>{user.role}</Text>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color="#2C4BFF" />
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={18} color="#2C4BFF" />
            <Text style={styles.infoLabel}>Tên đăng nhập:</Text>
            <Text style={styles.infoValue}>{user.username}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color="#2C4BFF" />
            <Text style={styles.infoLabel}>Số điện thoại:</Text>
            <Text style={styles.infoValue}>{user.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color="#2C4BFF" />
            <Text style={styles.infoLabel}>Ngày tham gia:</Text>
            <Text style={styles.infoValue}>{user.joined}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={18} color="#2C4BFF" />
            <Text style={styles.infoLabel}>Nhóm hiện tại:</Text>
            <Text style={styles.infoValue}>{user.group}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleEditProfile}>
          <Ionicons name="create-outline" size={19} color="#fff" />
          <Text style={styles.primaryBtnText}>Chỉnh sửa thông tin</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9FC" },
  content: {
    alignItems: "center",
    padding: scale(20),
    paddingBottom: scale(40),
  },
  avatarWrap: { marginTop: 14, marginBottom: 10, position: "relative" },
  avatar: {
    width: scale(110),
    height: scale(110),
    borderRadius: 100,
    borderWidth: 3,
    borderColor: "#fff",
    backgroundColor: "#eee",
  },
  editBtn: {
    position: "absolute",
    bottom: 7,
    right: 7,
    backgroundColor: "#2C4BFF",
    borderRadius: 20,
    padding: 6,
    zIndex: 2,
  },
  name: {
    fontWeight: "bold",
    fontSize: scale(20),
    color: "#2C4BFF",
    marginBottom: 2,
    marginTop: 6,
  },
  role: {
    color: "#888",
    marginBottom: 17,
    fontSize: scale(15),
  },
  infoSection: {
    backgroundColor: "#fff",
    borderRadius: 13,
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 18,
    shadowColor: "#222",
    shadowOpacity: 0.06,
    shadowRadius: 7,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoLabel: {
    color: "#444",
    fontSize: scale(15),
    marginLeft: 10,
    minWidth: 100,
  },
  infoValue: {
    color: "#2C4BFF",
    fontWeight: "500",
    marginLeft: 4,
    fontSize: scale(15),
    flexShrink: 1,
  },
  primaryBtn: {
    flexDirection: "row",
    backgroundColor: "#2C4BFF",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 11,
    paddingVertical: scale(13),
    paddingHorizontal: scale(22),
    marginTop: scale(12),
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: scale(16),
    marginLeft: 10,
  },
});
