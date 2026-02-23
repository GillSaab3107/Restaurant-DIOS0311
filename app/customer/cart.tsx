import { useRouter, useLocalSearchParams } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useCart } from "../../context/CartContext";
import { db } from "../../firebase";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";

export default function CartScreen() {
  const { table } = useLocalSearchParams();
  const router = useRouter();
  const { cart, setCart } = useCart();

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const increaseQty = (index: number) => {
    const updated = [...cart];
    updated[index].quantity += 1;
    setCart(updated);
  };

  const decreaseQty = (index: number) => {
    const updated = [...cart];

    if (updated[index].quantity > 1) {
      updated[index].quantity -= 1;
    } else {
      updated.splice(index, 1);
    }

    setCart(updated);
  };

  // 🔥 PAY & SAVE ORDER
  const handlePayment = () => {
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => {
      const options = {
        key: "rzp_live_SJDx4xHr1xmyYS",
        amount: total * 100,
        currency: "INR",
        name: "DIOS Dine-In",
        description: "Order Payment",

        handler: async function (response: any) {
          try {
            await addDoc(collection(db, "orders"), {
              table,
              items: cart,
              totalAmount: total,
              status: "confirmed",
              paymentStatus: "paid",
              razorpay_payment_id: response.razorpay_payment_id,
              createdAt: serverTimestamp(),
            });

            setCart([]);

            router.replace(`/customer/status?table=${table}`);
          } catch (error) {
            alert("Order save failed after payment");
          }
        },

        theme: {
          color: "#145c43",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    };

    document.body.appendChild(script);
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

      <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
        <Text style={styles.payText}>Place Order & Pay</Text>
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
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 18, marginBottom: 10, fontWeight: "bold" },
  card: {
    backgroundColor: "#e6f4ea",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  name: { fontSize: 16, fontWeight: "600" },
  size: { fontSize: 14, color: "#555" },
  qtyContainer: { flexDirection: "row", alignItems: "center" },
  qtyButton: {
    backgroundColor: "#145c43",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  qtyText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  qtyNumber: { marginHorizontal: 10, fontSize: 16, fontWeight: "600" },
  totalContainer: {
    paddingVertical: 15,
    borderTopWidth: 1,
    borderColor: "#ddd",
    marginTop: 10,
  },
  totalText: { fontSize: 18, fontWeight: "bold" },
  payButton: {
    marginTop: 15,
    backgroundColor: "#1b5e20",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  payText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  backButton: {
    marginTop: 15,
    backgroundColor: "#145c43",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});