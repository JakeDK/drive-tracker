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

export const STORAGE_KEYS = {
  TRIPS: "drive_tracker_trips",
  CLIENTS: "drive_tracker_clients",
  STATE: "drive_tracker_state",
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

  async getState(): Promise<{ isTracking: boolean }> {
    try {
      const state = await AsyncStorage.getItem(STORAGE_KEYS.STATE);
      return state ? JSON.parse(state) : { isTracking: false };
    } catch (error) {
      console.error("Error getting state:", error);
      return { isTracking: false };
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
};
