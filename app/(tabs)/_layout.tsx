import React from "react";
import { Tabs } from "expo-router";
import { Image } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import logo from "../../assets/logo.webp";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "black" }}>
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: "Drive tracker",
          title: "Home",
          headerLeft: () => (
            <Image
              source={logo}
              width={60}
              height={60}
              style={{ width: 60, height: 60 }}
            />
          ),
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="cog" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
