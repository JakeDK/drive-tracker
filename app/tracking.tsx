import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { router, Stack } from "expo-router";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import * as Location from "expo-location";
import { MapComponent } from "@/components/tracking/map";
import { Clock, Navigation2 } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS, StorageService } from "@/services/storage";

interface Coordinate {
  latitude: number;
  longitude: number;
  timestamp: number;
  speed?: number | null;
  altitude?: number | null;
}

export default function TrackingScreen() {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [distance, setDistance] = useState(0);
  const [startTime] = useState(Date.now());
  let locationSubscription: Location.LocationSubscription | null = null;

  useEffect(() => {
    startTracking();
    const setInitialState = async () => {
      await AsyncStorage.setItem(STORAGE_KEYS.STATE, "true");
    };
    setInitialState();

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
        const newCoordinate: Coordinate = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: location.timestamp,
          speed: location.coords.speed,
          altitude: location.coords.altitude,
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

    // Calculate trip statistics
    const speeds = coordinates
      .map((coord) => coord.speed)
      .filter(
        (speed): speed is number => speed !== null && speed !== undefined
      );

    const maxSpeed = Math.max(...speeds);
    const averageSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;

    // Calculate elevation gain if altitude data is available
    let elevationGain = 0;
    if (coordinates.length > 1) {
      for (let i = 1; i < coordinates.length; i++) {
        const prevAlt = coordinates[i - 1].altitude;
        const currentAlt = coordinates[i].altitude;
        if (prevAlt && currentAlt && currentAlt > prevAlt) {
          elevationGain += currentAlt - prevAlt;
        }
      }
    }

    // Save trip data
    const tripData = {
      id: startTime.toString(),
      startTime: startTime,
      endTime: Date.now(),
      duration: elapsedTime,
      distance: distance,
      coordinates: coordinates,
      averageSpeed: averageSpeed,
      maxSpeed: maxSpeed,
      elevationGain: elevationGain,
    };

    await StorageService.saveTrip(tripData);
    await AsyncStorage.setItem(STORAGE_KEYS.STATE, "false");

    router.replace("/");
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Tracking Active",
          headerRight: () => (
            <Button variant="destructive" size="sm" onPress={stopTracking}>
              <Text>Stop</Text>
            </Button>
          ),
        }}
      />

      <View style={{ flex: 1 }}>
        {/* Map Component would go here */}
        <View style={{ padding: 16, gap: 16, backgroundColor: "background" }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-around",
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Clock style={{ marginBottom: 8, color: "gray" }} size={24} />
              <Text style={{ fontSize: 24, fontWeight: "bold" }}>
                {formatTime(elapsedTime)}
              </Text>
              <Text style={{ color: "gray" }}>Duration</Text>
            </View>

            <View style={{ alignItems: "center" }}>
              <Navigation2
                style={{ marginBottom: 8, color: "gray" }}
                size={24}
              />
              <Text style={{ fontSize: 24, fontWeight: "bold" }}>
                {distance.toFixed(2)} km
              </Text>
              <Text style={{ color: "gray" }}>Distance</Text>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}
