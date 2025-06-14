//app/Card.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
// import CustomTabBar from "@/components/CustomTabBar"; // Không dùng trong file này

const categories = [
  {
    id: "1",
    title: "Language",
    color: "#E8F1FF",
    image: require("../../assets/images/avatar.png"),
  },
  {
    id: "2",
    title: "Painting",
    color: "#FFF4E4",
    image: require("../../assets/images/avatar.png"),
  },
  {
    id: "3",
    title: "Language",
    color: "#E8F1FF",
    image: require("../../assets/images/avatar.png"),
  },
  {
    id: "4",
    title: "Painting",
    color: "#FFF4E4",
    image: require("../../assets/images/avatar.png"),
  },
];

const cards = [
  {
    id: "1",
    title: "Product Design v1.0",
    author: "Robertson Connie",
    price: "$190",
    duration: "16 hours",
    image: require("../../assets/images/avatar.png"),
  },
  {
    id: "2",
    title: "Java Development",
    author: "Nguyen Shane",
    price: "$190",
    duration: "16 hours",
    image: require("../../assets/images/avatar.png"),
  },
  {
    id: "3",
    title: "Visual Design",
    author: "Bert Pullman",
    price: "$250",
    duration: "14 hours",
    image: require("../../assets/images/avatar.png"),
  },
];

const TABS = ["All", "Popular", "New"];

export default function Card() {
  const [selectedTab, setSelectedTab] = useState("All");

  // Lọc card dựa trên tab đang chọn
  const filterCards = () => {
    if (selectedTab === "All") return cards;
    if (selectedTab === "Popular") {
      // Ví dụ: Popular là các card giá $190
      return cards.filter((card) => card.price === "$190");
    }
    if (selectedTab === "New") {
      // Ví dụ: New là các card có duration < 15 hours
      return cards.filter((card) => parseInt(card.duration) < 15);
    }
    return cards;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Card</Text>
        <TouchableOpacity>
          <Image
            source={require("../../assets/images/avatar.png")}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchRow}>
        <Ionicons
          name="search"
          size={18}
          color="#BFC8D6"
          style={{ marginLeft: 8 }}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Find Card"
          placeholderTextColor="#BFC8D6"
        />
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options" size={20} color="#BFC8D6" />
        </TouchableOpacity>
      </View>

      {/* Category Cards */}
      <FlatList
        data={categories}
        horizontal
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
        style={{ marginBottom: 8 }}
        renderItem={({ item: cat }) => (
          <TouchableOpacity
            style={[styles.categoryCard, { backgroundColor: cat.color }]}
            activeOpacity={0.8}
          >
            {cat.image && (
              <Image
                source={cat.image}
                style={styles.categoryImage}
                resizeMode="contain"
              />
            )}
            <Text style={styles.categoryTitle}>{cat.title}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={selectedTab === tab ? styles.tabActive : styles.tab}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              style={
                selectedTab === tab ? styles.tabActiveText : styles.tabText
              }
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Card List */}
      <View style={{ flex: 1 }}>
        <FlatList
          data={filterCards()}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
          renderItem={({ item }) => (
            <View style={styles.cardItem}>
              <View style={styles.cardImageBox}>
                <View style={styles.cardImagePlaceholder} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 2,
                  }}
                >
                  <Ionicons name="person" size={13} color="#BFC8D6" />
                  <Text style={styles.cardAuthor}> {item.author}</Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 8,
                  }}
                >
                  <Text style={styles.cardPrice}>{item.price}</Text>
                  <View style={styles.cardDurationBox}>
                    <Text style={styles.cardDuration}>{item.duration}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#BFC8D6", fontSize: 16 }}>
                No cards found
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 18,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#222",
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#eee",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F8FB",
    borderRadius: 16,
    marginHorizontal: 24,
    paddingHorizontal: 8,
    marginBottom: 18,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 6,
    color: "#222",
    backgroundColor: "transparent",
  },
  filterBtn: {
    padding: 6,
    marginLeft: 10,
  },
  categoriesRow: {
    marginHorizontal: 24,
    // marginBottom bỏ đi, chuyển qua FlatList.style
  },
  categoryCard: {
    width: 140,
    height: 90,
    borderRadius: 16,
    marginRight: 14,
    alignItems: "flex-start",
    justifyContent: "flex-end",
    padding: 14,
    overflow: "hidden",
  },
  categoryImage: {
    position: "absolute",
    top: 4,
    right: 0,
    width: 80,
    height: 80,
    opacity: 0.95,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#408BFF",
  },
  tabsRow: {
    flexDirection: "row",
    marginLeft: 24,
    marginBottom: 10,
    marginTop: -470,
    alignItems: "center",
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  tabText: {
    fontSize: 15,
    color: "#BFC8D6",
    fontWeight: "600",
  },
  tabActive: {
    backgroundColor: "#3B5EFF",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 6,
    marginLeft: 8,
  },
  tabActiveText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "bold",
  },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 24,
    marginBottom: 18,
    padding: 16,
    shadowColor: "#BFC8D6",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImageBox: {
    width: 58,
    height: 58,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  cardImagePlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#D9DBE9",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#222",
  },
  cardAuthor: {
    fontSize: 13,
    color: "#BFC8D6",
    marginLeft: 2,
  },
  cardPrice: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#3B5EFF",
    marginRight: 10,
  },
  cardDurationBox: {
    backgroundColor: "#FFE5D1",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 2,
  },
  cardDuration: {
    fontSize: 13,
    color: "#FF6D00",
    fontWeight: "600",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: "#222",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    paddingTop: 6,
    paddingBottom: 8,
    paddingHorizontal: 10,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  tabBarItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabBarLabel: {
    fontSize: 12,
    color: "#BFC8D6",
    marginTop: 2,
  },
  tabBarItemActive: {},
  tabBarLabelActive: {
    color: "#3B5EFF",
    fontWeight: "bold",
  },
});
