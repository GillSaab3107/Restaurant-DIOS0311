import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";

export default function OrderStatus() {
  const { table } = useLocalSearchParams();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!table) {
      setStatus("No table selected");
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "orders"),
      where("table", "==", String(table))
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          setStatus("No active order");
          setLoading(false);
          return;
        }

        // Get latest order manually (no orderBy to avoid index crash)
        const orders = snapshot.docs.map((doc) => doc.data());

        const latestOrder = orders.sort((a: any, b: any) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        })[0];

        setStatus(latestOrder?.status || "Unknown");
        setLoading(false);
      },
      (error) => {
        console.log("Status Listener Error:", error);
        setStatus("Error loading status");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [table]);

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

      {loading ? (
        <ActivityIndicator size="large" color="#145c43" />
      ) : (
        <>
          <Text style={styles.label}>Order Status:</Text>

          <Text style={[styles.status, { color: getColor() }]}>
            {status?.toUpperCase()}
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