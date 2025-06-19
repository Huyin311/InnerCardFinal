import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Dimensions,
  Alert,
  Platform,
  ScrollView,
  ToastAndroid,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Responsive helpers
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isTablet = SCREEN_WIDTH >= 600;
const clamp = (v: number, min: number, max: number) =>
  Math.max(Math.min(v, max), min);
const baseWidth = 375;
const maxScale = isTablet ? 1.22 : 1.07;
const minScale = 0.91;
const scale = (size: number) => {
  const ratio = SCREEN_WIDTH / baseWidth;
  return clamp(size * ratio, size * minScale, size * maxScale);
};

// --- Các chức năng quản trị nhóm bổ sung ---
const adminOptions = [
  {
    key: "edit",
    icon: "create-outline",
    label: "Chỉnh sửa thông tin nhóm",
    color: "#2C4BFF",
    onPress: (navigation: any) =>
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
    onPress: (navigation: any) =>
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
    onPress: (navigation: any) =>
      Alert.alert(
        "Thống kê nhóm",
        "Điều hướng sang màn hình thống kê (chức năng mẫu)",
      ),
  },
  {
    key: "permission",
    icon: "settings-outline",
    label: "Quản lý quyền",
    color: "#8C54FF",
    onPress: (navigation: any) =>
      Alert.alert(
        "Quản lý quyền",
        "Điều hướng sang màn hình quản lý quyền (chức năng mẫu)",
      ),
  },
];

export default function GroupSettings({ navigation }: any) {
  // Dummy state for switchers
  const [isNotif, setIsNotif] = React.useState(true);
  const [isPublic, setIsPublic] = React.useState(false);

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
        <Text style={styles.headerTitle}>Cài đặt nhóm</Text>
        <View style={{ width: scale(28) }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: scale(36) }}>
        {/* Section: General */}
        <Text style={styles.sectionTitle}>Thông tin nhóm</Text>
        <TouchableOpacity
          style={styles.item}
          onPress={() =>
            Alert.alert(
              "Chỉnh sửa tên nhóm",
              "Tính năng này đang phát triển. Liên hệ Admin để đổi tên!",
            )
          }
        >
          <Ionicons
            name="pencil"
            size={scale(22)}
            color="#4F8CFF"
            style={styles.itemIcon}
          />
          <Text style={styles.itemText}>Đổi tên nhóm</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.item}
          onPress={() =>
            Alert.alert(
              "Chỉnh sửa mô tả",
              "Tính năng này đang phát triển. Liên hệ Admin để đổi mô tả!",
            )
          }
        >
          <Ionicons
            name="document-text-outline"
            size={scale(22)}
            color="#4F8CFF"
            style={styles.itemIcon}
          />
          <Text style={styles.itemText}>Đổi mô tả nhóm</Text>
        </TouchableOpacity>

        {/* Các chức năng quản trị nhóm bổ sung */}
        <Text style={styles.sectionTitle}>Quản trị nhóm</Text>
        {adminOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={styles.item}
            activeOpacity={0.7}
            onPress={() => option.onPress(navigation)}
          >
            <Ionicons
              name={option.icon as any}
              size={scale(22)}
              color={option.color}
              style={styles.itemIcon}
            />
            <Text style={styles.itemText}>{option.label}</Text>
            <Ionicons
              name="chevron-forward"
              size={scale(18)}
              color="#bbb"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>
        ))}

        {/* Section: Privacy */}
        <Text style={styles.sectionTitle}>Quyền riêng tư</Text>
        <View style={styles.item}>
          <Ionicons
            name="lock-closed-outline"
            size={scale(22)}
            color="#FF647C"
            style={styles.itemIcon}
          />
          <Text style={styles.itemText}>Công khai nhóm</Text>
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            trackColor={{ false: "#bbb", true: "#4F8CFF" }}
            thumbColor={isPublic ? "#4F8CFF" : "#fff"}
            style={{ marginLeft: "auto" }}
          />
        </View>

        {/* Section: Notifications */}
        <Text style={styles.sectionTitle}>Thông báo</Text>
        <View style={styles.item}>
          <Ionicons
            name="notifications-outline"
            size={scale(22)}
            color="#FFB300"
            style={styles.itemIcon}
          />
          <Text style={styles.itemText}>Nhận thông báo nhóm</Text>
          <Switch
            value={isNotif}
            onValueChange={setIsNotif}
            trackColor={{ false: "#bbb", true: "#4F8CFF" }}
            thumbColor={isNotif ? "#4F8CFF" : "#fff"}
            style={{ marginLeft: "auto" }}
          />
        </View>

        {/* Section: Danger zone */}
        <Text style={styles.sectionTitle}>Nguy hiểm</Text>
        <TouchableOpacity
          style={[styles.item, { borderColor: "#e74c3c" }]}
          onPress={() =>
            Alert.alert("Rời nhóm", "Bạn chắc chắn muốn rời nhóm?", [
              { text: "Huỷ", style: "cancel" },
              {
                text: "Rời nhóm",
                style: "destructive",
                onPress: () => {
                  if (Platform.OS === "android")
                    ToastAndroid.show("Đã rời nhóm (mẫu)", ToastAndroid.SHORT);
                  else Alert.alert("Đã rời nhóm (mẫu)");
                  navigation.goBack?.();
                },
              },
            ])
          }
        >
          <Ionicons
            name="log-out-outline"
            size={scale(22)}
            color="#e74c3c"
            style={styles.itemIcon}
          />
          <Text style={[styles.itemText, { color: "#e74c3c" }]}>Rời nhóm</Text>
        </TouchableOpacity>
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
  sectionTitle: {
    fontSize: scale(15),
    color: "#4F8CFF",
    fontWeight: "bold",
    marginTop: scale(26),
    marginBottom: scale(8),
    marginLeft: scale(20),
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: scale(15),
    paddingHorizontal: scale(20),
    borderBottomWidth: 1,
    borderColor: "#F2F2F2",
    backgroundColor: "#fff",
  },
  itemIcon: {
    marginRight: scale(13),
  },
  itemText: {
    fontSize: scale(16),
    color: "#222",
    fontWeight: "500",
  },
});
