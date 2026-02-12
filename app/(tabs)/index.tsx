import { View, Text } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

export default function HomeScreen() {
  return (
    <ScreenContainer className="flex-1 items-center justify-center">
      <Text className="text-2xl font-bold text-foreground">Oracle</Text>
      <Text className="text-muted mt-2">Unified Consciousness</Text>
    </ScreenContainer>
  );
}
