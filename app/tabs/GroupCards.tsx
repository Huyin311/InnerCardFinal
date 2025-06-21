import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDarkMode } from "../DarkModeContext";
import { lightTheme, darkTheme } from "../theme";
import { useLanguage } from "../LanguageContext";
import { supabase } from "../../supabase/supabaseClient";
import { useRoute, useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../contexts/AuthContext";
import { logGroupActivity } from "../../components/utils/groupActivities";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;

const TEXT = {
  groupCards: { vi: "Bộ thẻ nhóm", en: "Group Decks" },
  addDeck: { vi: "Thêm bộ thẻ", en: "Add Deck" },
  noDeck: { vi: "Chưa có bộ thẻ nào", en: "No decks yet" },
  loading: { vi: "Đang tải...", en: "Loading..." },
  confirmRemove: {
    vi: "Bạn có chắc muốn xóa bộ thẻ này khỏi nhóm?",
    en: "Are you sure you want to remove this deck from the group?",
  },
  removed: { vi: "Đã xóa bộ thẻ khỏi nhóm!", en: "Deck removed from group!" },
};

function formatDate(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString();
}

export default function GroupCardsScreen() {
  const { darkMode } = useDarkMode();
  const theme = darkMode ? darkTheme : lightTheme;
  const { lang } = useLanguage();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user } = useContext(AuthContext) || {};
  const { groupId } = route.params as { groupId: number };

  const [decks, setDecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDecks();
    // ĐÃ LOẠI BỎ logGroupActivity cho xem danh sách bộ thẻ
  }, [groupId]);

  async function fetchDecks() {
    setLoading(true);
    const { data } = await supabase
      .from("deck_shares")
      .select(
        `
        id, deck_id, shared_by, shared_at,
        decks (
          id, title, description, user_id, created_at
        ),
        users:shared_by(full_name, avatar_url)
        `,
      )
      .eq("group_id", groupId)
      .order("shared_at", { ascending: false });

    setDecks(
      (data || []).map((row: any) => ({
        id: row.decks.id,
        title: row.decks.title,
        description: row.decks.description,
        owner: row.users?.full_name || "Thành viên",
        ownerAvatar: (row.users?.avatar_url ?? undefined) as string | undefined,
        shared_at: row.shared_at,
        shared_by: row.shared_by,
        deck_id: row.deck_id,
        created_at: row.decks.created_at,
        deck_share_id: row.id,
      })),
    );
    setLoading(false);
  }

  const handleAddDeck = () => {
    navigation.navigate("ShareDeckToGroup", { groupId, onShare: fetchDecks });
  };

  const handleDeckPress = (deck: any) => {
    navigation.navigate("GroupDeckDetail", { groupId, deckId: deck.deck_id });
  };

  // Hàm xóa bộ thẻ khỏi nhóm
  const handleRemoveDeck = (deck: any) => {
    Alert.alert("Xác nhận", TEXT.confirmRemove[lang], [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => removeDeck(deck),
      },
    ]);
  };

  async function removeDeck(deck: any) {
    setLoading(true);
    // Xóa khỏi deck_shares
    await supabase.from("deck_shares").delete().eq("id", deck.deck_share_id);

    // Lấy tên user để log
    let fullName = "Người dùng";
    if (user?.id) {
      const { data: userData } = await supabase
        .from("users")
        .select("full_name")
        .eq("id", user.id)
        .single();
      fullName = userData?.full_name || "Người dùng";
    }

    // Log hoạt động xóa bộ thẻ
    await logGroupActivity({
      group_id: groupId,
      activity_type: "remove_deck",
      content: `${fullName} đã xóa bộ thẻ "${deck.title}" khỏi nhóm`,
      created_by: user?.id ?? undefined,
    });

    setLoading(false);
    Alert.alert(TEXT.removed[lang]);
    fetchDecks();
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
      onPress={() => handleDeckPress(item)}
      activeOpacity={0.92}
    >
      <View style={styles.deckHeaderRow}>
        <Ionicons
          name="albums"
          size={scale(32)}
          color={theme.primary}
          style={{ marginRight: 10 }}
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
            {item.description}
          </Text>
        </View>
        {/* Nút xóa */}
        <TouchableOpacity
          onPress={() => handleRemoveDeck(item)}
          style={{ marginLeft: 8, padding: 4 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash" size={scale(22)} color="#FF5252" />
        </TouchableOpacity>
      </View>
      <View style={styles.deckMetaRow}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={
              item.ownerAvatar
                ? { uri: item.ownerAvatar }
                : require("../../assets/images/avatar.png")
            }
            style={{
              width: scale(24),
              height: scale(24),
              borderRadius: 12,
              marginRight: 7,
              backgroundColor: "#ccc",
            }}
          />
          <Text style={[styles.deckMeta, { color: theme.subText }]}>
            {item.owner}
          </Text>
        </View>
        <Text style={[styles.deckMeta, { color: theme.subText }]}>
          <Ionicons name="calendar-outline" size={scale(13)} /> Thêm:{" "}
          {formatDate(item.shared_at)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: theme.section, borderBottomColor: theme.card },
        ]}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack?.()}
        >
          <Ionicons
            name="chevron-back"
            size={scale(26)}
            color={theme.primary}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.primary }]}>
          {TEXT.groupCards[lang]}
        </Text>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddDeck}>
          <Ionicons
            name="add-circle-outline"
            size={scale(26)}
            color={theme.primary}
          />
        </TouchableOpacity>
      </View>
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={theme.primary} />
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
              <Text style={[styles.empty, { color: theme.subText }]}>
                {TEXT.noDeck[lang]}
              </Text>
            </View>
          }
        />
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
  backBtn: { width: scale(32), alignItems: "flex-start" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: scale(18),
    fontWeight: "bold",
    marginHorizontal: scale(2),
  },
  addBtn: { width: scale(32), alignItems: "flex-end" },
  deckCard: {
    borderRadius: scale(15),
    padding: scale(16),
    marginBottom: scale(14),
    shadowRadius: 8,
    shadowOpacity: 0.13,
    elevation: 3,
  },
  deckHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: scale(5),
  },
  deckTitle: { fontSize: scale(16), fontWeight: "bold" },
  deckDesc: { fontSize: scale(14), marginTop: 2, marginBottom: 2 },
  deckMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: scale(8),
    justifyContent: "space-between",
  },
  deckMeta: { fontSize: scale(12), fontStyle: "italic" },
  empty: { fontSize: scale(15), fontStyle: "italic" },
});
