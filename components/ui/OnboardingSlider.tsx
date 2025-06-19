import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { lightTheme, darkTheme } from "../../app/theme";
import { useDarkMode } from "../../app/DarkModeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;

const slides = [
  {
    key: "slide1",
    title: "Thousands of free flashcard sets",
    description:
      "Explore a wide variety of flashcard sets to help you learn any subject.",
    image: require("../../assets/images/onboarding1.png"),
  },
  {
    key: "slide2",
    title: "Learn anytime, anywhere",
    description:
      "Practice your flashcards on the go and easily track your learning progress.",
    image: require("../../assets/images/onboarding2.png"),
  },
  {
    key: "slide3",
    title: "Personalize your study plan",
    description:
      "Create your own flashcard sets and customize your learning for the best results.",
    image: require("../../assets/images/onboarding3.png"),
  },
];

type Props = {
  onFinish: () => void;
  onSignUp: () => void;
  onLogin: () => void;
};

const OnboardingSlider: React.FC<Props> = ({ onFinish, onSignUp, onLogin }) => {
  const [current, setCurrent] = React.useState(0);
  const { darkMode } = useDarkMode();
  const theme = darkMode ? darkTheme : lightTheme;

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
        <Text style={[styles.skipText, { color: theme.subText }]}>Skip</Text>
      </TouchableOpacity>
      <Image
        source={slides[current].image}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={[styles.title, { color: theme.text }]}>
        {slides[current].title}
      </Text>
      <Text style={[styles.description, { color: theme.subText }]}>
        {slides[current].description}
      </Text>
      <View style={styles.dots}>
        {slides.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.dot,
              {
                backgroundColor:
                  current === idx ? theme.primary : theme.section,
                width: current === idx ? scale(18) : scale(8),
                height: scale(8),
                borderRadius: scale(4),
              },
            ]}
          />
        ))}
      </View>

      {current === slides.length - 1 ? (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.signUpBtn, { backgroundColor: theme.primary }]}
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
                borderColor: theme.primary,
                borderWidth: 1.5,
              },
            ]}
            onPress={onLogin}
          >
            <Text style={[styles.loginText, { color: theme.primary }]}>
              Log in
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: theme.primary }]}
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
    alignItems: "center",
    justifyContent: "center",
  },
  skip: {
    position: "absolute",
    top: scale(48),
    right: scale(24),
    zIndex: 10,
  },
  skipText: {
    fontSize: scale(16),
  },
  image: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    marginTop: scale(24),
    marginBottom: scale(32),
  },
  title: {
    fontSize: scale(22),
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: scale(14),
  },
  description: {
    fontSize: scale(16),
    textAlign: "center",
    maxWidth: "80%",
    marginBottom: scale(26),
  },
  dots: {
    flexDirection: "row",
    marginBottom: scale(34),
  },
  dot: {
    marginHorizontal: scale(4),
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    width: "80%",
    marginTop: scale(16),
  },
  signUpBtn: {
    flex: 1,
    borderRadius: scale(8),
    paddingVertical: scale(14),
    marginRight: scale(10),
    alignItems: "center",
  },
  signUpText: {
    fontWeight: "bold",
    fontSize: scale(16),
  },
  loginBtn: {
    flex: 1,
    borderRadius: scale(8),
    paddingVertical: scale(14),
    alignItems: "center",
  },
  loginText: {
    fontWeight: "bold",
    fontSize: scale(16),
  },
  nextBtn: {
    borderRadius: scale(8),
    paddingVertical: scale(14),
    paddingHorizontal: scale(32),
    marginTop: scale(16),
    alignItems: "center",
  },
  nextText: {
    fontWeight: "bold",
    fontSize: scale(16),
  },
});

export default OnboardingSlider;
