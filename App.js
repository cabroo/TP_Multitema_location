import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from "react-native";
import * as Location from "expo-location";

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lugares fijos (con direcciones reales o aproximadas)
  const places = [
    { id: "1", name: "🏠 Mi Casa (Rivadavia 4976)", latitude: -34.6045, longitude: -58.4180 }, 
    { id: "2", name: "🎓 Escuela (ORT Yatay 240)", latitude: -34.6097, longitude: -58.4294 },
    { id: "3", name: "⚽ Club Ferro", latitude: -34.61867, longitude: -58.44783 },
  ];

  // Función para calcular distancia (Haversine)
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // radio Tierra en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // en km
  };

  // Función para formatear la distancia
  const formatDistance = (km) => {
    if (km < 1) {
      return `${Math.round(km * 1000)} m`; // metros sin decimales
    }
    return `${km.toFixed(1)} km`; // 1 decimal
  };

  // Obtener ubicación actual al iniciar
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

  // Render de cada card
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
    <View style={styles.container}>
      <Text style={styles.title}>📍 Distancias desde mi ubicación</Text>

      {loading && <ActivityIndicator size="large" color="blue" />}
      {errorMsg && <Text>{errorMsg}</Text>}

      {!loading && !errorMsg && (
        <FlatList
          data={places}
          renderItem={renderCard}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: "#f4f6f8",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  cardText: {
    fontSize: 16,
    color: "#333",
  },
});
