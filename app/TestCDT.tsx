import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Giả lập dữ liệu flashcard
const cardSet = {
  id: "1",
  name: "IELTS Vocabulary Mastery",
  price: 49,
  isBestseller: true,
  cover: require("../assets/images/avatar.png"),
  description:
    "Bộ flashcard giúp bạn hệ thống toàn bộ từ vựng IELTS, chia chủ đề dễ học, kèm mẹo ghi nhớ và ví dụ thực tế.",
  totalCards: 150,
  topics: [
    { name: "Education", total: 30, unlocked: true },
    { name: "Environment", total: 25, unlocked: true },
    { name: "Technology", total: 40, unlocked: false },
    { name: "Health", total: 30, unlocked: false },
    { name: "Culture", total: 25, unlocked: false },
  ],
};

const { width } = Dimensions.get("window");

export default function CardDetail() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      {/* Header Flashcard Info */}
      <View style={styles.headerBox}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            router.replace("/Card");
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>

        {cardSet.isBestseller && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>BESTSELLER</Text>
          </View>
        )}
        <Text style={styles.headerTitle}>{cardSet.name}</Text>
        <Image source={cardSet.cover} style={styles.headerImage} />
      </View>

      {/* Nội dung chính */}
      <View style={styles.contentBox}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardSetTitle}>{cardSet.name}</Text>
          <Text style={styles.price}>${cardSet.price.toFixed(2)}</Text>
        </View>
        <Text style={styles.subInfo}>
          {cardSet.totalCards} cards • {cardSet.topics.length} topics
        </Text>
        <Text style={styles.sectionTitle}>About this flashcard set</Text>
        <Text style={styles.description}>{cardSet.description}</Text>

        {/* Danh sách chủ đề */}
        <ScrollView
          style={{ marginTop: 12 }}
          showsVerticalScrollIndicator={false}
        >
          {cardSet.topics.map((topic, idx) => (
            <View style={styles.topicRow} key={topic.name}>
              <Text style={styles.topicIndex}>
                {String(idx + 1).padStart(2, "0")}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.topicTitle}>{topic.name}</Text>
                <Text style={styles.topicSubtitle}>{topic.total} cards</Text>
              </View>
              {topic.unlocked ? (
                <TouchableOpacity style={styles.startBtn}>
                  <Ionicons name="play" size={24} color="#fff" />
                </TouchableOpacity>
              ) : (
                <View style={styles.lockBtn}>
                  <Ionicons name="lock-closed" size={22} color="#bfc8d6" />
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Thanh action dưới cùng */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.favBtn}>
          <MaterialIcons name="star-border" size={28} color="#FF7F00" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyBtn}>
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
            Buy Now
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerBox: {
    backgroundColor: "#FFEFF6",
    paddingTop: 40,
    paddingBottom: 24,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    alignItems: "flex-start",
    position: "relative",
  },
  backBtn: {
    position: "absolute",
    left: 18,
    top: 48,
    zIndex: 99,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 4,
  },
  badge: {
    marginTop: 20,
    backgroundColor: "#FFEB3B",
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 3,
    marginBottom: 6,
  },
  badgeText: { color: "#222", fontWeight: "bold", fontSize: 13 },
  headerTitle: {
    fontSize: 25,
    fontWeight: "700",
    color: "#2C2C2C",
    marginTop: 6,
    marginBottom: 12,
  },
  headerImage: {
    width: width * 0.43,
    height: width * 0.43,
    position: "absolute",
    right: 8,
    top: 42,
    resizeMode: "contain",
  },
  contentBox: {
    backgroundColor: "#fff",
    marginTop: -32,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 22,
    flex: 1,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 6,
  },
  cardSetTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    flex: 1,
    flexWrap: "wrap",
  },
  price: {
    fontSize: 22,
    color: "#2C4BFF",
    fontWeight: "bold",
  },
  subInfo: {
    color: "#BFC8D6",
    marginBottom: 10,
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 3,
    color: "#232323",
  },
  description: {
    color: "#444",
    fontSize: 15,
    marginBottom: 12,
    lineHeight: 22,
  },
  topicRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#F3F3F7",
  },
  topicIndex: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#C5C7D0",
    width: 38,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#232323",
  },
  topicSubtitle: {
    fontSize: 13,
    color: "#BFC8D6",
    marginTop: 2,
  },
  startBtn: {
    backgroundColor: "#2C4BFF",
    borderRadius: 50,
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
  },
  lockBtn: {
    backgroundColor: "#F4F4FB",
    borderRadius: 50,
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.7,
  },
  bottomBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 14,
    paddingBottom: 28,
    shadowColor: "#222",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  favBtn: {
    backgroundColor: "#FFEFF6",
    padding: 14,
    borderRadius: 16,
    marginRight: 12,
  },
  buyBtn: {
    flex: 1,
    backgroundColor: "#2C4BFF",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
