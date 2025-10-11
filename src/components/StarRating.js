import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

const COLORS = {
  gold: "#FCD34D",
  lightGray: "#E5E7EB",
};

export default function StarRating({ value, onChange, max = 4 }) {
  return (
    <View style={styles.container}>
      {[...Array(max)].map((_, i) => (
        <TouchableOpacity
          key={i}
          onPress={() => onChange(i + 1)}
          style={styles.starButton}
        >
          <Text style={[styles.star, i < value && styles.starActive]}>⭐</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 10,
  },
  starButton: {
    padding: 5,
  },
  star: {
    fontSize: 40,
    opacity: 0.3,
  },
  starActive: {
    opacity: 1,
  },
});
