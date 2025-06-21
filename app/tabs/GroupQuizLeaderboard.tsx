import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../supabase/supabaseClient";

export default function GroupQuizLeaderboardButton({ quizId, userId, theme }) {
  const [visible, setVisible] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    supabase
      .from("group_quiz_results")
      .select(
        "score,started_at,submitted_at,user_id,users: user_id (full_name,username,avatar_url)",
      )
      .eq("quiz_id", quizId)
      .then(({ data }) => {
        data?.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          const aTime =
            a.started_at && a.submitted_at
              ? new Date(a.submitted_at).getTime() -
                new Date(a.started_at).getTime()
              : Infinity;
          const bTime =
            b.started_at && b.submitted_at
              ? new Date(b.submitted_at).getTime() -
                new Date(b.started_at).getTime()
              : Infinity;
          return aTime - bTime;
        });
        setLeaderboard(data ?? []);
        setLoading(false);
      });
  }, [visible, quizId]);

  function formatDuration(started: string, submitted: string) {
    if (!started) return "--";
    const ms = new Date(submitted).getTime() - new Date(started).getTime();
    if (ms < 0) return "--";
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  }

  return (
    <>
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#e9f1ff",
          borderRadius: 9,
          paddingVertical: 8,
          paddingHorizontal: 22,
          alignSelf: "center",
          marginTop: 10,
          marginBottom: 10,
        }}
        onPress={() => setVisible(true)}
      >
        <Ionicons name="trophy" size={20} color="#276ef1" />
        <Text style={{ color: "#276ef1", marginLeft: 8, fontWeight: "bold" }}>
          Bảng xếp hạng
        </Text>
      </TouchableOpacity>
      <Modal visible={visible} animationType="slide">
        <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 14,
              borderBottomWidth: 1,
              borderColor: "#e0e5ec",
            }}
          >
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Ionicons name="close" size={26} color="#276ef1" />
            </TouchableOpacity>
            <Text
              style={{
                flex: 1,
                textAlign: "center",
                fontSize: 19,
                fontWeight: "bold",
                color: "#276ef1",
              }}
            >
              Bảng xếp hạng
            </Text>
            <View style={{ width: 30 }} />
          </View>
          <ScrollView style={{ padding: 18 }}>
            <View style={{ flexDirection: "row", marginBottom: 8 }}>
              <Text
                style={[
                  styles.col,
                  { flex: 0.2, textAlign: "center", color: "#aaa" },
                ]}
              >
                #
              </Text>
              <Text style={[styles.col, { flex: 1, color: "#aaa" }]}>Tên</Text>
              <Text
                style={[
                  styles.col,
                  { flex: 0.5, textAlign: "right", color: "#aaa" },
                ]}
              >
                Điểm
              </Text>
              <Text
                style={[
                  styles.col,
                  { flex: 0.7, textAlign: "center", color: "#aaa" },
                ]}
              >
                Thời gian
              </Text>
            </View>
            {loading ? (
              <Text>Đang tải...</Text>
            ) : leaderboard.length === 0 ? (
              <Text
                style={{ textAlign: "center", color: "#888", marginTop: 20 }}
              >
                Chưa có ai làm.
              </Text>
            ) : (
              leaderboard.slice(0, 20).map((item, idx) => (
                <View
                  key={item.user_id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor:
                      item.user_id === userId ? "#e9f1ff" : "transparent",
                    borderRadius: 7,
                    paddingVertical: 8,
                  }}
                >
                  <Text
                    style={[
                      styles.col,
                      {
                        flex: 0.2,
                        textAlign: "center",
                        fontWeight: "bold",
                        color:
                          idx === 0
                            ? "#ffd700"
                            : idx === 1
                              ? "#bdbdbd"
                              : idx === 2
                                ? "#ff884d"
                                : "#222",
                      },
                    ]}
                  >
                    {idx + 1}
                  </Text>
                  <Text
                    style={[
                      styles.col,
                      {
                        flex: 1,
                        color: item.user_id === userId ? "#276ef1" : "#222",
                      },
                    ]}
                  >
                    {item.users?.full_name || item.users?.username || "Ẩn danh"}
                    {item.user_id === userId ? " (Bạn)" : ""}
                  </Text>
                  <Text
                    style={[
                      styles.col,
                      { flex: 0.5, textAlign: "right", fontWeight: "bold" },
                    ]}
                  >
                    {item.score}
                  </Text>
                  <Text
                    style={[
                      styles.col,
                      { flex: 0.7, textAlign: "center", color: "#444" },
                    ]}
                  >
                    {item.started_at
                      ? formatDuration(item.started_at, item.submitted_at)
                      : "--"}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  col: { fontSize: 15 },
});
