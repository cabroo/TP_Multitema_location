import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import * as Location from "expo-location";

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(true);

  // Coordenadas fijas (ejemplo: Obelisco de Buenos Aires)
  const targetCoords = { latitude: -34.6037, longitude: -58.3816 };

  // Función para calcular distancia entre 2 puntos (Haversine)
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

  useEffect(() => {
    (async () => {
      // Pedir permiso
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("❌ Permiso denegado para acceder a la ubicación.");
        setLoading(false);
        return;
      }

      // Obtener ubicación
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);

      // Calcular distancia
      const dist = getDistance(
        loc.coords.latitude,
        loc.coords.longitude,
        targetCoords.latitude,
        targetCoords.longitude
      );

      setDistance(dist.toFixed(2));
      setLoading(false);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📍 Ejemplo con Expo Location</Text>

      {loading && <ActivityIndicator size="large" color="blue" />}

      {errorMsg && <Text>{errorMsg}</Text>}

      {location && (
        <>
          <Text>Latitud actual: {location.latitude}</Text>
          <Text>Longitud actual: {location.longitude}</Text>
          <Text>
            Distancia al Obelisco: {distance} km
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: "bold",
  },
});
