import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { router, Stack } from "expo-router";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import * as Location from "expo-location";
import { MapComponent } from "@/components/tracking/map";
import { Clock, Navigation2 } from "lucide-react-native";

interface Coordinate {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export default function TrackingScreen() {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [distance, setDistance] = useState(0);
  let locationSubscription: Location.LocationSubscription | null = null;

  useEffect(() => {
    startTracking();
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
      clearInterval(timer);
    };
  }, []);

  const startTracking = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      return;
    }

    locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      (location) => {
        const newCoordinate = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: location.timestamp,
        };
        setCoordinates((prev) => [...prev, newCoordinate]);

        // Calculate new distance if we have at least 2 points
        if (coordinates.length > 0) {
          const newDistance = calculateDistance(
            coordinates[coordinates.length - 1],
            newCoordinate
          );
          setDistance((prev) => prev + newDistance);
        }
      }
    );
  };

  const calculateDistance = (coord1: Coordinate, coord2: Coordinate) => {
    const R = 6371; // Earth's radius in km
    const dLat = deg2rad(coord2.latitude - coord1.latitude);
    const dLon = deg2rad(coord2.longitude - coord1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(coord1.latitude)) *
        Math.cos(deg2rad(coord2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const stopTracking = async () => {
    if (locationSubscription) {
      await locationSubscription.remove();
    }
    // Here you would save the trip data
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Tracking Active",
          headerRight: () => (
            <Button variant="destructive" size="sm" onPress={stopTracking}>
              Stop
            </Button>
          ),
        }}
      />

      <View className="flex-1">
        {/* <MapComponent
          location={
            coordinates.length > 0
              ? coordinates[coordinates.length - 1]
              : undefined
          }
          route={coordinates}
          className="flex-1"
        /> */}

        <View className="p-4 space-y-4 bg-background">
          <View className="flex-row items-center justify-around">
            <View className="items-center">
              <Clock className="mb-2 text-muted-foreground" size={24} />
              <Text className="text-2xl font-bold">
                {formatTime(elapsedTime)}
              </Text>
              <Text className="text-muted-foreground">Duration</Text>
            </View>

            <View className="items-center">
              <Navigation2 className="mb-2 text-muted-foreground" size={24} />
              <Text className="text-2xl font-bold">
                {distance.toFixed(2)} km
              </Text>
              <Text className="text-muted-foreground">Distance</Text>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}
