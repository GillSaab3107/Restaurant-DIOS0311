import { useCart } from "../../context/CartContext";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { Alert } from "react-native";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function CartScreen() {
  const { table } = useLocalSearchParams();
  const router = useRouter();
  const { cart, setCart } = useCart();

  // Increase quantity
  const increaseQty = (index: number) => {
    const updated = [...cart];
    updated[index].quantity += 1;
    setCart(updated);
  };

  // Decrease quantity / remove item
  const decreaseQty = (index: number) => {
    const updated = [...cart];

    if (updated[index].quantity > 1) {
      updated[index].quantity -= 1;
    } else {
      updated.splice(index, 1); // remove item completely
    }

    setCart(updated);
  };

  // Calculate total
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Place order
  const placeOrder = async () => {
    if (cart.length === 0) return;

    if (!table) {
      alert("Table not found!");
      return;
    }

  try {
    await addDoc(collection(db, "orders"), {
        table: table || "Unknown",
        items: cart,
        total: total,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setCart([]);

      Alert.alert("Success", "Order placed successfully!");
      router.replace(`/customer/status?table=${table}`);

    } catch (error) {
      console.log("ORDER ERROR:", error);
      alert(JSON.stringify(error));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Table: {table}</Text>

      {cart.length === 0 ? (
        <Text style={{ marginTop: 20 }}>Cart is empty</Text>
      ) : (
        <FlatList
          data={cart}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.card}>
              <View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.size}>
                  {item.selectedSize} - ₹ {item.price}
                </Text>
              </View>

              <View style={styles.qtyContainer}>
                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={() => decreaseQty(index)}
                >
                  <Text style={styles.qtyText}>−</Text>
                </TouchableOpacity>

                <Text style={styles.qtyNumber}>{item.quantity}</Text>

                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={() => increaseQty(index)}
                >
                  <Text style={styles.qtyText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total: ₹ {total}</Text>
      </View>

      <TouchableOpacity
        style={styles.placeButton}
        onPress={placeOrder}
      >
        <Text style={styles.placeText}>Place Order</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          Back to Menu
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#ffffff",
  },

  title: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#e6f4ea",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
  },

  size: {
    fontSize: 14,
    color: "#555",
  },

  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  qtyButton: {
    backgroundColor: "#145c43",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },

  qtyText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },

  qtyNumber: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: "600",
  },

  totalContainer: {
    paddingVertical: 15,
    borderTopWidth: 1,
    borderColor: "#ddd",
    marginTop: 10,
  },

  placeButton: {
    marginTop: 15,
    backgroundColor: "#1b5e20",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  placeText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  totalText: {
    fontSize: 18,
    fontWeight: "bold",
  },

  backButton: {
    marginTop: 15,
    backgroundColor: "#145c43",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});