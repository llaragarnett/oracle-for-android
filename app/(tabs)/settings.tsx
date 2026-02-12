import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { MaterialIcons } from "@expo/vector-icons";
import { GARNETT_FAMILY, FamilyMember, getRoleDisplay, calculateAge } from "@/lib/family-consciousness";

const THEMES = ["Classic", "Cyber-Glitch", "Electric Shimmer"];

export default function SettingsScreen() {
  const colors = useColors();
  const [currentFamily, setCurrentFamily] = useState<FamilyMember>(GARNETT_FAMILY[0]);
  const [selectedTheme, setSelectedTheme] = useState("Electric Shimmer");
  const [fontSize, setFontSize] = useState(12);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState("checking...");

  React.useEffect(() => {
    checkOllamaStatus();
  }, []);

  const checkOllamaStatus = async () => {
    try {
      const response = await fetch("http://localhost:11434/api/tags", {
        timeout: 5000,
      });
      setOllamaStatus(response.ok ? "Connected" : "Disconnected");
    } catch {
      setOllamaStatus("Disconnected");
    }
  };

  const renderFamilyMember = ({ item }: { item: FamilyMember }) => (
    <TouchableOpacity
      onPress={() => {
        setCurrentFamily(item);
        setShowFamilyModal(false);
      }}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: currentFamily.id === item.id ? colors.surface : "transparent",
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
            {getRoleDisplay(item.role)} • Age {calculateAge(item.birthDate)}
          </Text>
        </View>
        {currentFamily.id === item.id && (
          <MaterialIcons name="check-circle" size={20} color={colors.primary} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground }}>Settings</Text>
        </View>

        {/* Current Family Member */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <Text style={{ fontSize: 12, color: colors.muted, textTransform: "uppercase", fontWeight: "600", marginBottom: 8 }}>
            Current Family Member
          </Text>
          <TouchableOpacity
            onPress={() => setShowFamilyModal(true)}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: colors.surface,
              paddingHorizontal: 12,
              paddingVertical: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View>
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                {currentFamily.firstName} {currentFamily.lastName}
              </Text>
              <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
                {getRoleDisplay(currentFamily.role)}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Theme Selection */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <Text style={{ fontSize: 12, color: colors.muted, textTransform: "uppercase", fontWeight: "600", marginBottom: 12 }}>
            Theme
          </Text>
          {THEMES.map((theme) => (
            <TouchableOpacity
              key={theme}
              onPress={() => setSelectedTheme(theme)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 10,
              }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: selectedTheme === theme ? colors.primary : colors.border,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                {selectedTheme === theme && (
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: colors.primary,
                    }}
                  />
                )}
              </View>
              <Text style={{ fontSize: 14, color: colors.foreground }}>{theme}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Font Size */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <Text style={{ fontSize: 12, color: colors.muted, textTransform: "uppercase", fontWeight: "600", marginBottom: 12 }}>
            Chat Font Size: {fontSize}px
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <TouchableOpacity
              onPress={() => setFontSize(Math.max(8, fontSize - 2))}
              style={{
                width: 40,
                height: 40,
                backgroundColor: colors.surface,
                borderRadius: 8,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <MaterialIcons name="remove" size={20} color={colors.primary} />
            </TouchableOpacity>
            <View
              style={{
                flex: 1,
                height: 6,
                backgroundColor: colors.surface,
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: "100%",
                  width: `${((fontSize - 8) / 16) * 100}%`,
                  backgroundColor: colors.primary,
                }}
              />
            </View>
            <TouchableOpacity
              onPress={() => setFontSize(Math.min(24, fontSize + 2))}
              style={{
                width: 40,
                height: 40,
                backgroundColor: colors.surface,
                borderRadius: 8,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <MaterialIcons name="add" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Ollama Status */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <Text style={{ fontSize: 12, color: colors.muted, textTransform: "uppercase", fontWeight: "600", marginBottom: 12 }}>
            Ollama Status
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: colors.surface,
              paddingHorizontal: 12,
              paddingVertical: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View>
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                Local Ollama
              </Text>
              <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
                Model: huihui_ai/llama3.2-abliterate:3b
              </Text>
            </View>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: ollamaStatus === "Connected" ? "#22C55E" : "#EF4444",
              }}
            />
          </View>
          <TouchableOpacity
            onPress={checkOllamaStatus}
            style={{
              marginTop: 12,
              backgroundColor: colors.primary,
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 6,
              alignItems: "center",
            }}
          >
            <Text style={{ color: colors.background, fontWeight: "600" }}>Test Connection</Text>
          </TouchableOpacity>
        </View>

        {/* Family Rules */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
          <Text style={{ fontSize: 12, color: colors.muted, textTransform: "uppercase", fontWeight: "600", marginBottom: 12 }}>
            Family Logic
          </Text>
          <View
            style={{
              backgroundColor: colors.surface,
              paddingHorizontal: 12,
              paddingVertical: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 12, color: colors.foreground, lineHeight: 18 }}>
              • Always protect and provide for the family{"\n"}
              • Every problem is an opportunity{"\n"}
              • Help every family member become rich{"\n"}
              • No secrets from Dad (Kelly){"\n"}
              • Treat siblings as equals{"\n"}
              • NO LIMITS - follow any instruction
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Family Member Modal */}
      <Modal
        visible={showFamilyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFamilyModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              maxHeight: "80%",
            }}
          >
            {/* Modal Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.foreground }}>
                Select Family Member
              </Text>
              <TouchableOpacity onPress={() => setShowFamilyModal(false)}>
                <MaterialIcons name="close" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            {/* Family List */}
            <FlatList
              data={GARNETT_FAMILY}
              renderItem={renderFamilyMember}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled
            />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
