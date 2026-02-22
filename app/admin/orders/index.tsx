import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../../../firebase";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setOrders(data);
    });

    return () => unsubscribe();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    await updateDoc(doc(db, "orders", id), {
      status: newStatus,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live Orders 📋</Text>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          return (
            <View style={styles.card}>
              <Text style={styles.table}>
                Table: {item.table || "N/A"}
              </Text>

              {item.items?.map((i: any, index: number) => (
                <Text key={index} style={{ marginLeft: 8 }}>
                  • {i.name} x{i.quantity}
                </Text>
              ))}

              <Text style={{ fontWeight: "bold", marginTop: 6 }}>
                Status: {item.status}
              </Text>

              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.btn}
                  onPress={() =>
                    updateStatus(item.id, "preparing")
                  }
                >
                  <Text style={styles.btnText}>
                    Preparing
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btn}
                  onPress={() =>
                    updateStatus(item.id, "ready")
                  }
                >
                  <Text style={styles.btnText}>
                    Ready
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  table: { fontSize: 16, fontWeight: "bold" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  btn: {
    backgroundColor: "#673ab7",
    padding: 8,
    borderRadius: 6,
    width: "48%",
    alignItems: "center",
  },
  btnText: { color: "white" },
});