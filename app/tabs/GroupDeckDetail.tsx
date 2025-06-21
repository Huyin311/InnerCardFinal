import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDarkMode } from "../DarkModeContext";
import { lightTheme, darkTheme } from "../theme";
import { useLanguage } from "../LanguageContext";
import { supabase } from "../../supabase/supabaseClient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AuthContext } from "../../contexts/AuthContext";
import { logGroupActivity } from "../../components/utils/groupActivities";
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;

export default function GroupDeckDetail() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { darkMode } = useDarkMode();
  const theme = darkMode ? darkTheme : lightTheme;
  const { lang } = useLanguage();
  const { user } = useContext(AuthContext) || {};
  const { deckId, groupId } = route.params as {
    deckId: number;
    groupId: number;
  };

  const [deck, setDeck] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeck();
    fetchCards();
    // Ghi log khi xem chi tiết bộ thẻ trong nhóm
    if (user?.id)
      logGroupActivity({
        group_id: groupId,
        activity_type: "view_deck_detail",
        content: `Xem chi tiết bộ thẻ (deckId: ${deckId})`,
        created_by: user.id ?? undefined,
      });
  }, [deckId]);

  async function fetchDeck() {
    const { data } = await supabase
      .from("decks")
      .select("*")
      .eq("id", deckId)
      .single();
    setDeck(data);
  }

  async function fetchCards() {
    setLoading(true);
    const { data } = await supabase
      .from("cards")
      .select(
        "id, front_text, back_text, image_url, phonetic, part_of_speech, example",
      )
      .eq("deck_id", deckId)
      .order("id");
    setCards(data || []);
    setLoading(false);
  }

  const handleStudy = () => {
    navigation.navigate("Study", { deckId });
  };

  const handleEditDeck = () => {
    navigation.navigate("EditDeck", { deckId, onDone: fetchDeck });
  };

  const renderCard = ({ item }: { item: any }) => (
    <View
      style={[
        styles.cardRow,
        {
          backgroundColor: theme.card,
          shadowColor: darkMode ? "#000" : "#BFC8D6",
        },
      ]}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}
      >
        <Ionicons
          name="bookmark"
          color={theme.primary}
          size={scale(19)}
          style={{ marginRight: 7 }}
        />
        <Text
          style={{
            fontWeight: "bold",
            color: theme.primary,
            fontSize: 15,
            flex: 1,
          }}
          numberOfLines={2}
        >
          {item.front_text}
        </Text>
        {item.part_of_speech && (
          <Text
            style={{
              marginLeft: 9,
              fontSize: 12,
              color: theme.subText,
              fontStyle: "italic",
            }}
          >
            {item.part_of_speech}
          </Text>
        )}
      </View>
      {item.phonetic ? (
        <Text style={{ fontSize: 13, color: theme.subText, marginBottom: 2 }}>
          /{item.phonetic}/
        </Text>
      ) : null}
      <Text style={{ color: theme.text, fontSize: 15, marginBottom: 3 }}>
        {item.back_text}
      </Text>
      {item.example ? (
        <Text
          style={{
            color: theme.primary,
            fontSize: 13,
            fontStyle: "italic",
            marginTop: 3,
          }}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={scale(13)} />{" "}
          {item.example}
        </Text>
      ) : null}
      {item.image_url ? (
        <Image
          source={{ uri: item.image_url ?? undefined }}
          style={{
            width: scale(90),
            height: scale(90),
            borderRadius: 8,
            marginTop: 6,
            alignSelf: "center",
            backgroundColor: "#eaeaea",
          }}
          resizeMode="cover"
        />
      ) : null}
    </View>
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
          numberOfLines={2}
        >
          {deck?.title || "Bộ thẻ"}
        </Text>
        <TouchableOpacity onPress={handleEditDeck}>
          <Ionicons
            name="create-outline"
            size={scale(23)}
            color={theme.primary}
          />
        </TouchableOpacity>
      </View>
      <View style={{ padding: scale(16) }}>
        <Text
          style={{ fontSize: scale(15), color: theme.text, marginBottom: 6 }}
        >
          {deck?.description}
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: theme.primary,
            borderRadius: scale(9),
            padding: scale(12),
            alignSelf: "flex-start",
            marginBottom: scale(16),
          }}
          onPress={handleStudy}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Học bộ thẻ</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.primary}
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={cards}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{
            paddingHorizontal: scale(16),
            paddingBottom: scale(24),
          }}
          renderItem={renderCard}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cardRow: {
    borderRadius: 12,
    backgroundColor: "#f9fafd",
    marginBottom: 15,
    padding: 14,
    elevation: 2,
    shadowRadius: 6,
    shadowOpacity: 0.15,
  },
});
