import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Responsive helpers
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;

// Giả lập dữ liệu hoạt động nhóm
const activities = [
  {
    id: "act1",
    type: "Thêm thẻ mới",
    detail: "Lan Pham đã thêm thẻ 'Topic: Environment'",
    time: new Date("2025-06-17T20:05:00"),
    icon: "albums",
    color: "#00C48C",
  },
  {
    id: "act2",
    type: "Thành viên mới",
    detail: "Minh Tran đã tham gia nhóm",
    time: new Date("2025-06-17T15:30:00"),
    icon: "person-add",
    color: "#4F8CFF",
  },
  {
    id: "act3",
    type: "Tạo thông báo",
    detail: "Huy Nguyen đã gửi thông báo: 'Lịch họp tuần này'",
    time: new Date("2025-06-16T10:01:00"),
    icon: "notifications",
    color: "#FFB300",
  },
  {
    id: "act4",
    type: "Bình luận",
    detail: "Lan Pham đã bình luận trong thẻ 'Topic: Work'",
    time: new Date("2025-06-15T20:40:00"),
    icon: "chatbubble-ellipses",
    color: "#8C54FF",
  },
  // ... bạn có thể thêm nhiều hoạt động hơn
];

export default function GroupActivities({ navigation }: any) {
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
        <Text style={styles.headerTitle}>Hoạt động nhóm</Text>
        <View style={{ width: scale(26) }} />
      </View>
      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: scale(18), paddingBottom: scale(32) }}
        renderItem={({ item }) => (
          <View style={styles.activityCard}>
            <View
              style={[styles.iconBox, { backgroundColor: item.color + "22" }]}
            >
              <Ionicons
                name={item.icon as any}
                size={scale(22)}
                color={item.color}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.type}>{item.type}</Text>
              <Text style={styles.detail}>{item.detail}</Text>
              <Text style={styles.time}>
                {item.time instanceof Date
                  ? item.time.toLocaleString()
                  : new Date(item.time).toLocaleString()}
              </Text>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: scale(12) }} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có hoạt động nào.</Text>
          </View>
        }
      />
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
  activityCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    borderRadius: scale(14),
    padding: scale(14),
    elevation: 2,
    shadowColor: "#2C4BFF",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: scale(4) },
    shadowRadius: scale(10),
  },
  iconBox: {
    width: scale(42),
    height: scale(42),
    borderRadius: scale(12),
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(14),
  },
  type: {
    fontSize: scale(15),
    fontWeight: "bold",
    color: "#2C4BFF",
    marginBottom: scale(2),
  },
  detail: {
    color: "#222",
    fontSize: scale(14),
    marginBottom: scale(3),
  },
  time: {
    color: "#888",
    fontSize: scale(12),
    fontStyle: "italic",
    marginTop: scale(2),
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
});
