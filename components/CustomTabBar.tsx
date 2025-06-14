// CustomTabBar
import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";

const ICON_MAP = {
  Home: (color) => <Ionicons name="home" size={28} color={color} />,
  Card: (color) => <MaterialIcons name="style" size={28} color={color} />,
};

const width = Dimensions.get("window").width;
const tabWidth = width / 2;

export default function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.container}>
      {state.routes.map((route, idx) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? options.title ?? route.name;
        const isFocused = state.index === idx;
        const color = isFocused ? Colors.light.tint : Colors.light.muted;

        const IconComponent = ICON_MAP[label];

        return (
          <TouchableOpacity
            key={route.key}
            style={[styles.tabItem, { width: tabWidth }]}
            onPress={() => {
              if (!isFocused) navigation.navigate(route.name);
            }}
            activeOpacity={0.8}
          >
            {IconComponent && IconComponent(color)}
            <Text
              style={[
                styles.tabLabel,
                {
                  color: color,
                  fontWeight: isFocused ? "bold" : "600",
                  marginTop: 4,
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
    height: 70,
    borderTopWidth: 1,
    borderTopColor: Colors.light.muted + "33",
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "flex-end",
    height: 70,
    position: "relative",
    paddingBottom: 8,
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
});
