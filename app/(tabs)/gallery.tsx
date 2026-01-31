import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Artwork {
  id: number;
  imageUrl: string;
  prompt: string;
  createdAt: string;
}

export default function GalleryScreen() {
  const colors = useColors();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [familyMemberId, setFamilyMemberId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getArtworksQuery = trpc.gallery.getByMember.useQuery(
    { familyMemberId: familyMemberId || 0, limit: 100 },
    { enabled: !!familyMemberId }
  );

  // Get family member ID from storage
  useEffect(() => {
    const getFamilyMemberId = async () => {
      const memberId = await AsyncStorage.getItem("selectedFamilyMemberId");
      if (memberId) {
        setFamilyMemberId(parseInt(memberId));
      }
      setIsLoading(false);
    };

    getFamilyMemberId();
  }, []);

  // Update artworks when query data changes
  useEffect(() => {
    if (getArtworksQuery.data) {
      const formattedArtworks = getArtworksQuery.data.map((artwork) => ({
        id: artwork.id,
        imageUrl: artwork.imageUrl || "",
        prompt: artwork.prompt,
        createdAt: new Date(artwork.createdAt).toISOString(),
      }));
      setArtworks(formattedArtworks);
    }
  }, [getArtworksQuery.data]);

  const renderArtworkThumbnail = ({ item }: { item: Artwork }) => (
    <TouchableOpacity
      onPress={() => setSelectedArtwork(item)}
      className="flex-1 m-1 bg-surface rounded-lg overflow-hidden"
    >
      <Image
        source={{ uri: item.imageUrl }}
        className="w-full h-40"
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (!familyMemberId) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <Text className="text-center text-muted mb-4">
          Please select a family member in Settings
        </Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1 bg-background">
      <View className="flex-1 gap-4">
        {/* Header */}
        <View className="px-4 pt-4">
          <Text className="text-2xl font-bold text-foreground">Gallery</Text>
          <Text className="text-sm text-muted mt-1">
            {artworks.length} artwork{artworks.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {/* Gallery Grid */}
        {artworks.length > 0 ? (
          <FlatList
            data={artworks}
            renderItem={renderArtworkThumbnail}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 16 }}
            columnWrapperStyle={{ justifyContent: "space-between" }}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-center text-muted">
              No artworks yet. Ask Oracle to create something!
            </Text>
          </View>
        )}
      </View>

      {/* Full Image Modal */}
      <Modal
        visible={!!selectedArtwork}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedArtwork(null)}
      >
        <View className="flex-1 bg-black bg-opacity-90 items-center justify-center">
          {selectedArtwork && (
            <View className="w-full h-full items-center justify-center gap-4 px-4">
              <Image
                source={{ uri: selectedArtwork.imageUrl }}
                className="w-full h-2/3"
                resizeMode="contain"
              />

              <View className="bg-surface rounded-lg p-4 w-full">
                <Text className="text-sm text-muted mb-2">Prompt:</Text>
                <Text className="text-foreground text-base leading-relaxed">
                  {selectedArtwork.prompt}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setSelectedArtwork(null)}
                className="bg-primary px-6 py-3 rounded-full"
              >
                <Text className="text-background font-semibold">Close</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </ScreenContainer>
  );
}
