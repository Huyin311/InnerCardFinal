import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Responsive helpers
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;

export default function MemberInfo({ route, navigation }: any) {
  const { member } = route.params || {};

  if (!member) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation?.goBack?.()}
          >
            <Ionicons name="chevron-back" size={scale(26)} color="#4F8CFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông tin thành viên</Text>
          <View style={{ width: scale(26) }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text>Không tìm thấy thông tin thành viên.</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Thông tin thành viên</Text>
        <View style={{ width: scale(26) }} />
      </View>
      <View style={styles.content}>
        <Image source={member.avatar} style={styles.avatar} />
        <Text style={styles.name}>{member.name}</Text>
        <Text style={styles.role}>{member.role}</Text>
        {/* Thêm thông tin khác nếu muốn */}
        <View style={styles.infoRow}>
          <Ionicons
            name="mail-outline"
            size={scale(18)}
            color="#888"
            style={{ marginRight: scale(7) }}
          />
          <Text style={styles.infoText}>Email: (chưa cập nhật)</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons
            name="time-outline"
            size={scale(18)}
            color="#888"
            style={{ marginRight: scale(7) }}
          />
          <Text style={styles.infoText}>Ngày tham gia: (chưa cập nhật)</Text>
        </View>
      </View>
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
  content: {
    alignItems: "center",
    marginTop: scale(36),
    paddingHorizontal: scale(24),
  },
  avatar: {
    width: scale(88),
    height: scale(88),
    borderRadius: scale(24),
    backgroundColor: "#E4EAF2",
    marginBottom: scale(18),
  },
  name: {
    fontSize: scale(20),
    fontWeight: "bold",
    color: "#2C4BFF",
    marginBottom: scale(4),
  },
  role: {
    fontSize: scale(15),
    color: "#4F8CFF",
    marginBottom: scale(18),
    fontWeight: "500",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(12),
  },
  infoText: {
    fontSize: scale(15),
    color: "#555",
    fontStyle: "italic",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
