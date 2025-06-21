import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native";
import { supabase } from "../../supabase/supabaseClient";
import { useUserId } from "../../hooks/useUserId";
import { useDarkMode } from "../DarkModeContext";
import { lightTheme, darkTheme } from "../theme";
import { Ionicons } from "@expo/vector-icons";
import { logGroupActivity } from "../../components/utils/groupActivities";
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;

export default function ShareDeckToGroup({ navigation, route }: any) {
  const { groupId, onShare } = route.params;
  const userId = useUserId();
  const { darkMode } = useDarkMode();
  const theme = darkMode ? darkTheme : lightTheme;
  const [decks, setDecks] = useState<any[]>([]);
  const [allShared, setAllShared] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyDecks();
  }, [userId]);

  async function fetchMyDecks() {
    setLoading(true);

    // Lấy tất cả deck của user
    const { data: myDecks } = await supabase
      .from("decks")
      .select("id, title, description, created_at")
      .eq("user_id", userId);

    if (!myDecks || myDecks.length === 0) {
      setDecks([]);
      setAllShared(false);
      setLoading(false);
      return;
    }

    // Lấy deck_id đã share vào group này
    const { data: sharedDecks } = await supabase
      .from("deck_shares")
      .select("deck_id")
      .eq("group_id", groupId);

    const sharedIds = (sharedDecks || []).map((row: any) => row.deck_id);

    // Lọc các deck chưa được share vào group
    const filteredDecks = myDecks.filter(
      (deck: any) => !sharedIds.includes(deck.id),
    );

    setDecks(filteredDecks);
    setAllShared(filteredDecks.length === 0 && myDecks.length > 0);
    setLoading(false);
  }

  async function handleShare(deck: any) {
    // kiểm tra đã share chưa
    const { data: existed } = await supabase
      .from("deck_shares")
      .select("*")
      .eq("deck_id", deck.id)
      .eq("group_id", groupId)
      .single();
    if (existed) {
      Alert.alert("Bạn đã chia sẻ bộ thẻ này vào nhóm rồi!");
      return;
    }
    await supabase.from("deck_shares").insert({
      deck_id: deck.id,
      group_id: groupId,
      shared_by: userId,
    });

    // Lấy tên user để log
    let fullName = "Người dùng";
    if (userId) {
      const { data: userData } = await supabase
        .from("users")
        .select("full_name")
        .eq("id", userId)
        .single();
      fullName = userData?.full_name || "Người dùng";
    }

    // Ghi log hoạt động thêm bộ thẻ vào nhóm
    await logGroupActivity({
      group_id: groupId,
      activity_type: "add_deck",
      content: `${fullName} đã thêm bộ thẻ "${deck.title}"`,
      created_by: userId ?? undefined,
    });

    Alert.alert("Đã thêm bộ thẻ vào nhóm!");
    if (onShare) onShare();
    navigation.goBack();
  }

  const renderDeck = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.deckCard,
        {
          backgroundColor: theme.card,
          shadowColor: darkMode ? "#000" : "#BFC8D6",
        },
      ]}
      activeOpacity={0.9}
      onPress={() => handleShare(item)}
    >
      <View style={styles.deckHeaderRow}>
        <Ionicons
          name="albums"
          size={scale(28)}
          color={theme.primary}
          style={{ marginRight: 12 }}
        />
        <View style={{ flex: 1 }}>
          <Text
            style={[styles.deckTitle, { color: theme.primary }]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <Text
            style={[styles.deckDesc, { color: theme.text }]}
            numberOfLines={2}
          >
            {item.description || "Không có mô tả"}
          </Text>
        </View>
      </View>
      <View style={styles.deckMetaRow}>
        <Text style={[styles.deckMeta, { color: theme.subText }]}>
          <Ionicons name="calendar-outline" size={scale(13)} />{" "}
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
        <View style={styles.shareBtn}>
          <Ionicons name="share-social-outline" size={scale(17)} color="#fff" />
          <Text style={styles.shareBtnText}>Chia sẻ</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: scale(12),
          borderBottomWidth: 0.5,
          borderBottomColor: theme.card,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name="chevron-back"
            size={scale(26)}
            color={theme.primary}
          />
        </TouchableOpacity>
        <Text
          style={{
            flex: 1,
            textAlign: "center",
            fontWeight: "bold",
            fontSize: scale(18),
            color: theme.primary,
          }}
        >
          Chọn bộ thẻ để chia sẻ
        </Text>
        <View style={{ width: scale(32) }} />
      </View>
      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.primary}
          style={{ marginTop: 20 }}
        />
      ) : allShared ? (
        <View
          style={{
            alignItems: "center",
            marginTop: scale(60),
            paddingHorizontal: scale(30),
          }}
        >
          <Ionicons
            name="albums-outline"
            size={scale(52)}
            color={theme.primary + "80"}
          />
          <Text
            style={{
              color: theme.subText,
              fontSize: scale(16),
              marginTop: 14,
              fontStyle: "italic",
              textAlign: "center",
              lineHeight: scale(23),
            }}
          >
            Toàn bộ bộ thẻ của bạn đã được chia sẻ vào nhóm này.
          </Text>
        </View>
      ) : (
        <FlatList
          data={decks}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{
            padding: scale(16),
            paddingBottom: scale(24),
          }}
          renderItem={renderDeck}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: scale(40) }}>
              <Ionicons
                name="albums-outline"
                size={scale(52)}
                color={theme.primary + "60"}
              />
              <Text
                style={{
                  color: theme.subText,
                  fontSize: scale(15),
                  marginTop: 10,
                  fontStyle: "italic",
                }}
              >
                Bạn chưa có bộ thẻ nào.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  deckCard: {
    borderRadius: scale(15),
    padding: scale(16),
    marginBottom: scale(16),
    shadowRadius: 8,
    shadowOpacity: 0.13,
    elevation: 3,
  },
  deckHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: scale(5),
  },
  deckTitle: {
    fontSize: scale(16),
    fontWeight: "bold",
    marginBottom: 1,
  },
  deckDesc: {
    fontSize: scale(14),
    marginTop: 2,
    marginBottom: 2,
  },
  deckMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: scale(10),
    justifyContent: "space-between",
  },
  deckMeta: {
    fontSize: scale(12),
    fontStyle: "italic",
  },
  shareBtn: {
    flexDirection: "row",
    backgroundColor: "#2E88FF",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  shareBtnText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "bold",
    fontSize: scale(13),
  },
});
