import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../AppNavigator"; // Cập nhật lại đường dẫn nếu cần

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;

export default function Setting() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // State mẫu, hãy thay bằng global state nếu cần
  const [notiEnabled, setNotiEnabled] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

  function handlePressProfile() {
    navigation.navigate("Profile");
  }
  function handlePressChangePassword() {
    Alert.alert("Đổi mật khẩu", "Chức năng đổi mật khẩu.");
  }
  function handlePressLanguage() {
    Alert.alert("Ngôn ngữ", "Chức năng chọn ngôn ngữ (vi, en…).");
  }
  function handlePressAbout() {
    Alert.alert("Về ứng dụng", "Quiz Battle App\nPhiên bản 1.0.0\n© 2025");
  }
  function handlePressLogout() {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất không?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: () => {
          /* Xử lý đăng xuất */
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Cài đặt</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={handlePressProfile}>
            <Ionicons name="person-circle-outline" size={24} color="#2C4BFF" />
            <Text style={styles.rowText}>Thông tin tài khoản</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color="#bbb"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.row}
            onPress={handlePressChangePassword}
          >
            <Ionicons name="key-outline" size={22} color="#2C4BFF" />
            <Text style={styles.rowText}>Đổi mật khẩu</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color="#bbb"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.section}>
          <View style={styles.row}>
            <Ionicons name="notifications-outline" size={22} color="#2C4BFF" />
            <Text style={styles.rowText}>Nhận thông báo</Text>
            <Switch
              style={{ marginLeft: "auto" }}
              value={notiEnabled}
              onValueChange={setNotiEnabled}
              thumbColor={notiEnabled ? "#2C4BFF" : "#ccc"}
              trackColor={{ false: "#ddd", true: "#B7D1FF" }}
            />
          </View>
          <View style={styles.row}>
            <Ionicons name="moon-outline" size={21} color="#2C4BFF" />
            <Text style={styles.rowText}>Chế độ tối</Text>
            <Switch
              style={{ marginLeft: "auto" }}
              value={darkMode}
              onValueChange={setDarkMode}
              thumbColor={darkMode ? "#2C4BFF" : "#ccc"}
              trackColor={{ false: "#ddd", true: "#B7D1FF" }}
            />
          </View>
          <TouchableOpacity style={styles.row} onPress={handlePressLanguage}>
            <Ionicons name="language-outline" size={21} color="#2C4BFF" />
            <Text style={styles.rowText}>Ngôn ngữ</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color="#bbb"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={handlePressAbout}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color="#2C4BFF"
            />
            <Text style={styles.rowText}>Về ứng dụng</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color="#bbb"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.row, { backgroundColor: "#fff0f0" }]}
            onPress={handlePressLogout}
          >
            <Ionicons name="log-out-outline" size={22} color="#e74c3c" />
            <Text style={[styles.rowText, { color: "#e74c3c" }]}>
              Đăng xuất
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.version}>Phiên bản 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9FC" },
  content: { padding: scale(18), paddingBottom: scale(28) },
  header: {
    fontWeight: "bold",
    fontSize: scale(22),
    color: "#2C4BFF",
    marginBottom: scale(12),
    marginTop: scale(6),
    alignSelf: "center",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: scale(16),
    paddingVertical: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: scale(14),
    paddingHorizontal: scale(8),
    borderBottomColor: "#f0f0f0",
    borderBottomWidth: 1,
  },
  rowText: {
    fontSize: scale(16),
    color: "#222",
    marginLeft: 12,
    fontWeight: "500",
  },
  version: { color: "#aaa", alignSelf: "center", marginTop: 10, fontSize: 14 },
});
