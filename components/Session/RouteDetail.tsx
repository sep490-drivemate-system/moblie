import React from "react";
import { View, Text, StyleSheet } from "react-native";


export default function RouteDetail() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Route Detail Component</Text>
      <Text style={styles.subtext}>
        This component will contain the route planning/viewing logic
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  text: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
});

