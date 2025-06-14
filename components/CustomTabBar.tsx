import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Colors } from "../constants/Colors";

// SVG ICONS (code only, no images)
function HomeIcon({ color }: { color: string }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <View
        style={{
          width: 28,
          height: 28,
          backgroundColor: color,
          borderRadius: 8,
          marginBottom: 2,
          transform: [{ rotate: "45deg" }],
        }}
      />
      <View
        style={{
          position: "absolute",
          width: 14,
          height: 14,
          backgroundColor: "#fff",
          top: 11,
          left: 7,
          borderRadius: 4,
        }}
      />
    </View>
  );
}

function CardIcon({ color }: { color: string }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <View
        style={{
          width: 28,
          height: 20,
          borderRadius: 6,
          borderWidth: 2,
          borderColor: color,
          backgroundColor: color + "11",
          marginBottom: 2,
        }}
      />
      <View
        style={{
          width: 18,
          height: 3,
          backgroundColor: color,
          borderRadius: 2,
          position: "absolute",
          bottom: 8,
        }}
      />
    </View>
  );
}

function SearchIcon({ color, bg }: { color: string; bg: string }) {
  return (
    <View
      style={{
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: bg,
        alignItems: "center",
        justifyContent: "center",
        marginTop: -32,
        marginBottom: 0,
        shadowColor: "#000",
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          borderWidth: 2.5,
          borderColor: color,
          alignItems: "center",
          justifyContent: "center",
        }}
      />
      <View
        style={{
          position: "absolute",
          width: 14,
          height: 3,
          backgroundColor: color,
          borderRadius: 2,
          left: 33,
          top: 33,
          transform: [{ rotate: "45deg" }],
        }}
      />
    </View>
  );
}

function MessageIcon({ color }: { color: string }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <View
        style={{
          width: 26,
          height: 18,
          borderRadius: 6,
          backgroundColor: color + "11",
          borderWidth: 2,
          borderColor: color,
          marginBottom: 2,
        }}
      />
      <View
        style={{
          width: 8,
          height: 4,
          backgroundColor: color,
          borderTopLeftRadius: 2,
          borderTopRightRadius: 2,
          alignSelf: "center",
          marginTop: -2,
        }}
      />
    </View>
  );
}

function AccountIcon({ color }: { color: string }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <View
        style={{
          width: 14,
          height: 14,
          borderRadius: 7,
          backgroundColor: color,
          marginBottom: 2,
        }}
      />
      <View
        style={{
          width: 20,
          height: 7,
          borderRadius: 3.5,
          backgroundColor: color + "33",
        }}
      />
    </View>
  );
}

// Tab icon mapping for React Navigation's BottomTabNavigator
const ICON_MAP = {
  Home: HomeIcon,
  Card: CardIcon,
  Search: SearchIcon,
  Message: MessageIcon,
  Account: AccountIcon,
};

const width = Dimensions.get("window").width;
const tabWidth = width / 5;

export default function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.container}>
      {state.routes.map((route, idx) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? options.title ?? route.name;
        const isFocused = state.index === idx;

        let IconComponent = ICON_MAP[label] || (() => null);

        if (label === "Search") {
          // Special middle tab
          return (
            <View key={route.key} style={[styles.tabItem, { width: tabWidth }]}>
              <SearchIcon
                color={Colors.light.tint}
                bg={Colors.light.tint + "11"}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: Colors.light.icon, marginTop: 6 },
                ]}
              >
                {label}
              </Text>
            </View>
          );
        }

        const color = isFocused ? Colors.light.tint : Colors.light.muted;

        return (
          <TouchableOpacity
            key={route.key}
            style={[styles.tabItem, { width: tabWidth }]}
            onPress={() => {
              if (!isFocused) navigation.navigate(route.name);
            }}
            activeOpacity={0.8}
          >
            <IconComponent color={color} />
            <Text
              style={[
                styles.tabLabel,
                {
                  color: color,
                  fontWeight: isFocused ? "bold" : "600",
                  marginTop: 6,
                },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 16,
    alignItems: "flex-end",
    paddingBottom: 8,
    height: 94,
    borderTopWidth: 1,
    borderTopColor: Colors.light.muted + "33",
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "flex-end",
    height: 94,
    position: "relative",
    paddingBottom: 8,
  },
  tabLabel: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
});
