import { useEffect, useState } from "react";
import { Platform } from "react-native";

let Notifications: any;
let Device: any;

if (Platform.OS !== "web") { 
  Notifications =
require("expo-notifications");
  Device = require("expo-device");
}
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  orderBy,
  addDoc,
} from "firebase/firestore";
import { db } from "../../firebase";

export default function ChefPanel() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    registerForPushNotifications();

    const q = query(
      collection(db, "orders"),
      where("paymentStatus", "==", "paid"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter out completed locally (safer)
      setOrders(list.filter((o) => o.status !== "completed"));
    });

    return () => unsubscribe();
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    await updateDoc(doc(db, "orders", orderId), {
      status: newStatus,
    });
  };

  async function registerForPushNotifications() {
  if (Platform.OS === "web") return;
  if (!Device?.isDevice) return;

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } =
      await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return;

  const token =
    (await Notifications.getExpoPushTokenAsync()).data;

  await addDoc(collection(db, "chefTokens"), {
    token,
  });
}
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chef Dashboard</Text>

      {orders.length === 0 ? (
        <Text style={{ marginTop: 20 }}>No active orders</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.table}>
                Table: {item.table}
              </Text>

              {item.items?.map((food: any, index: number) => (
                <Text key={index} style={styles.item}>
                  • {food.name} x {food.quantity}
                </Text>
              ))}

              <Text style={styles.status}>
                Status: {item.status}
              </Text>

              <View style={styles.buttonRow}>
                {item.status === "pending" && (
                  <TouchableOpacity
                    style={styles.btn}
                    onPress={() =>
                      updateStatus(item.id, "preparing")
                    }
                  >
                    <Text style={styles.btnText}>Preparing</Text>
                  </TouchableOpacity>
                )}

                {item.status === "preparing" && (
                  <TouchableOpacity
                    style={styles.btn}
                    onPress={() =>
                      updateStatus(item.id, "ready")
                    }
                  >
                    <Text style={styles.btnText}>Ready</Text>
                  </TouchableOpacity>
                )}

                {item.status === "ready" && (
                  <TouchableOpacity
                    style={styles.btnComplete}
                    onPress={() =>
                      updateStatus(item.id, "completed")
                    }
                  >
                    <Text style={styles.btnText}>Completed</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  card: {
    backgroundColor: "#f1f8e9",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  table: { fontWeight: "bold", fontSize: 16 },
  item: { fontSize: 14 },
  status: { marginTop: 6, fontWeight: "bold" },
  buttonRow: { flexDirection: "row", marginTop: 10 },
  btn: {
    backgroundColor: "#ff9800",
    padding: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  btnComplete: {
    backgroundColor: "#145c43",
    padding: 8,
    borderRadius: 6,
  },
  btnText: { color: "#fff", fontWeight: "bold" },
});