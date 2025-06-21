import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from "../LanguageContext";
import { useDarkMode } from "../DarkModeContext";
import { lightTheme, darkTheme } from "../theme";
import { supabase } from "../../supabase/supabaseClient";
import { useUserId } from "../../hooks/useUserId";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;

const AVATAR_CHOICES: string[] = [
  "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg?ga=GA1.1.772965918.1728754090&semt=ais_hybrid&w=740",
  "https://img.freepik.com/free-psd/3d-illustration-bald-person-with-glasses_23-2149436184.jpg?t=st=1750538875~exp=1750542475~hmac=323cd8657cba0d9dc8ece431c2b4cb88cf017cb3c4a44c673dae4d54503b0783",
  "https://img.freepik.com/free-psd/3d-illustration-person-with-punk-hair-jacket_23-2149436198.jpg?t=st=1750538875~exp=1750542475~hmac=403214165ae4989e7592e732be7f4f65f0fdbfaa99913438abb972075f8e3be7",
  "https://img.freepik.com/premium-psd/3d-illustration-business-man-with-glasses_23-2149436193.jpg",
  "https://img.freepik.com/free-psd/3d-illustration-person-with-glasses_23-2149436190.jpg?t=st=1750538875~exp=1750542475~hmac=cb61df2d77198ef455b85a881fe980cc6eec88fa6fec8bd08d900b36487558a2",
  "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses-green-hair_23-2149436201.jpg?t=st=1750538875~exp=1750542475~hmac=de59ea1ce3a42027cb457e3fc3f479e951f4275498510af9715db4796967c9c2",
  "https://img.freepik.com/free-psd/3d-illustration-bald-person_23-2149436183.jpg?t=st=1750538875~exp=1750542475~hmac=f5c8e540a147a7fbdabab98a649eaf8743edd8a6596ceab9bbaa7cb5ddd97f85",
  "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436200.jpg?t=st=1750538875~exp=1750542475~hmac=b4f94675a15ed6cc3e29d12addadb362a9638c04ea6c64aa60f6192205c474ef",
  "https://img.freepik.com/free-psd/3d-illustration-person-with-glasses_23-2149436189.jpg?t=st=1750538875~exp=1750542475~hmac=4e1157d575f65b7f862ff839dd7192df38afc0459d85cde4c8c2da1e5c4f1d8e",
  "https://img.freepik.com/free-psd/3d-illustration-person-tank-top_23-2149436202.jpg?t=st=1750538875~exp=1750542475~hmac=64da1bb6f196d9c48937c552997e5dfe1170b21c90240e666bbeb4d1f324cfa8",
];

const TEXT = {
  email: { vi: "Email", en: "Email" },
  username: { vi: "Tên đăng nhập", en: "Username" },
  phone: { vi: "Số điện thoại", en: "Phone" },
  joined: { vi: "Ngày tham gia", en: "Joined" },
  member: { vi: "Thành viên", en: "Member" },
  owner: { vi: "Chủ nhóm", en: "Owner" },
  admin: { vi: "Quản trị viên", en: "Admin" },
  loading: { vi: "Đang tải...", en: "Loading..." },
  change_avatar: { vi: "Đổi ảnh đại diện", en: "Change avatar" },
  choose_avatar: { vi: "Chọn một ảnh đại diện", en: "Choose an avatar" },
  save: { vi: "Lưu", en: "Save" },
  cancel: { vi: "Huỷ", en: "Cancel" },
  updating: { vi: "Đang cập nhật...", en: "Updating..." },
  update_success: { vi: "Đã cập nhật ảnh đại diện!", en: "Avatar updated!" },
  update_failed: { vi: "Cập nhật thất bại!", en: "Update failed!" },
};

export default function ProfileScreen() {
  const { lang } = useLanguage();
  const { darkMode } = useDarkMode();
  const theme = darkMode ? darkTheme : lightTheme;
  const userId = useUserId();

  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<{
    avatar_url?: string;
    full_name?: string;
    email?: string;
    username?: string;
    phone?: string;
    role?: "member" | "owner" | "admin";
    created_at?: string;
  }>({});

  // Avatar modal state
  const [showModal, setShowModal] = React.useState(false);
  const [selectedAvatar, setSelectedAvatar] = React.useState<string | null>(
    null,
  );
  const [updating, setUpdating] = React.useState(false);

  React.useEffect(() => {
    if (!userId) return;
    let ignore = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("users")
        .select("avatar_url, full_name, email, username, created_at")
        .eq("id", userId)
        .single();
      if (!ignore && data) {
        setUser({
          ...data,
        });
      }
      setLoading(false);
    })();
    return () => {
      ignore = true;
    };
  }, [userId]);

  function getRoleLabel(role: string | undefined) {
    if (role === "owner") return TEXT.owner[lang];
    if (role === "admin") return TEXT.admin[lang];
    return TEXT.member[lang];
  }

  async function handleAvatarUpdate(avatarUrl: string) {
    setUpdating(true);
    const { error } = await supabase
      .from("users")
      .update({ avatar_url: avatarUrl })
      .eq("id", userId);
    setUpdating(false);
    if (!error) {
      setUser((prev) => ({ ...prev, avatar_url: avatarUrl }));
      setShowModal(false);
      setSelectedAvatar(null);
      Alert.alert(TEXT.update_success[lang]);
    } else {
      Alert.alert(TEXT.update_failed[lang]);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ color: theme.primary, marginTop: 12 }}>
            {TEXT.loading[lang]}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarWrap}>
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            activeOpacity={0.85}
            style={{ position: "relative" }}
          >
            <Image
              source={
                user.avatar_url
                  ? { uri: user.avatar_url }
                  : require("../../assets/images/avatar.png")
              }
              style={styles.avatar}
            />
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={{ color: theme.subText, marginTop: 5, fontSize: 13 }}>
            {TEXT.change_avatar[lang]}
          </Text>
        </View>
        <Text style={[styles.name, { color: theme.primary }]}>
          {user.full_name}
        </Text>
        <Text style={[styles.role, { color: theme.subText }]}>
          {getRoleLabel(user.role)}
        </Text>

        <View
          style={[
            styles.infoSection,
            { backgroundColor: theme.card, shadowColor: theme.primary },
          ]}
        >
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color={theme.primary} />
            <Text style={[styles.infoLabel, { color: theme.text }]}>
              {TEXT.email[lang]}:
            </Text>
            <Text style={[styles.infoValue, { color: theme.primary }]}>
              {user.email}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={18} color={theme.primary} />
            <Text style={[styles.infoLabel, { color: theme.text }]}>
              {TEXT.username[lang]}:
            </Text>
            <Text style={[styles.infoValue, { color: theme.primary }]}>
              {user.username}
            </Text>
          </View>
          {/* Nếu có phone thì mở comment dưới đây */}
          {/* <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color={theme.primary} />
            <Text style={[styles.infoLabel, { color: theme.text }]}>
              {TEXT.phone[lang]}:
            </Text>
            <Text style={[styles.infoValue, { color: theme.primary }]}>
              {user.phone}
            </Text>
          </View> */}
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color={theme.primary} />
            <Text style={[styles.infoLabel, { color: theme.text }]}>
              {TEXT.joined[lang]}:
            </Text>
            <Text style={[styles.infoValue, { color: theme.primary }]}>
              {user.created_at?.slice(0, 10)}
            </Text>
          </View>
        </View>
      </ScrollView>
      {/* Modal chọn avatar */}
      <Modal visible={showModal} transparent animationType="slide">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => !updating && setShowModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.primary }]}>
              {TEXT.choose_avatar[lang]}
            </Text>
            <ScrollView
              horizontal
              contentContainerStyle={{ alignItems: "center", paddingBottom: 8 }}
              showsHorizontalScrollIndicator={false}
            >
              {AVATAR_CHOICES.map((url, idx) => (
                <TouchableOpacity
                  key={url}
                  style={[
                    styles.avatarChoice,
                    selectedAvatar === url && {
                      borderColor: theme.primary,
                      borderWidth: 2.5,
                    },
                  ]}
                  disabled={updating}
                  onPress={() => setSelectedAvatar(url)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: url }} style={styles.avatarImg} />
                  {selectedAvatar === url && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={theme.primary}
                      style={styles.avatarCheck}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={{ flexDirection: "row", marginTop: 13 }}>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  {
                    backgroundColor: theme.primary,
                    opacity: updating || !selectedAvatar ? 0.7 : 1,
                  },
                ]}
                disabled={updating || !selectedAvatar}
                onPress={async () => {
                  if (selectedAvatar) await handleAvatarUpdate(selectedAvatar);
                }}
              >
                {updating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    {TEXT.save[lang]}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  {
                    backgroundColor: "#aaa",
                    marginLeft: 13,
                    opacity: updating ? 0.7 : 1,
                  },
                ]}
                disabled={updating}
                onPress={() => {
                  setShowModal(false);
                  setSelectedAvatar(null);
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  {TEXT.cancel[lang]}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    alignItems: "center",
    padding: scale(20),
    paddingBottom: scale(40),
  },
  avatarWrap: {
    marginTop: 14,
    marginBottom: 10,
    position: "relative",
    alignItems: "center",
  },
  avatar: {
    width: scale(110),
    height: scale(110),
    borderRadius: 100,
    borderWidth: 3,
    borderColor: "#fff",
    backgroundColor: "#eee",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 7,
    right: 8,
    backgroundColor: "#276ef1",
    borderRadius: 15,
    padding: 5,
    borderWidth: 2,
    borderColor: "#fff",
    zIndex: 3,
  },
  name: {
    fontWeight: "bold",
    fontSize: scale(20),
    marginBottom: 2,
    marginTop: 6,
  },
  role: {
    marginBottom: 17,
    fontSize: scale(15),
  },
  infoSection: {
    borderRadius: 13,
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 18,
    shadowOpacity: 0.06,
    shadowRadius: 7,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: scale(15),
    marginLeft: 10,
    minWidth: 100,
  },
  infoValue: {
    fontWeight: "500",
    marginLeft: 4,
    fontSize: scale(15),
    flexShrink: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#0009",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "89%",
    borderRadius: 14,
    padding: 21,
    alignItems: "center",
    elevation: 6,
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 19,
    marginBottom: 15,
    alignSelf: "center",
  },
  avatarChoice: {
    width: 68,
    height: 68,
    marginHorizontal: 7,
    marginBottom: 5,
    borderRadius: 34,
    borderColor: "#eee",
    borderWidth: 2,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  avatarImg: {
    width: 62,
    height: 62,
    borderRadius: 34,
    resizeMode: "cover",
  },
  avatarCheck: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 11,
  },
  modalBtn: {
    borderRadius: 7,
    paddingVertical: 11,
    paddingHorizontal: 22,
    marginTop: 8,
  },
});
