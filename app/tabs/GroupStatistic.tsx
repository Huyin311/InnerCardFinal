import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDarkMode } from "../DarkModeContext";
import { useLanguage } from "../LanguageContext";
import { lightTheme, darkTheme } from "../theme";
import { supabase } from "../../supabase/supabaseClient";

const { width } = Dimensions.get("window");
const scale = (size: number) => (width / 375) * size;

// ---------- TYPE DEFINITIONS ----------

type DBActivity = {
  id: number;
  group_id: number;
  activity_type: string;
  content: string | null;
  created_by: string | null;
  created_at: string;
  users?: { full_name?: string } | null;
};

type ActivityTypeMap = Record<
  string,
  {
    icon: string;
    color: string;
    text: { vi: string; en: string };
  }
>;

// ---------- END TYPE DEFINITIONS ----------

const TEXT = {
  statistic: { vi: "Thống kê nhóm", en: "Group Statistics" },
  totalMembers: { vi: "Thành viên", en: "Members" },
  owner: { vi: "Chủ nhóm", en: "Owner" },
  admin: { vi: "Quản trị viên", en: "Admin" },
  member: { vi: "Thành viên", en: "Member" },
  totalQuizzes: { vi: "Quiz nhóm", en: "Group Quizzes" },
  avgQuizScore: { vi: "Điểm TB Quiz", en: "Avg Quiz Score" },
  totalDecks: { vi: "Bộ thẻ chia sẻ", en: "Decks Shared" },
  totalCards: { vi: "Tổng số thẻ", en: "Total Cards" },
  quizAttempts: { vi: "Lượt làm Quiz", en: "Quiz Attempts" },
  highestScore: { vi: "Điểm cao nhất", en: "Highest Score" },
  done: { vi: "Xong", en: "Done" },
};

export default function GroupStatistic({ route, navigation }: any) {
  const { darkMode } = useDarkMode();
  const theme = darkMode ? darkTheme : lightTheme;
  const { lang } = useLanguage();
  const groupId = route?.params?.groupId;

  const [loading, setLoading] = useState(true);
  const [memberStats, setMemberStats] = useState<any>(null);
  const [quizStats, setQuizStats] = useState<any>(null);
  const [deckStats, setDeckStats] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, [groupId]);

  async function fetchStats() {
    setLoading(true);

    // Thành viên
    const { data: memberRoleRows } = await supabase
      .from("group_members")
      .select("role")
      .eq("group_id", groupId);

    const totalMembers = memberRoleRows ? memberRoleRows.length : 0;
    const ownerCount =
      memberRoleRows?.filter((m) => m.role === "owner").length || 0;
    const adminCount =
      memberRoleRows?.filter((m) => m.role === "admin").length || 0;
    const memberCount =
      memberRoleRows?.filter((m) => m.role === "member").length || 0;

    setMemberStats({
      total: totalMembers,
      owner: ownerCount,
      admin: adminCount,
      member: memberCount,
    });

    // Quiz
    const { data: quizRows } = await supabase
      .from("group_quizzes")
      .select("id")
      .eq("group_id", groupId);

    const quizIds = quizRows?.map((q) => q.id) || [];

    let quizCount = quizIds.length;
    let avgQuizScore = 0;
    let quizAttempts = 0;
    let highestScore = 0;

    if (quizCount > 0) {
      const { data: quizResults } = await supabase
        .from("group_quiz_results")
        .select("score")
        .in("quiz_id", quizIds);

      quizAttempts = quizResults?.length ?? 0;

      if (quizResults && quizResults.length > 0) {
        avgQuizScore =
          quizResults.reduce((sum, r) => sum + (r.score ?? 0), 0) /
          quizResults.length;
        highestScore = Math.max(...quizResults.map((r) => r.score ?? 0));
      }
    }

    setQuizStats({
      totalQuizzes: quizCount,
      avgQuizScore: avgQuizScore.toFixed(2),
      attempts: quizAttempts,
      highestScore,
    });

    // Decks shared và cards
    const { data: deckRows } = await supabase
      .from("deck_shares")
      .select("deck_id")
      .eq("group_id", groupId);

    const deckIds = deckRows?.map((d) => d.deck_id) || [];
    let deckCount = deckIds.length;
    let cardCount = 0;

    if (deckIds.length > 0) {
      const { count: cardCountResult } = await supabase
        .from("cards")
        .select("*", { count: "exact", head: true })
        .in("deck_id", deckIds);
      cardCount = cardCountResult ?? 0;
    }

    setDeckStats({
      totalDecks: deckCount,
      totalCards: cardCount,
    });

    setLoading(false);
  }

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
            size={scale(28)}
            color={theme.primary}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.primary }]}>
          {TEXT.statistic[lang]}
        </Text>
        <View style={{ width: scale(28) }} />
      </View>
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={theme.primary} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: scale(32) }}>
          {/* Thống kê thành viên */}
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>
            {TEXT.totalMembers[lang]}: {memberStats?.total}
          </Text>
          <View style={styles.statRow}>
            <StatBox
              label={TEXT.owner[lang]}
              value={memberStats?.owner}
              color="#3B5EFF"
            />
            <StatBox
              label={TEXT.admin[lang]}
              value={memberStats?.admin}
              color="#00C48C"
            />
            <StatBox
              label={TEXT.member[lang]}
              value={memberStats?.member}
              color="#FFA940"
            />
          </View>
          {/* Thống kê quiz */}
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>
            {TEXT.totalQuizzes[lang]}: {quizStats?.totalQuizzes}
          </Text>
          <View style={styles.statRow}>
            <StatBox
              label={TEXT.avgQuizScore[lang]}
              value={quizStats?.avgQuizScore}
              color="#E74C3C"
            />
            <StatBox
              label={TEXT.quizAttempts[lang]}
              value={quizStats?.attempts}
              color="#00BFFF"
            />
            <StatBox
              label={TEXT.highestScore[lang]}
              value={quizStats?.highestScore}
              color="#8C54FF"
            />
          </View>
          {/* Thống kê bộ thẻ */}
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>
            {TEXT.totalDecks[lang]}: {deckStats?.totalDecks}
          </Text>
          <View style={styles.statRow}>
            <StatBox
              label={TEXT.totalCards[lang]}
              value={deckStats?.totalCards}
              color="#FFB300"
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: any;
  color: string;
}) {
  const { darkMode } = useDarkMode();
  return (
    <View
      style={[
        styles.statBox,
        {
          borderColor: color,
          backgroundColor: darkMode ? "#232a37" : "#fff",
        },
      ]}
    >
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color }]}>{label}</Text>
    </View>
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
  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: scale(15),
    fontWeight: "bold",
    marginTop: scale(26),
    marginBottom: scale(8),
    marginLeft: scale(20),
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(10),
    marginBottom: scale(8),
  },
  statBox: {
    flex: 1,
    marginHorizontal: scale(6),
    paddingVertical: scale(18),
    borderRadius: scale(12),
    borderWidth: 1.5,
    alignItems: "center",
    marginBottom: scale(5),
    backgroundColor: "#fff",
    elevation: 2,
  },
  statValue: {
    fontSize: scale(20),
    fontWeight: "bold",
    marginBottom: scale(2),
  },
  statLabel: {
    fontSize: scale(13),
    fontWeight: "500",
  },
});
