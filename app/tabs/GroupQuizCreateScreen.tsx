import React, { useState, useContext } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
  ScrollView,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { useDarkMode } from "../DarkModeContext";
import { useLanguage } from "../LanguageContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import { supabase } from "../../supabase/supabaseClient";
import { lightTheme, darkTheme } from "../theme";
import { AuthContext } from "../../contexts/AuthContext";
import DateModal from "../../components/DateModal";

// Thêm dayjs để xử lý timezone
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

const TEXT = {
  create_quiz: { vi: "Tạo Quiz nhóm", en: "Create Group Quiz" },
  title: { vi: "Tiêu đề", en: "Title" },
  desc: { vi: "Mô tả", en: "Description" },
  start_time: { vi: "Bắt đầu", en: "Start" },
  end_time: { vi: "Kết thúc", en: "End" },
  add_question: { vi: "Thêm câu hỏi", en: "Add question" },
  import_csv: { vi: "Nhập từ CSV", en: "Import from CSV" },
  save: { vi: "Lưu", en: "Save" },
  cancel: { vi: "Huỷ", en: "Cancel" },
  question: { vi: "Câu hỏi", en: "Question" },
  option: { vi: "Đáp án", en: "Option" },
  correct: { vi: "Đúng", en: "Correct" },
  remove: { vi: "Xoá", en: "Remove" },
  fill_title: { vi: "Hãy nhập tiêu đề quiz!", en: "Please enter quiz title!" },
  fill_question: {
    vi: "Hãy nhập đủ nội dung câu hỏi!",
    en: "Please fill all question fields!",
  },
  quiz_created: { vi: "Đã tạo quiz!", en: "Quiz created!" },
  csv_format: {
    vi: "CSV mẫu: Câu hỏi,Đáp án A,Đáp án B,Đáp án C,Đáp án D,Đáp án đúng (A/B/C/D),Giải thích (tùy chọn)",
    en: "CSV sample: Question,Option A,Option B,Option C,Option D,Correct(A/B/C/D),Explanation(optional)",
  },
  error_csv: {
    vi: "File CSV không hợp lệ hoặc lỗi khi nhập!",
    en: "Invalid CSV file or error importing!",
  },
  success_csv: {
    vi: "Đã nhập câu hỏi từ CSV!",
    en: "Imported questions from CSV!",
  },
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BASE_WIDTH = 390;
const scale = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;

type OptionKey = "a" | "b" | "c" | "d";
const optionKeys: OptionKey[] = ["a", "b", "c", "d"];

function nowPlusMins(mins: number) {
  let d = new Date();
  d.setMinutes(d.getMinutes() + mins);
  return d;
}

function parseCSV(text: string) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const data: string[][] = [];
  for (let i = 0; i < lines.length; ++i) {
    const row: string[] = [];
    let curr = "",
      inQuotes = false;
    for (let c = 0; c < lines[i].length; ++c) {
      let ch = lines[i][c];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        row.push(curr);
        curr = "";
      } else {
        curr += ch;
      }
    }
    row.push(curr);
    data.push(row.map((v) => v.replace(/^"|"$/g, "").trim()));
  }
  return data;
}

interface QuizQuestion {
  text: string;
  a: string;
  b: string;
  c: string;
  d: string;
  correct: "A" | "B" | "C" | "D";
  explanation: string;
}

export default function GroupQuizCreateScreen() {
  const { darkMode } = useDarkMode();
  const theme = darkMode ? darkTheme : lightTheme;
  const { lang } = useLanguage();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useContext(AuthContext) || {};
  const { groupId } = route.params as { groupId: number };

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [startTime, setStartTime] = useState<Date>(nowPlusMins(0));
  const [endTime, setEndTime] = useState<Date>(nowPlusMins(60));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    { text: "", a: "", b: "", c: "", d: "", correct: "A", explanation: "" },
  ]);
  const [creating, setCreating] = useState(false);

  const onAddQuestion = () => {
    setQuestions([
      ...questions,
      { text: "", a: "", b: "", c: "", d: "", correct: "A", explanation: "" },
    ]);
  };
  const onRemoveQuestion = (idx: number) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  // Chuyển giờ user chọn (local) thành UTC+7 ISO string rồi lưu vào DB
  function toVNISOString(date: Date) {
    // Chuyển date sang Asia/Ho_Chi_Minh, rồi lấy iso string UTC
    return dayjs(date).tz("Asia/Ho_Chi_Minh").utc().format();
  }

  async function onCreateQuiz() {
    if (!user) return;
    if (!title.trim()) {
      Alert.alert(TEXT.fill_title[lang]);
      return;
    }
    for (let q of questions) {
      if (
        !q.text.trim() ||
        !q.a.trim() ||
        !q.b.trim() ||
        !q.c.trim() ||
        !q.d.trim()
      ) {
        Alert.alert(TEXT.fill_question[lang]);
        return;
      }
    }
    setCreating(true);
    const { data: quizData, error } = await supabase
      .from("group_quizzes")
      .insert([
        {
          group_id: groupId,
          title,
          description: desc,
          created_by: user.id,
          // Lưu giờ đã chuyển đúng sang UTC từ giờ VN
          start_time: toVNISOString(startTime),
          end_time: toVNISOString(endTime),
        },
      ])
      .select()
      .single();
    if (!quizData || error) {
      setCreating(false);
      Alert.alert("Error", error?.message || "Failed to create quiz!");
      return;
    }
    for (let i = 0; i < questions.length; ++i) {
      const q = questions[i];
      await supabase.from("group_quiz_questions").insert([
        {
          quiz_id: quizData.id,
          question_text: q.text,
          option_a: q.a,
          option_b: q.b,
          option_c: q.c,
          option_d: q.d,
          correct_option: q.correct,
          explanation: q.explanation,
        },
      ]);
    }
    setCreating(false);
    Alert.alert(TEXT.quiz_created[lang]);
    navigation.goBack();
  }

  async function onImportCSV() {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "text/csv",
        copyToCacheDirectory: true,
        multiple: false,
      });
      // @ts-ignore
      if (res.canceled === true || (res.type && res.type !== "success")) return;
      // @ts-ignore
      const uri: string = res.assets?.[0]?.uri || res.uri;
      if (!uri) return;
      const csvText = await fetch(uri).then((r) => r.text());
      const rows = parseCSV(csvText);
      const questionsFromCSV: QuizQuestion[] = [];
      for (const row of rows) {
        if (row.length < 6) continue;
        const [text, a, b, c, d, correct, explanation] = row;
        if (
          !text?.trim() ||
          !a?.trim() ||
          !b?.trim() ||
          !c?.trim() ||
          !d?.trim() ||
          !["A", "B", "C", "D"].includes((correct || "").toUpperCase())
        )
          continue;
        questionsFromCSV.push({
          text: text.trim(),
          a: a.trim(),
          b: b.trim(),
          c: c.trim(),
          d: d.trim(),
          correct: (correct || "A").toUpperCase() as "A" | "B" | "C" | "D",
          explanation: explanation || "",
        });
      }
      if (questionsFromCSV.length === 0) {
        Alert.alert(TEXT.error_csv[lang], TEXT.csv_format[lang]);
        return;
      }
      setQuestions(questionsFromCSV);
      Alert.alert(
        TEXT.success_csv[lang],
        `${questionsFromCSV.length} ${TEXT.question[lang]}`,
      );
    } catch (err) {
      Alert.alert(TEXT.error_csv[lang]);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View
        style={[
          styles.header,
          { backgroundColor: theme.section, borderBottomColor: theme.card },
        ]}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="chevron-back"
            size={scale(28)}
            color={theme.primary}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.primary }]}>
          {TEXT.create_quiz[lang]}
        </Text>
        <View style={{ width: scale(32) }} />
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            padding: scale(16),
            paddingBottom: scale(32),
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.label, { color: theme.primary }]}>
            {TEXT.title[lang]}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.input,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            placeholder={TEXT.title[lang]}
            placeholderTextColor={theme.subText}
            value={title}
            onChangeText={setTitle}
          />

          <Text
            style={[
              styles.label,
              { color: theme.primary, marginTop: scale(8) },
            ]}
          >
            {TEXT.desc[lang]}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.input,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            placeholder={TEXT.desc[lang]}
            placeholderTextColor={theme.subText}
            value={desc}
            onChangeText={setDesc}
            multiline
          />

          <View style={styles.timeRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.primary }]}>
                {TEXT.start_time[lang]}
              </Text>
              <TouchableOpacity
                style={[
                  styles.timeBtn,
                  {
                    backgroundColor: theme.input,
                    borderColor: theme.primary,
                  },
                ]}
                onPress={() => setShowStartPicker(true)}
                activeOpacity={0.86}
              >
                <Ionicons name="time" size={scale(18)} color={theme.primary} />
                <Text style={{ marginLeft: 8, color: theme.text }}>
                  {startTime.toLocaleDateString()}{" "}
                  {startTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ width: scale(12) }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.primary }]}>
                {TEXT.end_time[lang]}
              </Text>
              <TouchableOpacity
                style={[
                  styles.timeBtn,
                  {
                    backgroundColor: theme.input,
                    borderColor: theme.primary,
                  },
                ]}
                onPress={() => setShowEndPicker(true)}
                activeOpacity={0.86}
              >
                <Ionicons name="time" size={scale(18)} color={theme.primary} />
                <Text style={{ marginLeft: 8, color: theme.text }}>
                  {endTime.toLocaleDateString()}{" "}
                  {endTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <DateModal
            visible={showStartPicker}
            onRequestClose={() => setShowStartPicker(false)}
            value={startTime}
            mode="datetime"
            onChange={(_, date) => {
              setShowStartPicker(false);
              if (date) setStartTime(date);
            }}
            minimumDate={new Date()}
            theme={theme}
            darkMode={darkMode}
          />
          <DateModal
            visible={showEndPicker}
            onRequestClose={() => setShowEndPicker(false)}
            value={endTime}
            mode="datetime"
            onChange={(_, date) => {
              setShowEndPicker(false);
              if (date) setEndTime(date);
            }}
            minimumDate={startTime}
            theme={theme}
            darkMode={darkMode}
          />

          <TouchableOpacity
            style={[styles.importBtn, { backgroundColor: theme.primary }]}
            onPress={onImportCSV}
            activeOpacity={0.86}
          >
            <Ionicons name="document" size={18} color="#fff" />
            <Text style={{ color: "#fff", marginLeft: 8 }}>
              {TEXT.import_csv[lang]}
            </Text>
          </TouchableOpacity>
          <Text
            style={{
              color: theme.subText,
              fontSize: 12,
              marginBottom: 8,
              marginTop: 2,
            }}
          >
            {TEXT.csv_format[lang]}
          </Text>

          <Text
            style={[
              styles.label,
              {
                color: theme.primary,
                marginTop: scale(12),
                marginBottom: scale(3),
              },
            ]}
          >
            {TEXT.question[lang]}
          </Text>
          {questions.map((q, idx) => (
            <View
              key={idx}
              style={[
                styles.qBox,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: scale(3),
                }}
              >
                <Text style={[styles.qTitle, { color: theme.primary }]}>
                  {TEXT.question[lang]} {idx + 1}
                </Text>
                {questions.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => onRemoveQuestion(idx)}
                  >
                    <Ionicons name="trash-outline" size={17} color="#FF5252" />
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                style={[
                  styles.qInput,
                  {
                    color: theme.text,
                    backgroundColor: theme.input,
                    borderColor: theme.border,
                  },
                ]}
                placeholder={TEXT.question[lang]}
                placeholderTextColor={theme.subText}
                value={q.text}
                onChangeText={(txt) => {
                  const newQ = [...questions];
                  newQ[idx].text = txt;
                  setQuestions(newQ);
                }}
              />
              {optionKeys.map((k) => (
                <View
                  key={k}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 5,
                  }}
                >
                  <TouchableOpacity
                    style={[
                      styles.radioBtn,
                      {
                        borderColor:
                          q.correct === k.toUpperCase()
                            ? theme.primary
                            : theme.subText,
                        backgroundColor:
                          q.correct === k.toUpperCase()
                            ? theme.primary
                            : theme.input,
                      },
                    ]}
                    onPress={() => {
                      const newQ = [...questions];
                      newQ[idx].correct = k.toUpperCase() as
                        | "A"
                        | "B"
                        | "C"
                        | "D";
                      setQuestions(newQ);
                    }}
                    activeOpacity={0.8}
                  >
                    {q.correct === k.toUpperCase() && (
                      <Ionicons name="checkmark" size={13} color="#fff" />
                    )}
                  </TouchableOpacity>
                  <Text style={[styles.optionLabel, { color: theme.text }]}>
                    {k.toUpperCase()}
                  </Text>
                  <TextInput
                    style={[
                      styles.qInput,
                      {
                        color: theme.text,
                        flex: 1,
                        marginLeft: 8,
                        backgroundColor: theme.input,
                        borderColor: theme.border,
                      },
                    ]}
                    placeholder={`${TEXT.option[lang]} ${k.toUpperCase()}`}
                    placeholderTextColor={theme.subText}
                    value={q[k]}
                    onChangeText={(txt) => {
                      const newQ = [...questions];
                      newQ[idx][k] = txt;
                      setQuestions(newQ);
                    }}
                  />
                </View>
              ))}
              <TextInput
                style={[
                  styles.qInput,
                  {
                    color: theme.text,
                    backgroundColor: theme.input,
                    borderColor: theme.border,
                    marginTop: 6,
                  },
                ]}
                placeholder="Giải thích (tùy chọn)"
                placeholderTextColor={theme.subText}
                value={q.explanation}
                onChangeText={(txt) => {
                  const newQ = [...questions];
                  newQ[idx].explanation = txt;
                  setQuestions(newQ);
                }}
              />
            </View>
          ))}
          <TouchableOpacity
            style={[styles.addQBtn, { backgroundColor: theme.primary }]}
            onPress={onAddQuestion}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={{ color: "#fff", marginLeft: 7 }}>
              {TEXT.add_question[lang]}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.saveBtn,
              { backgroundColor: theme.primary, opacity: creating ? 0.7 : 1 },
            ]}
            onPress={onCreateQuiz}
            disabled={creating}
          >
            <Ionicons name="checkmark" size={19} color="#fff" />
            <Text style={{ color: "#fff", marginLeft: 8, fontWeight: "bold" }}>
              {TEXT.save[lang]}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(12),
    paddingTop: scale(6),
    paddingBottom: scale(8),
    borderBottomWidth: 0.5,
  },
  backBtn: { width: scale(32), alignItems: "flex-start" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: scale(18),
    fontWeight: "bold",
    marginHorizontal: scale(2),
  },
  label: {
    fontWeight: "bold",
    fontSize: scale(14),
    marginBottom: scale(2),
    marginLeft: scale(2),
  },
  input: {
    borderRadius: scale(12),
    padding: scale(13),
    marginBottom: scale(2),
    fontSize: scale(15),
    borderWidth: 1.2,
  },
  timeRow: {
    flexDirection: "row",
    marginTop: scale(11),
    marginBottom: scale(6),
  },
  timeBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: scale(10),
    borderWidth: 1.2,
    padding: scale(10),
  },
  importBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: scale(9),
    paddingVertical: scale(7),
    paddingHorizontal: scale(14),
    marginTop: scale(7),
    marginBottom: scale(2),
  },
  qBox: {
    borderRadius: scale(12),
    borderWidth: 1.1,
    padding: scale(13),
    marginBottom: scale(15),
    elevation: 1,
  },
  qTitle: {
    fontWeight: "bold",
    fontSize: scale(15),
    marginBottom: scale(4),
  },
  qInput: {
    borderRadius: scale(9),
    padding: scale(8),
    marginTop: scale(3),
    fontSize: scale(14),
    borderWidth: 1,
  },
  radioBtn: {
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 3,
    marginLeft: 1,
  },
  optionLabel: {
    marginLeft: 3,
    marginRight: 4,
    fontWeight: "bold",
    fontSize: scale(14),
    width: scale(18),
    textAlign: "center",
  },
  addQBtn: {
    borderRadius: scale(10),
    paddingVertical: scale(10),
    paddingHorizontal: scale(22),
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginTop: scale(5),
    marginBottom: scale(22),
    elevation: 2,
  },
  saveBtn: {
    borderRadius: scale(13),
    paddingVertical: scale(13),
    paddingHorizontal: scale(22),
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginTop: scale(4),
    elevation: 2,
  },
  removeBtn: {
    marginLeft: "auto",
    padding: 3,
  },
});
