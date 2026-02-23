import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit
} from "firebase/firestore";

export default function OrderStatus() {
  const { table } = useLocalSearchParams();
  const [status, setStatus] = useState("Waiting...");

  // 🔥 Listen for order status
  useEffect(() => {
    if (!table) return;

    const q = query(
      collection(db, "orders"),
      where("table", "==", table),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const latestOrder = snapshot.docs[0].data();
setStatus(latestOrder.status);
      }
    });

    return () => unsubscribe();
  }, [table]);

  // 🎨 Status color
  const getColor = () => {
    if (status === "pending") return "orange";
    if (status === "preparing") return "#ff9800";
    if (status === "ready") return "green";
    if (status === "completed") return "#145c43";
    return "black";
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Table: {table}</Text>

      <Text style={styles.label}>Order Status:</Text>

      <Text style={[styles.status, { color: getColor() }]}>
        {status.toUpperCase()}
      </Text>

      {status === "ready" && (
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: "bold",
  },
  label: {
    fontSize: 16,
  },
  status: {
    fontSize: 28,
    marginTop: 10,
    fontWeight: "bold",
  },
});