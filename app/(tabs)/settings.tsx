import { View, ScrollView, TouchableOpacity, Switch } from "react-native";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { router } from "expo-router";
import { Plus, User2, MapPin, Clock } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Client } from "@/types/client";
import { StorageService } from "@/services/storage";

export default function SettingsScreen() {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const loadedClients = await StorageService.getClients();
    setClients(loadedClients);
  };

  return (
    <ScrollView className="flex-1 p-4 bg-background">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-xl font-bold">Clients</Text>
        <Button
          variant="outline"
          size="sm"
          onPress={() => router.push("/client/new")}
        >
          <Plus size={16} className="mr-1" />
          <Text>Add Client</Text>
        </Button>
      </View>

      <View className="space-y-2">
        {clients.map((client) => (
          <TouchableOpacity
            key={client.id}
            onPress={() => router.push(`/client/${client.id}`)}
          >
            <Card className="p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <User2 size={20} className="mr-2 text-muted-foreground" />
                  <View>
                    <Text className="font-semibold">{client.name}</Text>
                    <Text className="text-sm text-muted-foreground">
                      {client.timeSlots.length} time slots
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <Switch
                    value={client.isActive}
                    onValueChange={async (value) => {
                      const updatedClient = { ...client, isActive: value };
                      await StorageService.saveClient(updatedClient);
                      loadClients();
                    }}
                  />
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
