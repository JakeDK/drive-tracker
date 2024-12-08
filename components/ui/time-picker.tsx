import React, { useState } from "react";
import { View, TouchableOpacity, Platform, Modal } from "react-native";
import { Text } from "./text";
import { Button } from "./button";
import DateTimePicker from "@react-native-community/datetimepicker";

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  label?: string;
}

export function TimePicker({ value, onChange, label }: TimePickerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tempDate, setTempDate] = useState(new Date(`2000-01-01T${value}`));

  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setIsVisible(false);
    }

    if (selectedDate) {
      setTempDate(selectedDate);
      const timeString = selectedDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      onChange(timeString);
    }
  };

  // For iOS modal approach
  const handleIosConfirm = () => {
    setIsVisible(false);
    const timeString = tempDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    onChange(timeString);
  };

  return (
    <View>
      {label && <Text className="mb-2 text-sm font-medium">{label}</Text>}
      <TouchableOpacity
        onPress={() => setIsVisible(true)}
        className="flex h-10 px-3 py-2 border rounded-md border-input bg-background"
      >
        <Text>{value}</Text>
      </TouchableOpacity>

      {Platform.OS === "ios" ? (
        <Modal visible={isVisible} transparent={true} animationType="slide">
          <View className="justify-end flex-1 bg-black/50">
            <View className="p-4 bg-background">
              <DateTimePicker
                value={tempDate}
                mode="time"
                display="spinner"
                onChange={handleChange}
              />
              <View className="flex-row justify-end mt-2 space-x-2">
                <Button variant="outline" onPress={() => setIsVisible(false)}>
                  Cancel
                </Button>
                <Button onPress={handleIosConfirm}>Confirm</Button>
              </View>
            </View>
          </View>
        </Modal>
      ) : (
        isVisible && (
          <DateTimePicker
            value={tempDate}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={handleChange}
          />
        )
      )}
    </View>
  );
}
