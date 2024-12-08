import { useLocalSearchParams, Stack } from "expo-router";
import { View, ScrollView } from "react-native";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { StorageService, Trip } from "@/services/storage";

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);

  useEffect(() => {
    loadTrip();
  }, [id]);

  const loadTrip = async () => {
    if (id) {
      const tripData = await StorageService.getTripById(id);
      setTrip(tripData);
    }
  };

  if (!trip) {
    return null;
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <Stack.Screen
        options={{
          title: new Date(trip.startTime).toLocaleDateString(),
        }}
      />

      {/* Trip details content */}
      <View className="p-4">
        <Card className="p-4">
          <Text className="font-semibold">Trip Details</Text>
          <View className="mt-2 space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Distance</Text>
              <Text>{trip.distance.toFixed(1)} km</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Duration</Text>
              <Text>{Math.floor(trip.duration / 60)} min</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Start Time</Text>
              <Text>{new Date(trip.startTime).toLocaleTimeString()}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">End Time</Text>
              <Text>{new Date(trip.endTime).toLocaleTimeString()}</Text>
            </View>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}
