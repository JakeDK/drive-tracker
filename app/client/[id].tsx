import { View, ScrollView, Alert } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { MapPin, Clock, Plus, Trash } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Client, TimeSlot } from "@/types/client";
import { StorageService } from "@/services/storage";
import { TimePicker } from "@/components/ui/time-picker";
import { AddressSearch } from "@/components/ui/address-search";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function ClientScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [client, setClient] = useState<Client>({
    id: id === "new" ? Date.now().toString() : id,
    name: "",
    address: "",
    timeSlots: [],
    isActive: true,
  });

  useEffect(() => {
    if (id !== "new") {
      loadClient();
    }
  }, [id]);

  const loadClient = async () => {
    const clients = await StorageService.getClients();
    const foundClient = clients.find((c) => c.id === id);
    if (foundClient) {
      setClient(foundClient);
    }
  };

  const handleSave = async () => {
    await StorageService.saveClient(client);
    router.back();
  };

  const addTimeSlot = () => {
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      startTime: "09:00",
      endTime: "17:00",
      days: [1, 2, 3, 4, 5], // Monday to Friday
    };
    setClient((prev) => ({
      ...prev,
      timeSlots: [...prev.timeSlots, newSlot],
    }));
  };

  const updateTimeSlot = (slotId: string, updates: Partial<TimeSlot>) => {
    setClient((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.map((slot) =>
        slot.id === slotId ? { ...slot, ...updates } : slot
      ),
    }));
  };

  const deleteTimeSlot = (slotId: string) => {
    setClient((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((slot) => slot.id !== slotId),
    }));
  };

  const toggleDay = (slotId: string, day: number) => {
    const slot = client.timeSlots.find((s) => s.id === slotId);
    if (slot) {
      const days = slot.days.includes(day)
        ? slot.days.filter((d) => d !== day)
        : [...slot.days, day];
      updateTimeSlot(slotId, { days });
    }
  };
  const handleDelete = () => {
    Alert.alert(
      "Delete Client",
      "Are you sure you want to delete this client? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await StorageService.deleteClient(client.id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <Stack.Screen
        options={{
          title: id === "new" ? "New Client" : client.name,
          headerRight: () => (
            <View className="flex-row space-x-2">
              {id !== "new" && (
                <Button variant="ghost" onPress={handleDelete}>
                  <Trash size={16} className="text-destructive" />
                </Button>
              )}
              <Button variant="ghost" onPress={handleSave}>
                Save
              </Button>
            </View>
          ),
        }}
      />

      <View className="p-4 space-y-4">
        <Card className="relative z-10 p-4">
          <Text className="mb-2 font-semibold">Client Details</Text>
          <View className="space-y-4">
            <Input
              placeholder="Client Name"
              value={client.name}
              onChangeText={(text) =>
                setClient((prev) => ({ ...prev, name: text }))
              }
            />
            <AddressSearch
              onSelect={(address) =>
                setClient((prev) => ({ ...prev, address }))
              }
            />
          </View>
        </Card>

        <Card className="p-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="font-semibold">Time Slots</Text>
            <Button variant="outline" size="sm" onPress={addTimeSlot}>
              <Plus size={16} className="mr-1" />
              <Text>Add Slot</Text>
            </Button>
          </View>

          <View className="space-y-4">
            {client.timeSlots.map((slot) => (
              <View key={slot.id} className="p-4 border rounded-lg">
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center space-x-4">
                    <TimePicker
                      value={slot.startTime}
                      onChange={(time) =>
                        updateTimeSlot(slot.id, { startTime: time })
                      }
                    />
                    <Text>to</Text>
                    <TimePicker
                      value={slot.endTime}
                      onChange={(time) =>
                        updateTimeSlot(slot.id, { endTime: time })
                      }
                    />
                  </View>
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => deleteTimeSlot(slot.id)}
                  >
                    <Trash size={16} className="text-destructive" />
                  </Button>
                </View>

                <View className="flex-row flex-wrap gap-2">
                  {DAYS.map((day, index) => (
                    <Button
                      key={day}
                      variant={
                        slot.days.includes(index) ? "default" : "outline"
                      }
                      size="sm"
                      className={slot.days.includes(index) ? "text-white" : ""}
                      onPress={() => toggleDay(slot.id, index)}
                    >
                      {day}
                    </Button>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}
