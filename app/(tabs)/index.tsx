import { View, ScrollView, Platform, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { MapComponent } from "@/components/tracking/map";
import { Button } from "@/components/ui/button";
import * as Location from "expo-location";
import { MapPin, Clock, Navigation2, Calendar } from "lucide-react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { STORAGE_KEYS, StorageService, Trip } from "@/services/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TabOneScreen() {
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [distance, setDistance] = useState(0);
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);

  useEffect(() => {
    loadTrips();

    const checkTrackingState = async () => {
      const isTracking = (await StorageService.getState()).isTracking;
      setIsTracking(isTracking || false);
      loadTrips();
    };

    checkTrackingState();
    const interval = setInterval(checkTrackingState, 1000); // Check every second

    return () => clearInterval(interval);
  }, []);

  const loadTrips = async () => {
    const trips = await StorageService.getTrips();
    setRecentTrips(trips);
  };

  const handleTripPress = (tripId: string) => {
    router.push(`/trip/${tripId}`);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const startTracking = () => {
    router.push("/tracking");
  };

  const stopTracking = async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.STATE, "false");
    loadTrips();
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-4 py-6">
        {/* Tracking Button */}
        {!isTracking ? (
          <Button onPress={startTracking} className="bg-green-600">
            <Text className="text-primary-foreground">Start Tracking</Text>
          </Button>
        ) : (
          <Button onPress={stopTracking} className="bg-red-600">
            <Text className="text-primary-foreground">Stop Tracking</Text>
          </Button>
        )}
      </View>
      <View className="px-4 py-6 space-y-2">
        <Text className="mt-4 mb-2 font-semibold">Recent Trips</Text>
        {recentTrips.map((trip) => (
          <TouchableOpacity
            key={trip.id}
            onPress={() => handleTripPress(trip.id)}
          >
            <Card className="p-4">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="font-semibold">
                    {new Date(trip.startTime).toLocaleDateString()}
                  </Text>
                  <Text className="text-muted-foreground">
                    {formatTime(trip.startTime)} - {formatTime(trip.endTime)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="font-semibold">
                    {trip.distance.toFixed(1)} km
                  </Text>
                  <Text className="text-muted-foreground">
                    {Math.floor(trip.duration / 60)} min {trip.duration % 60}{" "}
                    sec
                  </Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
