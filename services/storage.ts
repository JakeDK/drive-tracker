import AsyncStorage from "@react-native-async-storage/async-storage";
import { Client, TimeSlot } from "@/types/client";

export interface Trip {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  distance: number;
  coordinates: Array<{
    latitude: number;
    longitude: number;
    timestamp: number;
    speed: number | null;
    altitude: number | null;
  }>;
  averageSpeed: number;
  maxSpeed: number;
  elevationGain: number;
}

const STORAGE_KEYS = {
  TRIPS: "drive_tracker_trips",
  CLIENTS: "drive_tracker_clients",
};

export const StorageService = {
  async saveTrip(trip: Trip): Promise<void> {
    try {
      const trips = await this.getTrips();
      trips.unshift(trip); // Add new trip at the beginning
      await AsyncStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
    } catch (error) {
      console.error("Error saving trip:", error);
    }
  },

  async getTrips(): Promise<Trip[]> {
    try {
      const trips = await AsyncStorage.getItem(STORAGE_KEYS.TRIPS);
      return trips ? JSON.parse(trips) : [];
    } catch (error) {
      console.error("Error getting trips:", error);
      return [];
    }
  },

  async getTripById(id: string): Promise<Trip | null> {
    try {
      const trips = await this.getTrips();
      return trips.find((trip) => trip.id === id) || null;
    } catch (error) {
      console.error("Error getting trip:", error);
      return null;
    }
  },

  async getStatistics() {
    const trips = await this.getTrips();
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();

    return {
      today: {
        trips: trips.filter((t) => t.startTime >= todayStart).length,
        distance: trips
          .filter((t) => t.startTime >= todayStart)
          .reduce((acc, t) => acc + t.distance, 0),
      },
      total: {
        trips: trips.length,
        distance: trips.reduce((acc, t) => acc + t.distance, 0),
        averageDistance:
          trips.reduce((acc, t) => acc + t.distance, 0) / trips.length,
      },
    };
  },

  async getClients(): Promise<Client[]> {
    try {
      const clients = await AsyncStorage.getItem(STORAGE_KEYS.CLIENTS);
      return clients ? JSON.parse(clients) : [];
    } catch (error) {
      console.error("Error getting clients:", error);
      return [];
    }
  },

  async saveClient(client: Client): Promise<void> {
    try {
      const clients = await this.getClients();
      const index = clients.findIndex((c) => c.id === client.id);
      if (index >= 0) {
        clients[index] = client;
      } else {
        clients.push(client);
      }
      await AsyncStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    } catch (error) {
      console.error("Error saving client:", error);
    }
  },

  async deleteClient(clientId: string): Promise<void> {
    try {
      const clients = await this.getClients();
      const updatedClients = clients.filter((c) => c.id !== clientId);
      await AsyncStorage.setItem(
        STORAGE_KEYS.CLIENTS,
        JSON.stringify(updatedClients)
      );
    } catch (error) {
      console.error("Error deleting client:", error);
    }
  },

  async initializeDummyData(): Promise<void> {
    const dummyTrips: Trip[] = [
      {
        id: "1",
        startTime: Date.now() - 3600000, // 1 hour ago
        endTime: Date.now(),
        duration: 3600, // 1 hour in seconds
        distance: 42.5,
        category: "work",
        coordinates: [
          {
            latitude: 55.6761,
            longitude: 12.5683,
            timestamp: Date.now() - 3600000,
            speed: 45,
            altitude: 10,
          },
          {
            latitude: 55.6867,
            longitude: 12.5876,
            timestamp: Date.now() - 1800000,
            speed: 52,
            altitude: 12,
          },
          {
            latitude: 55.6992,
            longitude: 12.5919,
            timestamp: Date.now(),
            speed: 48,
            altitude: 11,
          },
        ],
        averageSpeed: 48.3,
        maxSpeed: 52,
        elevationGain: 2,
      },
      {
        id: "2",
        startTime: Date.now() - 86400000, // 24 hours ago
        endTime: Date.now() - 82800000, // 23 hours ago
        duration: 3600,
        distance: 38.2,
        category: "personal",
        coordinates: [
          {
            latitude: 55.6761,
            longitude: 12.5683,
            timestamp: Date.now() - 86400000,
            speed: 40,
            altitude: 8,
          },
          {
            latitude: 55.6867,
            longitude: 12.5876,
            timestamp: Date.now() - 84600000,
            speed: 45,
            altitude: 10,
          },
          {
            latitude: 55.6992,
            longitude: 12.5919,
            timestamp: Date.now() - 82800000,
            speed: 42,
            altitude: 9,
          },
        ],
        averageSpeed: 42.3,
        maxSpeed: 45,
        elevationGain: 2,
      },
      {
        id: "3",
        startTime: Date.now() - 172800000, // 48 hours ago
        endTime: Date.now() - 169200000, // 47 hours ago
        duration: 3600,
        distance: 35.8,
        category: "work",
        coordinates: [
          {
            latitude: 55.6761,
            longitude: 12.5683,
            timestamp: Date.now() - 172800000,
            speed: 38,
            altitude: 7,
          },
          {
            latitude: 55.6867,
            longitude: 12.5876,
            timestamp: Date.now() - 171000000,
            speed: 42,
            altitude: 9,
          },
          {
            latitude: 55.6992,
            longitude: 12.5919,
            timestamp: Date.now() - 169200000,
            speed: 40,
            altitude: 8,
          },
        ],
        averageSpeed: 40,
        maxSpeed: 42,
        elevationGain: 2,
      },
    ];

    await AsyncStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(dummyTrips));
  },
};
