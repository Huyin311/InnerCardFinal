//app/home.tsx
import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
} from "react-native";
import { Colors } from "../constants/Colors";
import CustomTabBar from "../components/CustomTabBar";

const user = {
  name: "Kristin",
  avatar: require("../assets/images/avatar.png"),
};

const learningToday = {
  learned: 46,
  target: 60,
};

const plans = [
  { name: "Packaging Design", progress: 40, total: 48 },
  { name: "Product Design", progress: 6, total: 24 },
];

// Animation constants
const HEADER_MAX_HEIGHT = 140; // padding 48+28 + content
const HEADER_MIN_HEIGHT =
  90 + (Platform.OS === "ios" ? 0 : StatusBar.currentHeight || 0);
const AVATAR_MAX = 48;
const AVATAR_MIN = 40;
const TITLE_MAX = 24;
const TITLE_MIN = 17;

export default function HomeScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;

  // Animate header height, avatar size, title size, sub opacity
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 48],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: "clamp",
  });

  const avatarSize = scrollY.interpolate({
    inputRange: [0, 48],
    outputRange: [AVATAR_MAX, AVATAR_MIN],
    extrapolate: "clamp",
  });

  const titleSize = scrollY.interpolate({
    inputRange: [0, 48],
    outputRange: [TITLE_MAX, 28],
    extrapolate: "clamp",
  });

  const subOpacity = scrollY.interpolate({
    inputRange: [0, 32],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <View style={{ flex: 1, backgroundColor: Colors.light.background }}>
      {/* Animated Header */}
      <Animated.View
        style={[
          styles.header,
          {
            height: headerHeight,
            paddingTop: 48,
            paddingBottom: 28,
          },
        ]}
      >
        <View style={{ flex: 1, position: "relative", height: 56 }}>
          <Animated.Text
            style={[
              styles.headerHi,
              {
                fontSize: titleSize,
                position: "absolute",
                top: 14,
                left: 0,
                right: 0,
                zIndex: 2,
              },
            ]}
          >
            Hi, {user.name}
          </Animated.Text>
          <Animated.Text
            style={[
              styles.headerSub,
              {
                opacity: subOpacity,
                position: "absolute",
                top: 44, // Điều chỉnh cho phù hợp với fontSize bạn chọn
                left: 0,
                right: 0,
                zIndex: 1,
              },
            ]}
          >
            Let&apos;s start learning
          </Animated.Text>
        </View>
        <Animated.Image
          source={user.avatar}
          style={[
            styles.avatar,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize.interpolate
                ? avatarSize.interpolate({
                    inputRange: [AVATAR_MIN, AVATAR_MAX],
                    outputRange: [AVATAR_MIN / 2, AVATAR_MAX / 2],
                  })
                : AVATAR_MAX / 2,
            },
          ]}
        />
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{
          paddingBottom: 118,
          paddingTop: HEADER_MAX_HEIGHT,
        }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
      >
        {/* Progress card */}
        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Learned today</Text>
            <TouchableOpacity>
              <Text style={styles.progressLink}>My courses</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.progressMainRow}>
            <Text style={styles.progressMain}>
              <Text style={styles.progressNumber}>
                {learningToday.learned}min
              </Text>
              <Text style={styles.progressTotal}>
                {" "}
                / {learningToday.target}min
              </Text>
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${(learningToday.learned / learningToday.target) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* Suggestion Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.suggestScroll}
        >
          <View style={styles.suggestCard}>
            <Text style={styles.suggestTitle}>
              What do you want to learn today?
            </Text>
            <TouchableOpacity style={styles.suggestBtn}>
              <Text style={styles.suggestBtnText}>Get Started</Text>
            </TouchableOpacity>
            <Text style={[styles.suggestImg, { fontSize: 54 }]}>🧑‍🎓</Text>
          </View>
          <View style={[styles.suggestCard, { marginLeft: 12 }]}>
            <View style={styles.suggestImgSmall}>
              <Text style={{ fontSize: 44, textAlign: "center" }}>✅</Text>
            </View>
          </View>
        </ScrollView>

        {/* Learning Plan */}
        <Text style={styles.planTitle}>Learning Plan</Text>
        <View style={styles.planCard}>
          {plans.map((plan, idx) => (
            <View style={styles.planRow} key={plan.name}>
              <View style={styles.planProgressCircle}>
                <View
                  style={[
                    styles.planProgressFill,
                    {
                      width: `${(plan.progress / plan.total) * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planProgress}>
                <Text style={styles.planProgressBold}>{plan.progress}</Text>/
                {plan.total}
              </Text>
            </View>
          ))}
        </View>

        {/* Meetup Banner */}
        <View style={styles.banner}>
          <View>
            <Text style={styles.bannerTitle}>Meetup</Text>
            <Text style={styles.bannerSub}>
              Off-line exchange of learning experience
            </Text>
          </View>
          <Text style={styles.bannerImg}>👨‍👩‍👧‍👦</Text>
        </View>

        <View style={styles.banner}>
          <View>
            <Text style={styles.bannerTitle}>Meetup</Text>
            <Text style={styles.bannerSub}>
              Off-line exchange of learning experience
            </Text>
          </View>
          <Text style={styles.bannerImg}>👨‍👩‍👧‍👦</Text>
        </View>

        <View style={styles.banner}>
          <View>
            <Text style={styles.bannerTitle}>Meetup</Text>
            <Text style={styles.bannerSub}>
              Off-line exchange of learning experience
            </Text>
          </View>
          <Text style={styles.bannerImg}>👨‍👩‍👧‍👦</Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    // paddingTop, paddingBottom, height animated
  },
  headerHi: {
    fontWeight: "bold",
    color: Colors.light.background,
    marginBottom: 2,
  },
  headerSub: {
    color: Colors.light.background,
    fontSize: 15,
    opacity: 0.9,
  },
  avatar: {
    borderWidth: 2,
    borderColor: Colors.light.background,
    backgroundColor: Colors.light.background,
    // width, height, borderRadius animated
  },
  progressCard: {
    marginHorizontal: 24,
    marginTop: 20,
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 18,
    shadowColor: Colors.light.icon,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: {
    color: Colors.light.icon,
    fontSize: 13,
  },
  progressLink: {
    color: Colors.light.tint,
    fontSize: 13,
    fontWeight: "bold",
  },
  progressMainRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 6,
  },
  progressMain: {
    fontSize: 17,
    fontWeight: "500",
    color: Colors.light.text,
  },
  progressNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  progressTotal: {
    fontSize: 16,
    color: Colors.light.icon,
    fontWeight: "400",
  },
  progressBarBg: {
    width: "100%",
    height: 6,
    backgroundColor: Colors.light.muted,
    borderRadius: 4,
    marginTop: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: 6,
    borderRadius: 4,
    backgroundColor: Colors.light.accent,
  },
  suggestScroll: {
    marginTop: 28,
    paddingLeft: 24,
  },
  suggestCard: {
    width: 220,
    backgroundColor: Colors.light.accent + "14",
    borderRadius: 16,
    padding: 20,
    marginRight: 12,
    position: "relative",
    overflow: "hidden",
    justifyContent: "flex-start",
  },
  suggestTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 16,
  },
  suggestBtn: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  suggestBtnText: {
    color: Colors.light.background,
    fontWeight: "bold",
    fontSize: 15,
  },
  suggestImg: {
    position: "absolute",
    right: 8,
    bottom: 8,
  },
  suggestImgSmall: {
    width: 80,
    height: 80,
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  planTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.text,
    marginLeft: 24,
    marginTop: 34,
    marginBottom: 8,
  },
  planCard: {
    marginHorizontal: 24,
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowColor: Colors.light.icon,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  planRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  planProgressCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: Colors.light.muted,
    marginRight: 14,
    backgroundColor: Colors.light.background,
    overflow: "hidden",
  },
  planProgressFill: {
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    borderRadius: 13,
    backgroundColor: Colors.light.tint,
  },
  planName: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
    fontWeight: "500",
  },
  planProgress: {
    fontSize: 14,
    color: Colors.light.icon,
    fontWeight: "400",
  },
  planProgressBold: {
    color: Colors.light.text,
    fontWeight: "bold",
    fontSize: 15,
  },
  banner: {
    marginHorizontal: 24,
    marginTop: 24,
    borderRadius: 18,
    backgroundColor: Colors.light.accent + "14",
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: Colors.light.icon,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  bannerTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 3,
  },
  bannerSub: {
    color: Colors.light.icon,
    fontSize: 13,
    width: 120,
  },
  bannerImg: {
    fontSize: 48,
    marginLeft: 12,
  },
});
