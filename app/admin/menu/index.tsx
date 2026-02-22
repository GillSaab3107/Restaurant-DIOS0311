import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../firebase";

export default function MenuScreen() {
  const router = useRouter();
  const [menu, setMenu] = useState<any[]>([]);

  const fetchMenu = async () => {
    const snapshot = await getDocs(collection(db, "menu"));
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setMenu(items);
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "menu", id));
    fetchMenu();
  };

  // 🔥 Group items by category
  const groupedMenu = menu.reduce((acc: any, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <FlatList
      style={{ flex: 1, padding: 20 }}
      data={Object.keys(groupedMenu)}
      keyExtractor={(item) => item}
      ListHeaderComponent={
        <>
          <Text style={styles.title}>Menu Items 🍽️</Text>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/admin/menu/add")}
          >
            <Text style={styles.buttonText}>+ Add Item</Text>
          </TouchableOpacity>
        </>
      }
      renderItem={({ item: category }) => (
        <View style={{ marginBottom: 20 }}>
          {/* CATEGORY HEADING */}
          <Text style={styles.category}>{category}</Text>

          {groupedMenu[category].map((menuItem: any) => (
            <View key={menuItem.id} style={styles.card}>
              <Text style={styles.name}>{menuItem.name}</Text>

              {/* PRICE SECTION */}
              {menuItem.sizes && menuItem.sizes.length > 0 ? (
                <>
                  {menuItem.sizes.map((s: any, i: number) => (
                    <Text key={i}>
                      {s.size} - ₹{s.price}
                  </Text>
                ))}
              </>
            ) : (
              menuItem.price ? (
                <Text>₹ {menuItem.price}</Text>
              ) : null
            )}

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(menuItem.id)}
              >
                <Text style={{ color: "white" }}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: "blue",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  category: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    backgroundColor: "#eee",
    padding: 6,
    borderRadius: 6,
  },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  deleteBtn: {
    backgroundColor: "red",
    padding: 6,
    marginTop: 6,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});