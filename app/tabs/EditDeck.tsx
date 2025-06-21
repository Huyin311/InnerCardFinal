import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { supabase } from "../../supabase/supabaseClient";
import { useDarkMode } from "../DarkModeContext";
import { lightTheme, darkTheme } from "../theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;

export default function EditDeck() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { deckId, onDone } = route.params as {
    deckId: number;
    onDone?: () => void;
  };
  const { darkMode } = useDarkMode();
  const theme = darkMode ? darkTheme : lightTheme;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDeck();
    // eslint-disable-next-line
  }, [deckId]);

  async function fetchDeck() {
    setLoading(true);
    const { data, error } = await supabase
      .from("decks")
      .select("*")
      .eq("id", deckId)
      .single();
    if (error || !data) {
      Alert.alert("Không tìm thấy bộ thẻ");
      navigation.goBack();
      return;
    }
    setTitle(data.title || "");
    setDescription(data.description || "");
    setLoading(false);
  }

  async function handleSave() {
    if (!title.trim()) {
      Alert.alert("Tên bộ thẻ không được để trống");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("decks")
      .update({
        title: title.trim(),
        description: description.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", deckId);
    setSaving(false);
    if (error) {
      Alert.alert("Lỗi", error.message);
      return;
    }
    if (onDone) onDone();
    navigation.goBack();
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name="chevron-back"
            size={scale(26)}
            color={theme.primary}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.primary }]}>
          Chỉnh sửa bộ thẻ
        </Text>
        <View style={{ width: scale(32) }} />
      </View>
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <View style={{ padding: scale(18) }}>
          <Text style={{ color: theme.text, fontWeight: "bold" }}>
            Tên bộ thẻ
          </Text>
          <TextInput
            style={[
              styles.input,
              { color: theme.text, backgroundColor: theme.card },
            ]}
            value={title}
            onChangeText={setTitle}
            placeholder="Nhập tên bộ thẻ"
            placeholderTextColor={theme.subText}
            editable={!saving}
          />
          <Text
            style={{ color: theme.text, fontWeight: "bold", marginTop: 16 }}
          >
            Mô tả
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: theme.text,
                backgroundColor: theme.card,
                minHeight: scale(70),
                textAlignVertical: "top",
              },
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Nhập mô tả (không bắt buộc)"
            placeholderTextColor={theme.subText}
            editable={!saving}
            multiline
          />
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: theme.primary }]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: scale(18),
    fontWeight: "bold",
    marginHorizontal: scale(2),
  },
  input: {
    borderRadius: scale(10),
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
    fontSize: scale(15),
    marginTop: scale(7),
    marginBottom: scale(3),
  },
  saveBtn: {
    borderRadius: scale(10),
    paddingVertical: scale(14),
    alignItems: "center",
    marginTop: scale(28),
  },
});
