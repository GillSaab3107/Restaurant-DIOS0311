import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../../firebase";
import { useRouter } from "expo-router";

export default function AddMenuItem() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [sizes, setSizes] = useState<any[]>([]);

  // Add size to list
  const addSize = () => {
    if (!size || !price) return;

    setSizes([...sizes, { size: size, price: Number(price) }]);
    setSize("");
    setPrice("");
  };

  // Save item
  const handleAddItem = async () => {
    if (!name || !category) return;

    // If sizes exist > save sizes
    if (sizes.length > 0) {
      await addDoc(collection(db, "menu"), {
        name,
        category,
        sizes,
        price: null,
      });
    } else {
      // Otherwise save single price
      if (!price) return;

      await addDoc(collection(db, "menu"), {
        name,
        category,
        price: Number(price),
        sizes: null,
      });
     }

     router.back();
   };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add Menu Item</Text>

      <TextInput
        placeholder="Item Name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        placeholder="Category (CHINESE, CHAI, etc)"
        style={styles.input}
        value={category}
        onChangeText={setCategory}
      />

      <TextInput
        placeholder="Size (Small, Medium...)"
        style={styles.input}
        value={size}
        onChangeText={setSize}
      />

      <TextInput
        placeholder="Price"
        style={styles.input}
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />

      <TouchableOpacity style={styles.smallBtn} onPress={addSize}>
        <Text style={{ color: "white" }}>Add Size</Text>
      </TouchableOpacity>

      {sizes.map((s, i) => (
        <Text key={i}>
          {s.size} - ₹{s.price}
        </Text>
      ))}

      <TouchableOpacity style={styles.button} onPress={handleAddItem}>
        <Text style={styles.buttonText}>Save Item</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "green",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  smallBtn: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});