import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Animated,
} from "react-native";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  const places = [
    { id: "1", name: "🏠 Mi Casa", latitude: -34.6045, longitude: -58.4180 },
    { id: "2", name: "🎓 Escuela", latitude: -34.6097, longitude: -58.4294 },
    { id: "3", name: "⚽ Club Ferro", latitude: -34.61867, longitude: -58.44783 },
  ];

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("❌ Permiso denegado para acceder a la ubicación.");
        setLoading(false);
        return;
      }

      // Obtenemos la ubicación una sola vez
      let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      setLocation(loc.coords);
      setLoading(false);
    })();
  }, []);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const formatDistance = (km) =>
    km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;

  const renderCard = ({ item }) => {
    let distText = "Calculando...";
    if (location) {
      const distKm = getDistance(location.latitude, location.longitude, item.latitude, item.longitude);
      distText = formatDistance(distKm);
    }

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardDistance}>📏 {distText}</Text>
        {location && (
          <Text style={styles.cardCoords}>
            🌐 {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
          </Text>
        )}
      </View>
    );
  };

  return (
    <LinearGradient
      colors={["#00d4ff", "#6a00f4", "#ff0099"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <Text style={styles.title}>📍 Distancias desde mi ubicación</Text>
        {loading && <ActivityIndicator size="large" color="#fff" />}
        {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
        {!loading && !errorMsg && (
          <FlatList
            data={places}
            renderItem={renderCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 30 }}
          />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 25,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    color: "#333",
  },
  cardDistance: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0077ff",
    marginBottom: 5,
  },
  cardCoords: {
    fontSize: 14,
    fontWeight: "400",
    color: "#555",
  },
  error: {
    color: "#ff5b5b",
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
  },
});
