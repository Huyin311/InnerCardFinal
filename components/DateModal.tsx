import React from "react";
import {
  Modal,
  Pressable,
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

// theme: truyền vào lightTheme/darkTheme
export default function DateModal({
  visible,
  onRequestClose,
  value,
  mode,
  onChange,
  minimumDate,
  theme,
  darkMode,
}: {
  visible: boolean;
  onRequestClose: () => void;
  value: Date;
  mode: "date" | "time" | "datetime";
  onChange: (event: DateTimePickerEvent, date?: Date) => void;
  minimumDate?: Date;
  theme: any;
  darkMode: boolean;
}) {
  const overlayBg = darkMode ? "rgba(0,0,0,0.57)" : "rgba(110,127,170,0.13)";
  // Sửa ở đây:
  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") {
      if (event.type === "set") {
        onChange(event, date);
        onRequestClose(); // đóng modal ngay khi chọn
      } else if (event.type === "dismissed") {
        onRequestClose(); // đóng modal khi hủy
      }
    } else {
      // iOS: chỉ thay đổi giá trị, không đóng modal
      onChange(event, date);
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <Pressable
        style={[StyleSheet.absoluteFill, { backgroundColor: overlayBg }]}
        onPress={onRequestClose}
      />
      <View style={modalStyles.centered}>
        <View
          style={[
            modalStyles.pickerBox,
            { backgroundColor: theme.section, borderColor: theme.primary },
          ]}
        >
          <DateTimePicker
            value={value}
            mode={mode}
            display={Platform.OS === "ios" ? "inline" : "default"}
            onChange={handleChange}
            minimumDate={minimumDate}
            themeVariant={darkMode ? "dark" : "light"}
            textColor={Platform.OS === "ios" ? theme.text : undefined}
            accentColor={theme.primary}
            style={{ width: "100%" }}
          />
          <TouchableOpacity
            style={[modalStyles.closeBtn, { backgroundColor: theme.primary }]}
            onPress={onRequestClose}
          >
            <Ionicons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerBox: {
    width: "92%",
    borderRadius: 14,
    borderWidth: 1.3,
    overflow: "hidden",
    alignItems: "center",
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.13,
    shadowRadius: 18,
    elevation: 7,
  },
  closeBtn: {
    alignSelf: "flex-end",
    marginTop: 8,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 16,
  },
});
