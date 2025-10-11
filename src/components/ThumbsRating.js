import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

const COLORS = {
  primary: "#1E40AF",
  lightGray: "#F3F4F6",
  gray: "#6B7280",
};

const OPTIONS = [
  { value: "poor", icon: "👎", label: "À améliorer" },
  { value: "ok", icon: "😐", label: "OK" },
  { value: "good", icon: "👍", label: "Bien" },
  { value: "excellent", icon: "👍👍", label: "Excellent" },
];

export default function ThumbsRating({ value, onChange }) {
  return (
    <View style={styles.container}>
      {OPTIONS.map(option => (
        <TouchableOpacity
          key={option.value}
          onPress={() => onChange(option.value)}
          style={[styles.option, value === option.value && styles.optionActive]}
        >
          <Text style={styles.icon}>{option.icon}</Text>
          <Text style={styles.label}>{option.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 10,
  },
  option: {
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.lightGray,
    minWidth: 80,
  },
  optionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "20",
  },
  icon: {
    fontSize: 28,
    marginBottom: 5,
  },
  label: {
    fontSize: 11,
    color: COLORS.gray,
    fontWeight: "600",
  },
});
