import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { Text } from "./text";
import { Input } from "./input";
import { MapPin } from "lucide-react-native";
import debounce from "lodash/debounce";

interface Address {
  tekst: string;
  adresse: {
    id: string;
    vejnavn: string;
    husnr: string;
    postnr: string;
    postnrnavn: string;
  };
}

interface AddressSearchProps {
  onSelect: (address: string) => void;
}

export function AddressSearch({ onSelect }: AddressSearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchAddress = debounce(async (text: string) => {
    if (text.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.dataforsyningen.dk/adresser/autocomplete?q=${encodeURIComponent(
          text
        )}`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Error searching addresses:", error);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  const handleSelect = (address: Address) => {
    setQuery(address.tekst);
    setSuggestions([]);
    onSelect(address.tekst);
  };

  return (
    <View className="relative">
      <Input
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          searchAddress(text);
        }}
        placeholder="Search address..."
      />

      {suggestions.length > 0 && (
        <ScrollView className="absolute z-10 w-full border rounded-md shadow-lg top-12 max-h-64 border-border bg-background">
          {suggestions.map((suggestion) => (
            <TouchableOpacity
              key={suggestion.adresse.id}
              className="flex-row items-center p-3 border-b border-border"
              onPress={() => handleSelect(suggestion)}
            >
              <MapPin size={16} className="mr-2 text-muted-foreground" />
              <Text>{suggestion.tekst}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
