import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDarkMode } from "../DarkModeContext";
import { lightTheme, darkTheme } from "../theme";
import { useLanguage } from "../LanguageContext";
import { supabase } from "../../supabase/supabaseClient";
import { useUserId } from "../../hooks/useUserId";
import QRCode from "react-native-qrcode-svg";
import { logGroupActivity } from "../../components/utils/groupActivities";
import { createGroupWithSettings } from "../../supabase/seed/createGroupWithSetting";

const { width } = Dimensions.get("window");
const scale = (size: number) => (width / 375) * size;

const TEXT = {
  group: { vi: "Nhóm", en: "Group" },
  noGroup: { vi: "Không tìm thấy nhóm nào", en: "No groups found" },
  createGroup: { vi: "Tạo nhóm mới", en: "Create Group" },
  loading: { vi: "Đang tải dữ liệu...", en: "Loading..." },
  searchGroup: { vi: "Tìm nhóm", en: "Search group" },
  memberCount: { vi: "thành viên", en: "members" },
  noAnnouncement: { vi: "Chưa có thông báo", en: "No announcement yet" },
  groupNameRequired: {
    vi: "Tên nhóm không được để trống",
    en: "Group name cannot be blank",
  },
  inputRequired: { vi: "Thiếu thông tin", en: "Missing information" },
  groupName: { vi: "Tên nhóm", en: "Group name" },
  groupDesc: { vi: "Mô tả", en: "Description" },
  create: { vi: "Tạo", en: "Create" },
  groupCode: { vi: "Mã nhóm", en: "Group code" },
  confirmJoin: { vi: "Xác nhận tham gia", en: "Confirm join" },
  enterGroupCode: { vi: "Nhập mã nhóm", en: "Enter group code" },
  joinGroup: { vi: "Tham gia nhóm", en: "Join group" },
  or: { vi: "hoặc", en: "or" },
  scanQr: { vi: "Quét mã QR", en: "Scan QR" },
  invalidCode: { vi: "Mã nhóm không hợp lệ", en: "Invalid group code" },
  alreadyMember: {
    vi: "Bạn đã là thành viên nhóm này",
    en: "You are already a member of this group",
  },
  deleteGroup: { vi: "Xóa nhóm", en: "Delete group" },
  confirmDelete: {
    vi: 'Bạn có chắc chắn muốn xóa nhóm "{name}" không?',
    en: 'Are you sure you want to delete the group "{name}"?',
  },
  deleted: { vi: "Đã xóa nhóm thành công!", en: "Group deleted successfully!" },
  deleteError: { vi: "Không thể xóa nhóm", en: "Cannot delete group" },
  editGroup: { vi: "Chỉnh sửa nhóm", en: "Edit group" },
  save: { vi: "Lưu", en: "Save" },
  close: { vi: "Đóng", en: "Close" },
};

const filterCategories = [
  "Ngôn ngữ",
  "Kỹ năng",
  "Lập trình",
  "Cộng đồng",
  "Học thuật",
];

async function generateUniqueJoinCode(): Promise<string> {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  let isUnique = false;
  while (!isUnique) {
    code = "";
    for (let i = 0; i < 8; i++)
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    const { data } = await supabase
      .from("groups")
      .select("id")
      .eq("join_code", code)
      .single();
    if (!data) isUnique = true;
  }
  return code;
}

export default function Group() {
  const navigation = useNavigation();
  const { darkMode } = useDarkMode();
  const theme = darkMode ? darkTheme : lightTheme;
  const { lang } = useLanguage();
  const userId = useUserId();

  const [groups, setGroups] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal tạo nhóm
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    category: filterCategories[0],
  });
  const [createdJoinCode, setCreatedJoinCode] = useState<string | undefined>(
    undefined,
  );

  // Modal QR code khi vừa tạo nhóm xong
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrValue, setQrValue] = useState<string>("");

  // Modal nhập mã nhóm để tham gia
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [inputJoinCode, setInputJoinCode] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);

  // Modal xác nhận tham gia nhóm
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [groupToJoin, setGroupToJoin] = useState<any>(null);

  // Modal chỉnh sửa nhóm
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editGroup, setEditGroup] = useState({
    id: 0,
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchGroups();
    // eslint-disable-next-line
  }, [userId]);

  async function fetchGroups() {
    if (!userId) {
      return;
    }
    setLoading(true);
    const { data: memberData } = await supabase
      .from("group_members")
      .select("group_id, role")
      .eq("user_id", userId);

    if (!memberData || memberData.length === 0) {
      setGroups([]);
      setLoading(false);
      return;
    }
    const groupIds = memberData.map((m) => m.group_id);
    const { data: groupsData } = await supabase
      .from("groups")
      .select("id, name, description, owner_id, created_at")
      .in("id", groupIds);

    if (!groupsData) {
      setGroups([]);
      setLoading(false);
      return;
    }

    const groupCounts: Record<number, number> = {};
    for (let groupId of groupIds) {
      const { count } = await supabase
        .from("group_members")
        .select("*", { count: "exact", head: true })
        .eq("group_id", groupId);
      groupCounts[groupId] = count || 1;
    }

    const ownerIds = Array.from(new Set(groupsData.map((g) => g.owner_id)));
    let owners: Record<string, any> = {};
    if (ownerIds.length > 0) {
      const { data: ownerData } = await supabase
        .from("users")
        .select("id, full_name, avatar_url")
        .in("id", ownerIds);
      if (ownerData) {
        ownerData.forEach((owner) => {
          owners[owner.id] = owner;
        });
      }
    }

    let announcements: Record<number, any> = {};
    const { data: announceData } = await supabase
      .from("group_announcements")
      .select("group_id, content, created_at")
      .order("created_at", { ascending: false });
    if (announceData) {
      announceData.forEach((a) => {
        if (!announcements[a.group_id]) {
          announcements[a.group_id] = a;
        }
      });
    }

    // Lấy vai trò người dùng trong từng nhóm
    const groupRoleMap: Record<number, string> = {};
    memberData.forEach((m) => {
      groupRoleMap[m.group_id] = m.role;
    });

    const groupList = groupsData.map((g) => ({
      id: g.id,
      name: g.name,
      owner: owners[g.owner_id]?.full_name || "Unknown",
      ownerAvatar: owners[g.owner_id]?.avatar_url
        ? { uri: owners[g.owner_id].avatar_url }
        : require("../../assets/images/avatar.png"),
      memberCount: groupCounts[g.id] || 1,
      description: g.description,
      createdAt: g.created_at ? new Date(g.created_at) : new Date(),
      owner_id: g.owner_id,
      latestAnnouncement: announcements[g.id]
        ? {
            content: announcements[g.id].content,
            postedAt: announcements[g.id].created_at,
          }
        : undefined,
      myRole: groupRoleMap[g.id] || "member",
    }));

    setGroups(groupList);
    setLoading(false);
  }

  const filterGroups = () => {
    let res = [...groups];
    if (searchText.trim() !== "") {
      res = res.filter((g) =>
        g.name.toLowerCase().includes(searchText.toLowerCase()),
      );
    }
    return res;
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchGroups().then(() => setRefreshing(false));
  };

  const handleAddGroup = async () => {
    if (!userId) {
      Alert.alert("Bạn cần đăng nhập lại để thực hiện thao tác này");
      return;
    }
    if (!newGroup.name.trim()) {
      Alert.alert(TEXT.inputRequired[lang], TEXT.groupNameRequired[lang]);
      return;
    }
    const join_code = await generateUniqueJoinCode();

    try {
      // Tạo group và tự động tạo group_settings
      const group = await createGroupWithSettings({
        name: newGroup.name,
        description: newGroup.description,
        owner_id: userId,
        join_code,
        qr_code: join_code,
      });

      const memberObj = {
        group_id: group.id,
        user_id: userId,
        role: "owner",
      };
      await supabase.from("group_members").insert(memberObj);

      // Ghi activity: tạo nhóm đồng thời là join (chủ nhóm tham gia)
      await logGroupActivity({
        group_id: group.id,
        activity_type: "join",
        content: "Chủ nhóm đã tạo và tham gia nhóm",
        created_by: userId,
      });

      setNewGroup({
        name: "",
        description: "",
        category: filterCategories[0],
      });
      setCreatedJoinCode(group.join_code ?? undefined);
      setQrValue(group.join_code ?? "");
      setShowQRCode(true);
      setAddModalVisible(false);
      fetchGroups();
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Can't create group");
      return;
    }
  };

  // Thêm hàm xóa nhóm
  const handleDeleteGroup = async (groupId: number, groupName: string) => {
    Alert.alert(
      TEXT.deleteGroup[lang],
      TEXT.confirmDelete[lang].replace("{name}", groupName),
      [
        { text: "Hủy", style: "cancel" },
        {
          text: TEXT.deleteGroup[lang],
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("groups")
                .delete()
                .eq("id", groupId);
              if (error) throw error;
              fetchGroups();
              Alert.alert(TEXT.deleted[lang]);
            } catch (err: any) {
              Alert.alert(TEXT.deleteError[lang], err?.message || "");
            }
          },
        },
      ],
    );
  };

  // Nhấn giữ nhóm: chọn sửa hoặc xóa
  const handleGroupLongPress = (group: any) => {
    // Chỉ chủ nhóm mới được sửa/xóa
    if (group.owner_id !== userId) return;
    Alert.alert(group.name, "Chọn thao tác", [
      {
        text: TEXT.editGroup[lang],
        onPress: () => {
          setEditGroup({
            id: group.id,
            name: group.name,
            description: group.description,
          });
          setEditModalVisible(true);
        },
      },
      {
        text: TEXT.deleteGroup[lang],
        style: "destructive",
        onPress: () => handleDeleteGroup(group.id, group.name),
      },
      { text: TEXT.close[lang], style: "cancel" },
    ]);
  };

  const handleEditGroupSave = async () => {
    if (!editGroup.name.trim()) {
      Alert.alert(TEXT.inputRequired[lang], TEXT.groupNameRequired[lang]);
      return;
    }
    await supabase
      .from("groups")
      .update({ name: editGroup.name, description: editGroup.description })
      .eq("id", editGroup.id);
    setEditModalVisible(false);
    fetchGroups();
  };

  const handleSubmitJoinCode = async () => {
    Keyboard.dismiss();
    const code = inputJoinCode.trim().toUpperCase();
    if (code.length !== 8) {
      Alert.alert(TEXT.invalidCode[lang]);
      return;
    }
    setJoinLoading(true);
    const { data: group, error } = await supabase
      .from("groups")
      .select("*, users:owner_id(id, full_name, avatar_url)")
      .eq("join_code", code)
      .single();
    setJoinLoading(false);

    if (error || !group) {
      Alert.alert(TEXT.invalidCode[lang]);
      return;
    }
    const { data: member } = await supabase
      .from("group_members")
      .select("*")
      .eq("group_id", group.id)
      .eq("user_id", userId)
      .maybeSingle();

    if (member) {
      Alert.alert(TEXT.alreadyMember[lang]);
      setJoinModalVisible(false);
      return;
    }
    setGroupToJoin(group);
    setJoinModalVisible(false);
    setConfirmModalVisible(true);
  };

  const handleConfirmJoin = async () => {
    if (!userId) {
      Alert.alert("Bạn cần đăng nhập lại để thực hiện thao tác này");
      return;
    }
    if (!groupToJoin) return;
    const obj = {
      group_id: groupToJoin.id,
      user_id: userId,
      role: "member",
    };
    await supabase.from("group_members").insert(obj);

    // Ghi activity: thành viên mới tham gia nhóm
    await logGroupActivity({
      group_id: groupToJoin.id,
      activity_type: "join",
      content: `Thành viên mới đã tham gia nhóm`,
      created_by: userId,
    });

    setConfirmModalVisible(false);
    setGroupToJoin(null);
    fetchGroups();
    Alert.alert(
      TEXT.joinGroup[lang],
      `Bạn đã tham gia nhóm ${groupToJoin.name}!`,
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.text }]}>
          {TEXT.group[lang]}
        </Text>
        <TouchableOpacity>
          <Image
            source={require("../../assets/images/avatar.png")}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>
      {/* Search + Join by code + Create group */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginHorizontal: scale(24),
          marginBottom: scale(10),
        }}
      >
        <View
          style={[
            styles.searchRow,
            { backgroundColor: theme.section, flex: 1 },
          ]}
        >
          <Ionicons
            name="search"
            size={scale(18)}
            color={theme.subText}
            style={{ marginLeft: scale(8) }}
          />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder={TEXT.searchGroup[lang]}
            placeholderTextColor={theme.subText}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <TouchableOpacity
          style={{
            marginLeft: scale(8),
            backgroundColor: theme.primary,
            borderRadius: scale(8),
            padding: scale(8),
          }}
          onPress={() => setJoinModalVisible(true)}
        >
          <Ionicons name="log-in-outline" size={scale(20)} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            marginLeft: scale(8),
            backgroundColor: theme.primary,
            borderRadius: scale(8),
            padding: scale(8),
          }}
          onPress={() => setAddModalVisible(true)}
        >
          <Ionicons name="add" size={scale(20)} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1 }}>
        {loading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={{ color: theme.subText, marginTop: scale(10) }}>
              {TEXT.loading[lang]}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filterGroups()}
            keyExtractor={(item) => String(item.id)}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={onRefresh}
            contentContainerStyle={{
              paddingBottom: scale(24),
              flexGrow: 1,
              minHeight: scale(220),
            }}
            renderItem={({ item }) => (
              <View style={styles.cardItemBox}>
                <TouchableOpacity
                  style={[
                    styles.cardItem,
                    { backgroundColor: theme.card, shadowColor: theme.card },
                  ]}
                  activeOpacity={0.82}
                  onPress={() => {
                    navigation.navigate(
                      "GroupDetail" as never,
                      { groupId: item.id } as never,
                    );
                  }}
                  onLongPress={() => handleGroupLongPress(item)}
                >
                  <View
                    style={[
                      styles.cardImageBox,
                      { backgroundColor: theme.section },
                    ]}
                  >
                    <Image
                      source={item.ownerAvatar}
                      style={styles.cardImagePlaceholder}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>
                      {item.name}
                    </Text>
                    <Text
                      style={[styles.cardDesc, { color: theme.subText }]}
                      numberOfLines={1}
                    >
                      {item.description}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: scale(3),
                        justifyContent: "space-between",
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <Ionicons
                          name="person"
                          size={scale(14)}
                          color={theme.subText}
                        />
                        <Text
                          style={[styles.cardAuthor, { color: theme.subText }]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {" "}
                          {item.owner}
                        </Text>
                      </View>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Ionicons
                          name="people-outline"
                          size={scale(15)}
                          color={theme.subText}
                          style={{ marginLeft: scale(8) }}
                        />
                        <Text
                          style={[
                            styles.cardTotalCards,
                            { color: theme.primary },
                          ]}
                        >
                          {" "}
                          {item.memberCount} {TEXT.memberCount[lang]}
                        </Text>
                      </View>
                    </View>
                    {item.latestAnnouncement ? (
                      <View
                        style={[
                          styles.announcementBox,
                          { backgroundColor: darkMode ? "#1a2256" : "#F1F6FF" },
                        ]}
                      >
                        <Ionicons
                          name="notifications"
                          size={scale(14)}
                          color={theme.primary}
                        />
                        <Text
                          style={[
                            styles.announcementText,
                            { color: theme.primary },
                          ]}
                          numberOfLines={1}
                        >
                          {item.latestAnnouncement.content}
                        </Text>
                      </View>
                    ) : (
                      <Text
                        style={[
                          styles.noAnnouncement,
                          { color: theme.subText },
                        ]}
                      >
                        {TEXT.noAnnouncement[lang]}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: scale(50),
                }}
              >
                <Image
                  source={require("../../assets/images/avatar.png")}
                  style={{
                    width: scale(110),
                    height: scale(110),
                    marginBottom: scale(14),
                  }}
                />
                <Text style={{ color: theme.subText, fontSize: scale(17) }}>
                  {TEXT.noGroup[lang]}
                </Text>
              </View>
            }
          />
        )}
      </View>
      {/* Modal tạo nhóm */}
      {addModalVisible && (
        <View
          style={[
            styles.modalOverlay,
            {
              backgroundColor: darkMode
                ? "rgba(7,15,36,0.72)"
                : "rgba(40,40,50,0.22)",
            },
          ]}
        >
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.card,
                shadowColor: darkMode ? "#111" : "#222",
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.primary }]}>
              {TEXT.createGroup[lang]}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                  backgroundColor: theme.section,
                  borderColor: darkMode ? "#373A44" : "#E4E6EF",
                },
              ]}
              placeholder={TEXT.groupName[lang]}
              placeholderTextColor={theme.subText}
              value={newGroup.name}
              onChangeText={(t) =>
                setNewGroup((prev) => ({ ...prev, name: t }))
              }
            />
            <TextInput
              style={[
                styles.input,
                {
                  minHeight: scale(48),
                  color: theme.text,
                  backgroundColor: theme.section,
                  borderColor: darkMode ? "#373A44" : "#E4E6EF",
                },
              ]}
              placeholder={TEXT.groupDesc[lang]}
              placeholderTextColor={theme.subText}
              value={newGroup.description}
              onChangeText={(t) =>
                setNewGroup((prev) => ({ ...prev, description: t }))
              }
              multiline
            />
            <View style={{ flexDirection: "row", marginTop: 10 }}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.primary }]}
                onPress={handleAddGroup}
              >
                <Text style={{ color: "#fff" }}>{TEXT.create[lang]}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  {
                    backgroundColor: darkMode ? "#222" : "#eee",
                    marginLeft: 12,
                  },
                ]}
                onPress={() => setAddModalVisible(false)}
              >
                <Text style={{ color: theme.text }}>{TEXT.close[lang]}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      {/* Modal chỉnh sửa nhóm */}
      {editModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.primary }]}>
              {TEXT.editGroup[lang]}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                  backgroundColor: theme.section,
                  borderColor: darkMode ? "#373A44" : "#E4E6EF",
                },
              ]}
              placeholder={TEXT.groupName[lang]}
              placeholderTextColor={theme.subText}
              value={editGroup.name}
              onChangeText={(t) =>
                setEditGroup((prev) => ({ ...prev, name: t }))
              }
            />
            <TextInput
              style={[
                styles.input,
                {
                  minHeight: scale(48),
                  color: theme.text,
                  backgroundColor: theme.section,
                  borderColor: darkMode ? "#373A44" : "#E4E6EF",
                },
              ]}
              placeholder={TEXT.groupDesc[lang]}
              placeholderTextColor={theme.subText}
              value={editGroup.description}
              onChangeText={(t) =>
                setEditGroup((prev) => ({ ...prev, description: t }))
              }
              multiline
            />
            <View style={{ flexDirection: "row", marginTop: 10 }}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.primary }]}
                onPress={handleEditGroupSave}
              >
                <Text style={{ color: "#fff" }}>{TEXT.save[lang]}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  {
                    backgroundColor: darkMode ? "#222" : "#eee",
                    marginLeft: 12,
                  },
                ]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={{ color: theme.text }}>{TEXT.close[lang]}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      {/* ...other modals giữ nguyên... */}
      {showQRCode && (
        <View
          style={[
            styles.modalOverlay,
            {
              backgroundColor: darkMode
                ? "rgba(7,15,36,0.72)"
                : "rgba(40,40,50,0.22)",
            },
          ]}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text
              style={{
                color: theme.text,
                fontSize: scale(18),
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: scale(12),
              }}
            >
              Mã nhóm của bạn
            </Text>
            <Text
              style={{
                color: theme.primary,
                fontWeight: "bold",
                fontSize: scale(24),
                textAlign: "center",
                letterSpacing: 2,
              }}
            >
              {createdJoinCode}
            </Text>
            <View style={{ alignItems: "center", marginVertical: scale(18) }}>
              <QRCode
                value={qrValue}
                size={scale(150)}
                backgroundColor="transparent"
              />
            </View>
            <TouchableOpacity
              style={[
                styles.modalBtn,
                { backgroundColor: theme.primary, alignSelf: "center" },
              ]}
              onPress={() => setShowQRCode(false)}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {joinModalVisible && (
        <View
          style={[
            styles.modalOverlay,
            {
              backgroundColor: darkMode
                ? "rgba(7,15,36,0.72)"
                : "rgba(40,40,50,0.22)",
            },
          ]}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text
              style={{
                color: theme.text,
                fontSize: scale(18),
                fontWeight: "bold",
                marginBottom: 14,
                textAlign: "center",
              }}
            >
              {TEXT.enterGroupCode[lang]}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                  backgroundColor: theme.section,
                  borderColor: darkMode ? "#373A44" : "#E4E6EF",
                  letterSpacing: 2,
                  fontWeight: "bold",
                  textAlign: "center",
                },
              ]}
              placeholder={TEXT.groupCode[lang]}
              placeholderTextColor={theme.subText}
              value={inputJoinCode}
              maxLength={8}
              autoCapitalize="characters"
              onChangeText={setInputJoinCode}
              onSubmitEditing={handleSubmitJoinCode}
              editable={!joinLoading}
            />
            <View
              style={{
                flexDirection: "row",
                marginTop: 10,
                justifyContent: "center",
              }}
            >
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.primary }]}
                disabled={joinLoading}
                onPress={handleSubmitJoinCode}
              >
                <Text style={{ color: "#fff" }}>{TEXT.joinGroup[lang]}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  {
                    backgroundColor: darkMode ? "#222" : "#eee",
                    marginLeft: 12,
                  },
                ]}
                onPress={() => setJoinModalVisible(false)}
              >
                <Text style={{ color: theme.text }}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      {confirmModalVisible && groupToJoin && (
        <View
          style={[
            styles.modalOverlay,
            {
              backgroundColor: darkMode
                ? "rgba(7,15,36,0.72)"
                : "rgba(40,40,50,0.22)",
            },
          ]}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text
              style={{
                color: theme.primary,
                fontSize: scale(20),
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              {TEXT.confirmJoin[lang]}
            </Text>
            <View
              style={{
                alignItems: "center",
                marginBottom: scale(10),
              }}
            >
              <Image
                source={
                  groupToJoin.users?.avatar_url
                    ? { uri: groupToJoin.users.avatar_url }
                    : require("../../assets/images/avatar.png")
                }
                style={{
                  width: scale(50),
                  height: scale(50),
                  borderRadius: 25,
                  marginBottom: 7,
                  backgroundColor: "#eee",
                }}
              />
              <Text
                style={{
                  fontWeight: "bold",
                  color: theme.text,
                  fontSize: scale(17),
                  marginBottom: 2,
                }}
              >
                {groupToJoin.name}
              </Text>
              <Text
                style={{
                  color: theme.subText,
                  fontSize: scale(14),
                  marginBottom: 2,
                }}
                numberOfLines={2}
              >
                {groupToJoin.description}
              </Text>
              <Text
                style={{
                  color: theme.subText,
                  fontSize: scale(13),
                  fontStyle: "italic",
                  marginBottom: 2,
                }}
              >
                Chủ nhóm: {groupToJoin.users?.full_name || "Unknown"}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.modalBtn,
                {
                  backgroundColor: theme.primary,
                  alignSelf: "center",
                  marginTop: scale(8),
                },
              ]}
              onPress={handleConfirmJoin}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                {TEXT.joinGroup[lang]}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalBtn,
                {
                  backgroundColor: darkMode ? "#222" : "#eee",
                  alignSelf: "center",
                  marginTop: scale(6),
                },
              ]}
              onPress={() => setConfirmModalVisible(false)}
            >
              <Text style={{ color: theme.text }}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 0 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: scale(8),
    marginBottom: scale(18),
    paddingHorizontal: scale(24),
    justifyContent: "space-between",
  },
  title: { fontSize: scale(30), fontWeight: "bold", color: "#222" },
  avatar: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    backgroundColor: "#eee",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F8FB",
    borderRadius: scale(16),
    paddingHorizontal: scale(8),
    height: scale(44),
  },
  searchInput: {
    flex: 1,
    fontSize: scale(16),
    marginLeft: scale(6),
    color: "#222",
    backgroundColor: "transparent",
  },
  cardItemBox: { marginBottom: scale(11) },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: scale(16),
    marginHorizontal: scale(24),
    padding: scale(16),
    shadowColor: "#BFC8D6",
    shadowOpacity: 0.12,
    shadowRadius: scale(8),
    elevation: 3,
  },
  cardImageBox: {
    width: scale(58),
    height: scale(58),
    borderRadius: scale(12),
    marginRight: scale(16),
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  cardImagePlaceholder: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(8),
    backgroundColor: "#D9DBE9",
  },
  cardTitle: { fontSize: scale(17), fontWeight: "bold", color: "#222" },
  cardDesc: {
    color: "#BFC8D6",
    fontSize: scale(13),
    marginTop: scale(2),
    marginBottom: 0,
  },
  cardAuthor: {
    fontSize: scale(13),
    color: "#BFC8D6",
    marginLeft: scale(2),
    flexShrink: 1,
    minWidth: 0,
  },
  cardTotalCards: {
    fontSize: scale(13),
    color: "#3B5EFF",
    marginLeft: scale(2),
    fontWeight: "bold",
  },
  announcementBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: scale(7),
    backgroundColor: "#F1F6FF",
    paddingHorizontal: scale(8),
    paddingVertical: scale(3),
    borderRadius: scale(8),
  },
  announcementText: {
    marginLeft: scale(4),
    color: "#3B5EFF",
    fontSize: scale(13),
    flex: 1,
    fontWeight: "bold",
  },
  noAnnouncement: {
    fontSize: scale(12),
    color: "#BFC8D6",
    marginTop: scale(7),
    fontStyle: "italic",
  },
  emptyAddBtn: {
    marginTop: scale(18),
    backgroundColor: "#3B5EFF",
    borderRadius: scale(18),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(20),
    paddingVertical: scale(9),
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(40,40,50,0.22)",
    zIndex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: scale(18),
    padding: scale(22),
    width: width * 0.85,
    shadowColor: "#222",
    shadowOpacity: 0.11,
    shadowRadius: scale(10),
    elevation: 5,
  },
  modalTitle: {
    fontSize: scale(22),
    fontWeight: "700",
    color: "#222",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E4E6EF",
    borderRadius: scale(8),
    padding: scale(10),
    marginBottom: scale(10),
    fontSize: scale(16),
    color: "#222",
    backgroundColor: "#F7F8FB",
  },
  modalBtn: {
    paddingHorizontal: scale(20),
    paddingVertical: scale(10),
    borderRadius: scale(8),
    backgroundColor: "#F4F4FB",
    marginTop: scale(6),
    flexDirection: "row",
    alignItems: "center",
    minWidth: scale(64),
    justifyContent: "center",
  },
});
