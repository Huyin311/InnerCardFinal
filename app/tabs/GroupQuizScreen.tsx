import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Giả lập quyền nhóm trưởng, bạn thay bằng lấy từ user hiện tại
const isAdmin = true;

// Giả lập dữ liệu bài kiểm tra
const DUMMY_QUIZZES = [
  {
    id: "1",
    title: "Quiz 1: Vocabulary",
    questions: [
      {
        id: "q1",
        text: "What is the meaning of 'apple'?",
        choices: ["A. Táo", "B. Cam", "C. Chuối", "D. Dưa"],
        answer: 0,
      },
      // ... thêm câu hỏi
    ],
  },
  // ... thêm quiz khác
];

export function GroupQuizScreen() {
  const [quizzes, setQuizzes] = useState(DUMMY_QUIZZES);
  const [showCreate, setShowCreate] = useState(false);

  // State cho tạo quiz
  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [newQuestions, setNewQuestions] = useState<any[]>([]);
  const [curQuestion, setCurQuestion] = useState("");
  const [curAnswers, setCurAnswers] = useState<string[]>(["", "", "", ""]);
  const [curCorrect, setCurCorrect] = useState<number>(0);

  // Thành viên làm bài
  const [doingQuiz, setDoingQuiz] = useState<any>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);

  // Tạo quiz
  const handleAddQuestion = () => {
    if (!curQuestion.trim() || curAnswers.some((a) => !a.trim())) {
      Alert.alert("Vui lòng nhập đủ câu hỏi và đáp án!");
      return;
    }
    setNewQuestions((prev) => [
      ...prev,
      {
        id: `q${prev.length + 1}`,
        text: curQuestion,
        choices: [...curAnswers],
        answer: curCorrect,
      },
    ]);
    setCurQuestion("");
    setCurAnswers(["", "", "", ""]);
    setCurCorrect(0);
  };
  const handleSaveQuiz = () => {
    if (!newQuizTitle.trim() || newQuestions.length === 0) {
      Alert.alert("Nhập tên và ít nhất 1 câu hỏi!");
      return;
    }
    setQuizzes((prev) => [
      ...prev,
      {
        id: (prev.length + 1).toString(),
        title: newQuizTitle,
        questions: newQuestions,
      },
    ]);
    // Reset form
    setNewQuizTitle("");
    setNewQuestions([]);
    setShowCreate(false);
  };

  // Làm bài
  const handleStartQuiz = (quiz: any) => {
    setDoingQuiz(quiz);
    setUserAnswers(Array(quiz.questions.length).fill(null));
    setShowResult(false);
  };
  const handleSubmitQuiz = () => {
    if (userAnswers.includes(null)) {
      Alert.alert("Bạn chưa trả lời hết câu hỏi!");
      return;
    }
    setShowResult(true);
  };

  // Kết quả
  const renderResult = () => {
    let score = 0;
    doingQuiz.questions.forEach((q: any, idx: number) => {
      if (userAnswers[idx] === q.answer) score++;
    });
    return (
      <View style={styles.quizBox}>
        <Text style={styles.resultTitle}>Kết quả</Text>
        <Text style={styles.resultScore}>
          {score} / {doingQuiz.questions.length} điểm
        </Text>
        <Text style={styles.resultExplain}>Chi tiết:</Text>
        {doingQuiz.questions.map((q: any, idx: number) => (
          <View key={q.id} style={{ marginBottom: 10 }}>
            <Text style={{ color: "#333" }}>
              {idx + 1}. {q.text}
            </Text>
            <Text>
              Đáp án đúng:{" "}
              <Text style={{ color: "#43A047" }}>{q.choices[q.answer]}</Text>
            </Text>
            <Text>
              Bạn chọn:{" "}
              <Text
                style={{
                  color: userAnswers[idx] === q.answer ? "#43A047" : "#E53935",
                }}
              >
                {userAnswers[idx] !== null
                  ? q.choices[userAnswers[idx]]
                  : "Chưa chọn"}
              </Text>
            </Text>
          </View>
        ))}
        <TouchableOpacity
          style={styles.button}
          onPress={() => setDoingQuiz(null)}
        >
          <Text style={{ color: "#fff" }}>Quay lại danh sách</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Giao diện làm bài
  if (doingQuiz) {
    if (showResult) return renderResult();
    return (
      <View style={styles.quizBox}>
        <Text style={styles.quizTitle}>{doingQuiz.title}</Text>
        <Text style={styles.quizStep}>
          Số câu: {doingQuiz.questions.length}
        </Text>
        <ScrollView>
          {doingQuiz.questions.map((q: any, idx: number) => (
            <View key={q.id} style={styles.questionBox}>
              <Text style={styles.qText}>
                {idx + 1}. {q.text}
              </Text>
              {q.choices.map((ans: string, aIdx: number) => (
                <TouchableOpacity
                  key={aIdx}
                  style={[
                    styles.choiceBtn,
                    userAnswers[idx] === aIdx && {
                      backgroundColor: "#4F8CFF22",
                      borderColor: "#4F8CFF",
                    },
                  ]}
                  onPress={() => {
                    const updated = [...userAnswers];
                    updated[idx] = aIdx;
                    setUserAnswers(updated);
                  }}
                >
                  <Text style={{ color: "#2C4BFF" }}>{ans}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.button} onPress={handleSubmitQuiz}>
          <Text style={{ color: "#fff" }}>Nộp bài</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Giao diện tạo quiz (chỉ nhóm trưởng)
  if (showCreate && isAdmin) {
    return (
      <View style={styles.quizBox}>
        <Text style={styles.quizTitle}>Tạo bài kiểm tra</Text>
        <TextInput
          style={styles.input}
          placeholder="Tên bài kiểm tra"
          value={newQuizTitle}
          onChangeText={setNewQuizTitle}
        />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thêm câu hỏi</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập nội dung câu hỏi"
            value={curQuestion}
            onChangeText={setCurQuestion}
          />
          {curAnswers.map((ans, idx) => (
            <View
              key={idx}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <TouchableOpacity
                style={[
                  styles.radioBox,
                  curCorrect === idx && {
                    borderColor: "#4F8CFF",
                    backgroundColor: "#4F8CFF22",
                  },
                ]}
                onPress={() => setCurCorrect(idx)}
              >
                {curCorrect === idx && (
                  <Ionicons name="checkmark" size={16} color="#4F8CFF" />
                )}
              </TouchableOpacity>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 0 }]}
                placeholder={`Đáp án ${String.fromCharCode(65 + idx)}`}
                value={ans}
                onChangeText={(txt) => {
                  const arr = [...curAnswers];
                  arr[idx] = txt;
                  setCurAnswers(arr);
                }}
              />
            </View>
          ))}
          <TouchableOpacity
            style={styles.buttonOutline}
            onPress={handleAddQuestion}
          >
            <Text style={{ color: "#4F8CFF" }}>Thêm câu hỏi</Text>
          </TouchableOpacity>
          <Text style={{ marginTop: 8, color: "#2C4BFF" }}>
            Đã có {newQuestions.length} câu hỏi
          </Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleSaveQuiz}>
          <Text style={{ color: "#fff" }}>Lưu bài kiểm tra</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowCreate(false)}
          style={{ marginTop: 10 }}
        >
          <Text style={{ color: "#888" }}>Hủy</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Giao diện danh sách
  return (
    <View style={{ flex: 1, backgroundColor: "#F7F9FC" }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bài kiểm tra nhóm</Text>
        {isAdmin && (
          <TouchableOpacity
            onPress={() => setShowCreate(true)}
            style={styles.headerBtn}
          >
            <Ionicons name="add-circle-outline" size={24} color="#4F8CFF" />
            <Text style={{ color: "#4F8CFF", marginLeft: 6 }}>
              Tạo bài kiểm tra
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={quizzes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.quizListItem}
            onPress={() => handleStartQuiz(item)}
          >
            <Ionicons name="document-text-outline" size={28} color="#4F8CFF" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.quizName}>{item.title}</Text>
              <Text style={styles.quizMeta}>
                Số câu: {item.questions.length}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#bbb" />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 40, color: "#888" }}>
            Chưa có bài kiểm tra nào
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#fff",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0.6,
    borderBottomColor: "#E4EAF2",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C4BFF",
  },
  headerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6ECFF",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  quizListItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 16,
    marginBottom: 13,
    elevation: 2,
    shadowColor: "#2C4BFF",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  quizName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C4BFF",
  },
  quizMeta: {
    fontSize: 13,
    color: "#888",
    marginTop: 3,
  },
  quizBox: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 18,
    padding: 18,
    elevation: 3,
    shadowColor: "#2C4BFF",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C4BFF",
    marginBottom: 8,
  },
  quizStep: { color: "#888", marginBottom: 12 },
  questionBox: {
    marginBottom: 14,
    backgroundColor: "#F7F9FC",
    borderRadius: 10,
    padding: 10,
  },
  qText: { marginBottom: 7, color: "#222", fontWeight: "500" },
  choiceBtn: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 6,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#2C4BFF",
    padding: 13,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 18,
  },
  buttonOutline: {
    borderWidth: 1.5,
    borderColor: "#4F8CFF",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E4EAF2",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    marginRight: 10,
    backgroundColor: "#F7F9FC",
  },
  radioBox: {
    width: 22,
    height: 22,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#bbb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    backgroundColor: "#fff",
  },
  section: { marginTop: 7, marginBottom: 8 },
  sectionTitle: {
    color: "#2C4BFF",
    fontWeight: "bold",
    marginBottom: 7,
    fontSize: 15,
  },
  resultTitle: {
    color: "#43A047",
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 6,
  },
  resultScore: { color: "#2C4BFF", fontSize: 18, marginBottom: 8 },
  resultExplain: { color: "#888", fontWeight: "bold", marginBottom: 10 },
});
