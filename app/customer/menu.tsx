import { useEffect, useState } from "react";
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCart } from "../../context/CartContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

export default function CustomerMenu() {
  const router = useRouter();
  const { table } = useLocalSearchParams();
  const { cart, setCart } = useCart();

  const [menuItems, setMenuItems] = useState<any[]>([]);

  // Fetch menu
  useEffect(() => {
    const fetchMenu = async () => {
      const snapshot = await getDocs(collection(db, "menu"));
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMenuItems(items);
    };

    fetchMenu();
  }, []);

  // Add to cart
  const addToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find(
        (i) => i.name === item.name && i.selectedSize === item.selectedSize
      );

      if (existing) {
        return prev.map((i) =>
          i.name === item.name && i.selectedSize === item.selectedSize
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Group by category
  const sections = Object.values(
    menuItems.reduce((acc: any, item: any) => {
      if (!acc[item.category]) {
        acc[item.category] = {
          title: item.category,
          data: [],
        };
      }
      acc[item.category].data.push(item);
      return acc;
    }, {})
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Table: {table}</Text>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryText}>{title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>

            {item.sizes && item.sizes.length > 0 ? (
              item.sizes.map((size: any, index: number) => (
                <View key={index} style={styles.sizeRow}>
                  <Text>
                    {size.size} - ₹ {size.price}
                  </Text>

                  <TouchableOpacity
                    style={styles.button}
                    onPress={() =>
                      addToCart({
                        name: item.name,
                        selectedSize: size.size,
                        price: size.price,
                      })
                    }
                  >
                    <Text style={styles.buttonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.sizeRow}>
                <Text>₹ {item.price}</Text>

                <TouchableOpacity
                  style={styles.button}
                  onPress={() =>
                    addToCart({
                      name: item.name,
                      selectedSize: "Regular",
                      price: item.price,
                    })
                  }
                >
                  <Text style={styles.buttonText}>Add</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      {cart.length > 0 && (
  <TouchableOpacity
    style={styles.cartBar}
    onPress={() => router.push(`/customer/cart?table=${table}`)}
  >
    <Text style={styles.cartText}>
      {cart.length} Items | ₹ {total} | View Cart
    </Text>
  </TouchableOpacity>
)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingTop: 10,
  },

  title: {
    fontSize: 16,
    marginBottom: 6,
  },

  categoryContainer: {
    backgroundColor: "#0f3d2e",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 10,
  },

  categoryText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#e6f4ea",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 6,
    borderRadius: 12,
  },

  name: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0f3d2e",
  },

  sizeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },

  button: {
    backgroundColor: "#145c43",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    width: 65,
    alignItems: "center",
  },

  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 13,
  },

  cartBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1b5e20",
    padding: 16,
    alignItems: "center",
  },

  cartText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});