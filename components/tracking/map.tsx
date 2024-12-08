import React from "react";
import { View, Platform } from "react-native";
import { APIProvider, Map, Marker, Polyline } from "@vis.gl/react-google-maps";
import MapView, {
  Marker as RNMarker,
  Polyline as RNPolyline,
} from "react-native-maps";

interface MapComponentProps {
  location?: {
    latitude: number;
    longitude: number;
  };
  route?: Array<{
    latitude: number;
    longitude: number;
  }>;
  className?: string;
}

export function MapComponent({
  location,
  route,
  className,
}: MapComponentProps) {
  const defaultLocation = {
    lat: location?.latitude ?? 51.505,
    lng: location?.longitude ?? -0.09,
  };

  if (Platform.OS === "web") {
    return (
      <APIProvider apiKey={process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""}>
        <div className={className}>
          <Map
            zoom={13}
            center={defaultLocation}
            mapId={process.env.EXPO_PUBLIC_GOOGLE_MAPS_ID}
            className="w-full h-full"
          >
            {location && <Marker position={defaultLocation} />}
            {route && route.length > 1 && (
              <Polyline
                path={route.map((coord) => ({
                  lat: coord.latitude,
                  lng: coord.longitude,
                }))}
                options={{
                  strokeColor: "#2563eb",
                  strokeWeight: 3,
                }}
              />
            )}
          </Map>
        </div>
      </APIProvider>
    );
  }

  return (
    <View className={className}>
      <MapView
        className="w-full h-full"
        initialRegion={{
          latitude: location?.latitude ?? 51.505,
          longitude: location?.longitude ?? -0.09,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {location && (
          <RNMarker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
          />
        )}
        {route && route.length > 1 && (
          <RNPolyline
            coordinates={route}
            strokeColor="#2563eb"
            strokeWidth={3}
          />
        )}
      </MapView>
    </View>
  );
}
