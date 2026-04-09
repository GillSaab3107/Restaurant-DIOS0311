import { useEffect } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login"); // or wherever login is
        return;
      }

      // 🔥 GET ROLE
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        alert("No role assigned");
        return;
      }

      const role = docSnap.data().role;

      if (role === "admin") {
        router.replace("/admin");
      } else if (role === "chef") {
        router.replace("/chef");
      } else {
        router.replace("/customer");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}