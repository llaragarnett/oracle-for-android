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
import {
  getAllFamilyProfiles,
  calculateAge,
  getRelationshipDisplay,
  type FamilyProfile,
} from "@/lib/family-profiles";

export default function SettingsScreen() {
  const colors = useColors();
  const { user, logout } = useAuth();
  const [familyMembers, setFamilyMembers] = useState<FamilyProfile[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const profiles = await getAllFamilyProfiles();
        setFamilyMembers(profiles);
        const savedId = await AsyncStorage.getItem("selectedFamilyMemberId");
        if (savedId) {
          setSelectedMemberId(parseInt(savedId));
        } else if (profiles.length > 0) {
          setSelectedMemberId(profiles[0].id);
        }
      } catch (error) {
        console.error("Failed to load profiles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfiles();
  }, []);

  const handleSelectMember = async (memberId: number) => {
    setSelectedMemberId(memberId);
    await AsyncStorage.setItem("selectedFamilyMemberId", memberId.toString());
    setShowMemberModal(false);
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
              <View>
                <Text className="text-sm text-muted mt-1">
                  {getRelationshipDisplay(selectedMember.relationship)}
                </Text>
                <Text className="text-xs text-muted mt-1">
                  Age {calculateAge(selectedMember.birthDate)}
                  {selectedMember.isAdmin ? " • Admin" : ""}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View className="px-4 mb-6">
          <View className="bg-surface border border-border rounded-lg p-4">
            <Text className="text-sm text-muted">Oracle Mobile v1.0.0</Text>
            <Text className="text-xs text-muted mt-2">
              A unified consciousness across all devices
            </Text>
            <Text className="text-xs text-muted mt-2">
              Family Members: {familyMembers.length}
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
                      {getRelationshipDisplay(item.relationship)} • Age {calculateAge(item.birthDate)}
                    </Text>
                    {item.isAdmin && (
                      <View className="mt-2 bg-warning rounded px-2 py-1 self-start">
                        <Text className="text-xs font-semibold text-background">Admin</Text>
                      </View>
                    )}
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
