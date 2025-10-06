import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, ActivityIndicator, ImageBackground } from "react-native";
import * as Location from "expo-location";

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  const places = [
    { id: "1", name: "🏠 Mi Casa (Rivadavia 4976)", latitude: -34.6045, longitude: -58.4180 }, 
    { id: "2", name: "🎓 Escuela (ORT Yatay 240)", latitude: -34.6097, longitude: -58.4294 },
    { id: "3", name: "⚽ Club Ferro", latitude: -34.61867, longitude: -58.44783 },
  ];

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

  const formatDistance = (km) => {
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1)} km`;
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("❌ Permiso denegado para acceder a la ubicación.");
        setLoading(false);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      setLoading(false);
    })();
  }, []);

  const renderCard = ({ item }) => {
    let distText = null;
    if (location) {
      const distKm = getDistance(
        location.latitude,
        location.longitude,
        item.latitude,
        item.longitude
      );
      distText = formatDistance(distKm);
    }

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        {distText ? (
          <Text style={styles.cardText}>📏 Distancia: {distText}</Text>
        ) : (
          <Text style={styles.cardText}>Calculando...</Text>
        )}
      </View>
    );
  };

  return (
    <ImageBackground
      source={{ uri: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80" }}
      style={styles.background}
      blurRadius={3}
    >
      <View style={styles.container}>
        <Text style={styles.title}>📍 Distancias desde mi ubicación</Text>

        {loading && <ActivityIndicator size="large" color="#00d4ff" />}
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "rgba(0,0,0,0.3)", // ligera oscuridad sobre el fondo
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 25,
    textAlign: "center",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
    borderLeftWidth: 6,
    borderLeftColor: "#00d4ff",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    color: "#333",
  },
  cardText: {
    fontSize: 16,
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