import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
  Switch,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface FamilyMember {
  id: number;
  name: string;
  role: string;
  avatar?: string;
}

interface Settings {
  theme: string;
  autoSync: boolean;
  enableVoiceInput: boolean;
  enableVisionInput: boolean;
  enableImageGeneration: boolean;
}

export default function SettingsScreen() {
  const colors = useColors();
  const { user, logout } = useAuth();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    theme: "classic",
    autoSync: true,
    enableVoiceInput: true,
    enableVisionInput: true,
    enableImageGeneration: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  const familyListQuery = trpc.family.list.useQuery();
  const settingsQuery = trpc.settings.get.useQuery(
    { familyMemberId: selectedMemberId || 0 },
    { enabled: !!selectedMemberId }
  );
  const updateSettingsMutation = trpc.settings.update.useMutation();

  // Load family members and selected member from storage
  useEffect(() => {
    const loadInitialData = async () => {
      const memberId = await AsyncStorage.getItem("selectedFamilyMemberId");
      if (memberId) {
        setSelectedMemberId(parseInt(memberId));
      }
      setIsLoading(false);
    };

    loadInitialData();
  }, []);

  // Update family members list
  useEffect(() => {
    if (familyListQuery.data) {
      setFamilyMembers(familyListQuery.data as FamilyMember[]);
    }
  }, [familyListQuery.data]);

  // Update settings when query data changes
  useEffect(() => {
    if (settingsQuery.data) {
      setSettings({
        theme: settingsQuery.data.theme || "classic",
        autoSync: settingsQuery.data.autoSync ?? true,
        enableVoiceInput: settingsQuery.data.enableVoiceInput ?? true,
        enableVisionInput: settingsQuery.data.enableVisionInput ?? true,
        enableImageGeneration: settingsQuery.data.enableImageGeneration ?? true,
      });
    }
  }, [settingsQuery.data]);

  const handleSelectMember = async (memberId: number) => {
    setSelectedMemberId(memberId);
    await AsyncStorage.setItem("selectedFamilyMemberId", memberId.toString());
    setShowMemberModal(false);
  };

  const handleSettingChange = async (key: keyof Settings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    if (selectedMemberId) {
      try {
        await updateSettingsMutation.mutateAsync({
          familyMemberId: selectedMemberId,
          [key]: value,
        });
      } catch (error) {
        console.error("Failed to update settings:", error);
      }
    }
  };

  const selectedMember = familyMembers.find((m) => m.id === selectedMemberId);

  if (isLoading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingVertical: 16 }}>
        {/* Header */}
        <View className="px-4 mb-6">
          <Text className="text-2xl font-bold text-foreground">Settings</Text>
        </View>

        {/* Family Member Selection */}
        <View className="px-4 mb-6">
          <Text className="text-sm font-semibold text-muted mb-2">FAMILY MEMBER</Text>
          <TouchableOpacity
            onPress={() => setShowMemberModal(true)}
            className="bg-surface border border-border rounded-lg p-4"
          >
            <Text className="text-lg font-semibold text-foreground">
              {selectedMember?.name || "Select Member"}
            </Text>
            {selectedMember && (
              <Text className="text-sm text-muted mt-1">{selectedMember.role}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Theme Selection */}
        <View className="px-4 mb-6">
          <Text className="text-sm font-semibold text-muted mb-2">THEME</Text>
          {["classic", "cyber-glitch", "electric-shimmer"].map((theme) => (
            <TouchableOpacity
              key={theme}
              onPress={() => handleSettingChange("theme", theme)}
              className={cn(
                "border border-border rounded-lg p-3 mb-2",
                settings.theme === theme ? "bg-primary border-primary" : "bg-surface"
              )}
            >
              <Text
                className={cn(
                  "font-semibold capitalize",
                  settings.theme === theme ? "text-background" : "text-foreground"
                )}
              >
                {theme.replace("-", " ")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Feature Toggles */}
        <View className="px-4 mb-6">
          <Text className="text-sm font-semibold text-muted mb-3">FEATURES</Text>

          <View className="bg-surface border border-border rounded-lg p-4 gap-4">
            {/* Auto Sync */}
            <View className="flex-row items-center justify-between">
              <Text className="text-foreground font-medium">Auto Sync</Text>
              <Switch
                value={settings.autoSync}
                onValueChange={(value) => handleSettingChange("autoSync", value)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={settings.autoSync ? colors.background : colors.muted}
              />
            </View>

            {/* Voice Input */}
            <View className="flex-row items-center justify-between">
              <Text className="text-foreground font-medium">Voice Input</Text>
              <Switch
                value={settings.enableVoiceInput}
                onValueChange={(value) => handleSettingChange("enableVoiceInput", value)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={settings.enableVoiceInput ? colors.background : colors.muted}
              />
            </View>

            {/* Vision Input */}
            <View className="flex-row items-center justify-between">
              <Text className="text-foreground font-medium">Vision Input</Text>
              <Switch
                value={settings.enableVisionInput}
                onValueChange={(value) => handleSettingChange("enableVisionInput", value)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={settings.enableVisionInput ? colors.background : colors.muted}
              />
            </View>

            {/* Image Generation */}
            <View className="flex-row items-center justify-between">
              <Text className="text-foreground font-medium">Image Generation</Text>
              <Switch
                value={settings.enableImageGeneration}
                onValueChange={(value) => handleSettingChange("enableImageGeneration", value)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={settings.enableImageGeneration ? colors.background : colors.muted}
              />
            </View>
          </View>
        </View>

        {/* Account Section */}
        <View className="px-4 mb-6">
          <Text className="text-sm font-semibold text-muted mb-2">ACCOUNT</Text>
          <View className="bg-surface border border-border rounded-lg p-4">
            <Text className="text-foreground mb-2">Logged in as:</Text>
            <Text className="text-sm text-muted mb-4">{user?.email || user?.name || "Unknown"}</Text>
            <TouchableOpacity
              onPress={logout}
              className="bg-error px-4 py-3 rounded-lg"
            >
              <Text className="text-background font-semibold text-center">Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View className="px-4 mb-6">
          <View className="bg-surface border border-border rounded-lg p-4">
            <Text className="text-sm text-muted">Oracle Mobile v1.0.0</Text>
            <Text className="text-xs text-muted mt-2">
              A unified consciousness across all devices
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Family Member Selection Modal */}
      <Modal
        visible={showMemberModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMemberModal(false)}
      >
        <View className="flex-1 bg-background">
          <ScreenContainer className="flex-1">
            <View className="flex-1 gap-4">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-2xl font-bold text-foreground">Select Member</Text>
                <TouchableOpacity onPress={() => setShowMemberModal(false)}>
                  <Text className="text-primary font-semibold text-lg">Done</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={familyMembers}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelectMember(item.id)}
                    className={cn(
                      "border border-border rounded-lg p-4 mb-2",
                      selectedMemberId === item.id ? "bg-primary border-primary" : "bg-surface"
                    )}
                  >
                    <Text
                      className={cn(
                        "text-lg font-semibold",
                        selectedMemberId === item.id ? "text-background" : "text-foreground"
                      )}
                    >
                      {item.name}
                    </Text>
                    <Text
                      className={cn(
                        "text-sm mt-1",
                        selectedMemberId === item.id ? "text-background opacity-70" : "text-muted"
                      )}
                    >
                      {item.role}
                    </Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id.toString()}
              />
            </View>
          </ScreenContainer>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
