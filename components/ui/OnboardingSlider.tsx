import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Colors } from "../constants/Colors";

const { width } = Dimensions.get("window");

const slides = [
  {
    key: "slide1",
    title: "Thousands of free flashcard sets",
    description:
      "Explore a wide variety of flashcard sets to help you learn any subject.",
    image: require("../assets/onboarding1.png"),
  },
  {
    key: "slide2",
    title: "Learn anytime, anywhere",
    description:
      "Practice your flashcards on the go and easily track your learning progress.",
    image: require("../assets/onboarding2.png"),
  },
  {
    key: "slide3",
    title: "Personalize your study plan",
    description:
      "Create your own flashcard sets and customize your learning for the best results.",
    image: require("../assets/onboarding3.png"),
  },
];

type Props = {
  onFinish: () => void;
  onSignUp: () => void;
  onLogin: () => void;
};

const OnboardingSlider: React.FC<Props> = ({ onFinish, onSignUp, onLogin }) => {
  const [current, setCurrent] = React.useState(0);
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  const goNext = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    } else {
      onFinish();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity style={styles.skip} onPress={onFinish}>
        <Text style={[styles.skipText, { color: theme.icon }]}>Skip</Text>
      </TouchableOpacity>
      <Image
        source={slides[current].image}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={[styles.title, { color: theme.text }]}>
        {slides[current].title}
      </Text>
      <Text style={[styles.description, { color: theme.icon }]}>
        {slides[current].description}
      </Text>
      <View style={styles.dots}>
        {slides.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.dot,
              {
                backgroundColor: current === idx ? theme.tint : theme.muted,
                width: current === idx ? 18 : 8,
              },
            ]}
          />
        ))}
      </View>

      {current === slides.length - 1 ? (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.signUpBtn, { backgroundColor: theme.tint }]}
            onPress={onSignUp}
          >
            <Text style={[styles.signUpText, { color: theme.background }]}>
              Sign up
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.loginBtn,
              {
                backgroundColor: theme.background,
                borderColor: theme.tint,
                borderWidth: 1.5,
              },
            ]}
            onPress={onLogin}
          >
            <Text style={[styles.loginText, { color: theme.tint }]}>
              Log in
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: theme.tint }]}
          onPress={goNext}
        >
          <Text style={[styles.nextText, { color: theme.background }]}>
            Next
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
    alignItems: "center",
  },
  skip: {
    position: "absolute",
    top: 48,
    right: 24,
    zIndex: 10,
  },
  skipText: {
    fontSize: 16,
  },
  image: {
    width: width * 0.7,
    height: width * 0.7,
    marginTop: 24,
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 14,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    maxWidth: "80%",
    marginBottom: 26,
  },
  dots: {
    flexDirection: "row",
    marginBottom: 34,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    width: "80%",
    marginTop: 16,
  },
  signUpBtn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 14,
    marginRight: 10,
    alignItems: "center",
  },
  signUpText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  loginBtn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  loginText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  nextBtn: {
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 16,
  },
  nextText: {
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default OnboardingSlider;
