import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

export default function OrderStatus() {
  const { table } = useLocalSearchParams();
  const [status, setStatus] = useState("Waiting...");

  // 🔥 Listen for order status
  useEffect(() => {
    if (!table) return;

    const q = query(
      collection(db, "orders"),
      where("table", "==", table)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const orders = snapshot.docs.map((doc) => doc.data());

        const latestOrder = orders.sort(
          (a: any, b: any) =>
            b.createdAt?.seconds - a.createdAt?.seconds
        )[0];

        setStatus(latestOrder.status);
      }
    });

    return () => unsubscribe();
  }, [table]);

  // 🎨 Status color
  const getColor = () => {
    if (status === "pending") return "orange";
    if (status === "preparing") return "#ff9800";
    if (status === "ready") return "green";
    if (status === "completed") return "#145c43";
    return "black";
  };

  // 💳 Razorpay (Web only)
  const handlePayment = () => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => {
      const options = {
        key: "rzp_live_SJDx4xHr1xmyYS", // 🔥 Replace with your Razorpay Key ID
        amount: 100, // ₹1 test payment
        currency: "INR",
        name: "DIOS Dine-In",
        description: "Order Payment",
        handler: function () {
          alert("Payment Successful!");
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

      <Text style={styles.label}>Order Status:</Text>

      <Text style={[styles.status, { color: getColor() }]}>
        {status.toUpperCase()}
      </Text>

      {status === "ready" && (
        <TouchableOpacity
          style={styles.payButton}
          onPress={handlePayment}
        >
          <Text style={styles.payText}>Pay Now</Text>
        </TouchableOpacity>
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
  payButton: {
    marginTop: 30,
    backgroundColor: "#1b5e20",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  payText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});