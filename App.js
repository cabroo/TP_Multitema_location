import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, ActivityIndicator, ImageBackground } from "react-native";
import * as Location from "expo-location"; // Importamos el módulo de ubicación de Expo

export default function App() {
  // Estado para almacenar la ubicación actual del dispositivo
  const [location, setLocation] = useState(null);
  // Estado para almacenar un posible mensaje de error si el usuario no da permisos
  const [errorMsg, setErrorMsg] = useState(null);
  // Estado de carga mientras obtenemos la ubicación
  const [loading, setLoading] = useState(true);

  // Lista de lugares fijos con coordenadas
  const places = [
    { id: "1", name: "🏠 Mi Casa (Rivadavia 4976)", latitude: -34.6045, longitude: -58.4180 }, 
    { id: "2", name: "🎓 Escuela (ORT Yatay 240)", latitude: -34.6097, longitude: -58.4294 },
    { id: "3", name: "⚽ Club Ferro", latitude: -34.61867, longitude: -58.44783 },
  ];

  // Función para calcular la distancia entre dos puntos geográficos usando la fórmula Haversine
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Retorna la distancia en km
  };

  // Función para formatear la distancia a metros o kilómetros según corresponda
  const formatDistance = (km) => {
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1)} km`;
  };

  // useEffect que se ejecuta al montar el componente
  useEffect(() => {
    (async () => {
      // Solicitar permisos de ubicación en primer plano
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        // Si el usuario niega permisos, mostramos mensaje de error
        setErrorMsg("❌ Permiso denegado para acceder a la ubicación.");
        setLoading(false);
        return;
      }

      // Obtener la ubicación actual del dispositivo
      let loc = await Location.getCurrentPositionAsync({});
      // Guardamos la ubicación en el estado
      setLocation(loc.coords);
      // Desactivamos el estado de carga
      setLoading(false);
    })();
  }, []);

  // Render de cada "card" en la lista
  const renderCard = ({ item }) => {
    let distText = null;
    if (location) {
      // Si tenemos la ubicación, calculamos la distancia al lugar
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

        {/* Mostrar loader mientras se obtiene la ubicación */}
        {loading && <ActivityIndicator size="large" color="#00d4ff" />}
        {/* Mostrar mensaje de error si el usuario no dio permisos */}
        {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}

        {/* Mostrar la lista de lugares una vez que tenemos la ubicación */}
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
    backgroundColor: "rgba(0,0,0,0.3)",
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
