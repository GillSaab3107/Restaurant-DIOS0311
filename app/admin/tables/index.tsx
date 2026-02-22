import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../firebase";

export default function ManageTables() {
  const [tables, setTables] = useState<any[]>([]);
  const [tableId, setTableId] = useState("");
  const [capacity, setCapacity] = useState("");

  const fetchTables = async () => {
    const snapshot = await getDocs(collection(db, "tables"));
    const data = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    setTables(data);
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const addTable = async () => {
    if (!tableId || !capacity) return;

    await addDoc(collection(db, "tables"), {
      number: tableId.trim(),
      capacity: Number(capacity),
      status: "available",
    });

    setTableId("");
    setCapacity("");
    fetchTables();
  };

  const deleteTable = async (id: string) => {
    await deleteDoc(doc(db, "tables", id));
    fetchTables();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Tables 🪑</Text>

      <TextInput
        placeholder="Capacity"
        style={styles.input}
        keyboardType="numeric"
        onChangeText={setCapacity}
      />

      <TextInput
        placeholder="Table ID (F1, F2, A1...)"
        style={styles.input}
        onChangeText={setTableId}
      />

      <TouchableOpacity style={styles.addBtn} onPress={addTable}>
        <Text style={{ color: "white" }}>Add Table</Text>
      </TouchableOpacity>

      <FlatList
        data={tables}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>Table {item.number}</Text>
            <Text>Capacity: {item.capacity}</Text>
            <Text>Status: {item.status}</Text>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => deleteTable(item.id)}
            >
              <Text style={{ color: "white" }}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 15 },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
  },
  addBtn: {
    backgroundColor: "green",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  deleteBtn: {
    backgroundColor: "red",
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    alignItems: "center",
  },
});