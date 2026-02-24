import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

export default function OrderStatus() {
  const { orderId } = useLocalSearchParams();
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    if (!orderId) {
      setStatus("No order found");
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "orders", String(orderId)),
      (snapshot) => {
        if (!snapshot.exists()) {
          setStatus("Order not found");
          return;
        }

        const data = snapshot.data();

        if (data?.status) {
          setStatus(data.status);
        } else {
          setStatus("Unknown");
        }
      }
    );

    return () => unsubscribe();
  }, [orderId]);

  const getColor = () => {
    if (status === "pending") return "orange";
    if (status === "preparing") return "#ff9800";
    if (status === "ready") return "green";
    if (status === "completed") return "#145c43";
    return "black";
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Order Status:</Text>

      <Text style={[styles.status, { color: getColor() }]}>
        {status.toUpperCase()}
      </Text>
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
  label: {
    fontSize: 18,
  },
  status: {
    fontSize: 32,
    marginTop: 10,
    fontWeight: "bold",
  },
});