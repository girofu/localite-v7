/**
 * react-native-maps Web 平台 Mock
 * 在 Web 平台上提供空的 react-native-maps 組件
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";

// MapView 組件的 Web Mock
export const MapView = ({ children, style, ...props }) => (
  <View style={[styles.mapContainer, style]} {...props}>
    <Text style={styles.mapText}>地圖功能在 Web 版本中暫不可用</Text>
    {children}
  </View>
);

// Marker 組件的 Web Mock
export const Marker = ({
  title,
  description,
  coordinate,
  children,
  ...props
}) => (
  <View style={styles.marker} {...props}>
    <Text style={styles.markerText}>📍 {title || "標記"}</Text>
    {children}
  </View>
);

// Callout 組件的 Web Mock
export const Callout = ({ children, ...props }) => (
  <View style={styles.callout} {...props}>
    {children}
  </View>
);

// Circle 組件的 Web Mock
export const Circle = ({ radius, center, ...props }) => (
  <View style={styles.circle} {...props} />
);

// Polyline 組件的 Web Mock
export const Polyline = ({
  coordinates,
  strokeColor,
  strokeWidth,
  ...props
}) => <View style={styles.polyline} {...props} />;

// Polygon 組件的 Web Mock
export const Polygon = ({ coordinates, fillColor, strokeColor, ...props }) => (
  <View style={styles.polygon} {...props} />
);

// 預設導出
export default MapView;

// 樣式
const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    backgroundColor: "#e6f3ff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  mapText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
  },
  marker: {
    position: "absolute",
    backgroundColor: "white",
    padding: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  markerText: {
    fontSize: 12,
    color: "#333",
  },
  callout: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    maxWidth: 200,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0, 122, 255, 0.3)",
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  polyline: {
    height: 2,
    backgroundColor: "#007AFF",
  },
  polygon: {
    backgroundColor: "rgba(0, 122, 255, 0.3)",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
});
