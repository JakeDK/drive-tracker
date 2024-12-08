import { View, ScrollView, Platform, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { MapComponent } from "@/components/tracking/map";
import { Button } from "@/components/ui/button";
import * as Location from "expo-location";
import { MapPin, Clock, Navigation2, Calendar } from "lucide-react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { StorageService, Trip } from "@/services/storage";

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

  const toggleTracking = () => {
    setIsTracking(!isTracking);
  };

  const initializeDummyData = async () => {
    await StorageService.initializeDummyData();
    loadTrips(); // Reload the trips after initializing dummy data
  };

  useEffect(() => {
    initializeDummyData();
  }, []);

  return (
    <ScrollView className="flex-1 bg-background">
      {/* Map Placeholder for Web */}
      {/* <View className="items-center justify-center w-full bg-gray-100 h-96">
        <Text className="text-gray-500">
          <MapComponent
            location={
              location
                ? {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                  }
                : undefined
            }
          />
        </Text>
      </View> */}
      {/* Controls and Stats */}
      <View className="px-4 py-6">
        {/* Tracking Button */}
        <Button
          onPress={() => router.push("/tracking")}
          className="bg-green-600"
        >
          <Text className="text-primary-foreground">Start Tracking</Text>
        </Button>

        {/* Current Trip Stats */}
        {isTracking && (
          <Card className="p-4 mb-6">
            <Text className="mb-4 text-lg font-bold">Current Trip</Text>
            <View className="flex-row justify-between">
              <View className="items-center">
                <Clock className="mb-2" size={24} color="#6b7280" />
                <Text className="text-2xl font-bold">{elapsedTime}m</Text>
                <Text className="text-sm text-muted-foreground">Duration</Text>
              </View>
              <View className="items-center">
                <Navigation2 className="mb-2" size={24} color="#6b7280" />
                <Text className="text-2xl font-bold">
                  {distance.toFixed(1)}km
                </Text>
                <Text className="text-sm text-muted-foreground">Distance</Text>
              </View>
            </View>
          </Card>
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
                    {Math.floor(trip.duration / 60)} min
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
