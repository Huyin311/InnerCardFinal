//app/tabs/Card.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Pressable,
  Dimensions,
  Animated,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

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
const filterCategories = [
  "Design",
  "Painting",
  "Coding",
  "Music",
  "Visual identity",
  "Mathmatics",
];
const filterDurations = [
  "3-8 Hours",
  "8-14 Hours",
  "14-20 Hours",
  "20-24 Hours",
  "24-30 Hours",
];

const { height } = Dimensions.get("window");

export default function Card() {
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState("All");
  const [filterVisible, setFilterVisible] = useState(false);

  // Filter modal state
  const [selectedCategories, setSelectedCategories] = useState([
    "Design",
    "Coding",
  ]);
  const [selectedDuration, setSelectedDuration] = useState("3-8 Hours");
  const [priceRange, setPriceRange] = useState([90, 200]);

  // Animated overlay & content
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (filterVisible) {
      Animated.parallel([
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(contentAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(contentAnim, {
          toValue: height,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [filterVisible]);

  // Lọc card dựa trên tab đang chọn
  const filterCards = () => {
    if (selectedTab === "All") return cards;
    if (selectedTab === "Popular") {
      return cards.filter((card) => card.price === "$190");
    }
    if (selectedTab === "New") {
      return cards.filter((card) => parseInt(card.duration) < 15);
    }
    return cards;
  };

  // Toggle category selection in filter modal
  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  // Clear filter
  const clearFilter = () => {
    setSelectedCategories([]);
    setSelectedDuration("");
    setPriceRange([90, 200]);
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
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons name="options" size={20} color="#BFC8D6" />
        </TouchableOpacity>
      </View>

      {/* Category Cards */}
      <FlatList
        data={categories}
        horizontal
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingLeft: 20,
          paddingBottom: 0,
          flexGrow: 1,
        }}
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
            <TouchableOpacity
              style={styles.cardItem}
              onPress={() => navigation.navigate("CardDetail")}
            >
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
            </TouchableOpacity>
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

      {/* Filter Modal with animated overlay and slide up content */}
      <Modal
        visible={filterVisible}
        transparent
        animationType="none"
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.modalRoot}>
          {/* Overlay */}
          <TouchableWithoutFeedback onPress={() => setFilterVisible(false)}>
            <Animated.View
              pointerEvents={filterVisible ? "auto" : "none"}
              style={[styles.modalOverlay, { opacity: overlayAnim }]}
            />
          </TouchableWithoutFeedback>
          {/* Content */}
          <Animated.View
            style={[
              styles.modalContainer,
              { transform: [{ translateY: contentAnim }] },
            ]}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setFilterVisible(false)}>
                <Ionicons name="close" size={28} color="#222" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Search Filter</Text>
              <View style={{ width: 28 }} />
            </View>

            {/* Categories */}
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.rowWrap}>
              {filterCategories.map((cat) => (
                <Pressable
                  key={cat}
                  style={[
                    styles.chip,
                    selectedCategories.includes(cat) && styles.chipActive,
                  ]}
                  onPress={() => toggleCategory(cat)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedCategories.includes(cat) && styles.chipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Price range (giản lược, chưa có slider thực) */}
            <Text style={styles.sectionTitle}>Price</Text>
            <View style={styles.priceRow}>
              <View style={styles.priceCircle} />
              <View style={styles.priceLine} />
              <View style={styles.priceCircle} />
            </View>
            <View style={styles.priceLabelRow}>
              <Text style={styles.priceText}>${priceRange[0]}</Text>
              <Text style={styles.priceText}>${priceRange[1]}</Text>
            </View>

            {/* Duration */}
            <Text style={styles.sectionTitle}>Duration</Text>
            <View style={styles.rowWrap}>
              {filterDurations.map((d) => (
                <Pressable
                  key={d}
                  style={[
                    styles.chip,
                    selectedDuration === d && styles.chipActive,
                  ]}
                  onPress={() => setSelectedDuration(d)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedDuration === d && styles.chipTextActive,
                    ]}
                  >
                    {d}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Buttons */}
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.clearBtn} onPress={clearFilter}>
                <Text style={[styles.btnText, { color: "#2C4BFF" }]}>
                  Clear
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => setFilterVisible(false)}
              >
                <Text style={[styles.btnText, { color: "#fff" }]}>
                  Apply Filter
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 0 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 18,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  title: { fontSize: 30, fontWeight: "bold", color: "#222" },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#eee" },
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
  filterBtn: { padding: 6, marginLeft: 10 },
  categoriesRow: {
    marginHorizontal: 24,
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
  categoryTitle: { fontSize: 15, fontWeight: "bold", color: "#408BFF" },
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
  tabText: { fontSize: 15, color: "#BFC8D6", fontWeight: "600" },
  tabActive: {
    backgroundColor: "#3B5EFF",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 6,
    marginLeft: 8,
  },
  tabActiveText: { fontSize: 15, color: "#fff", fontWeight: "bold" },
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
  cardTitle: { fontSize: 17, fontWeight: "bold", color: "#222" },
  cardAuthor: { fontSize: 13, color: "#BFC8D6", marginLeft: 2 },
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
  cardDuration: { fontSize: 13, color: "#FF6D00", fontWeight: "600" },
  // Modal & Overlay
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(40,40,50,0.7)",
    zIndex: 1,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingVertical: 24,
    paddingHorizontal: 20,
    minHeight: height * 0.68,
    zIndex: 2,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 22, fontWeight: "700", color: "#222" },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginVertical: 10,
    color: "#232323",
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8,
  },
  chip: {
    backgroundColor: "#F4F4FC",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 4,
  },
  chipActive: { backgroundColor: "#2C4BFF" },
  chipText: { color: "#b9b9c9", fontWeight: "500", fontSize: 15 },
  chipTextActive: { color: "#fff" },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    marginLeft: 2,
  },
  priceCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#2C4BFF",
    backgroundColor: "#fff",
    zIndex: 2,
  },
  priceLine: {
    flex: 1,
    height: 3,
    backgroundColor: "#EAEAEA",
    marginHorizontal: -7,
    zIndex: 1,
    borderRadius: 2,
  },
  priceLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 4,
    marginBottom: 8,
  },
  priceText: { fontSize: 17, fontWeight: "600", color: "#222" },
  btnRow: {
    flexDirection: "row",
    marginTop: 18,
    marginBottom: 10,
    justifyContent: "space-between",
  },
  clearBtn: {
    borderWidth: 1,
    borderColor: "#2C4BFF",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 30,
  },
  applyBtn: {
    backgroundColor: "#2C4BFF",
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 30,
  },
  btnText: { fontSize: 17, fontWeight: "600" },
});
