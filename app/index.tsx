import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";

import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
export default function LoginScreen() {

const router = useRouter();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const handleLogin = async () => {
try {
const userCredential = await signInWithEmailAndPassword(
auth,
email,
password
);

const uid = userCredential.user.uid;  

  const userDoc = await getDoc(doc(db, "users", uid));  

  if (userDoc.exists()) {  
    const role = userDoc.data().role;  

    if (role === "admin") {  
      router.replace("/admin");  
    } else if (role === "chef") {  
      router.replace("/chef");  
    } else if (role === "owner") {  
      router.replace("/owner");  
    } else if (role === "cashmanager") {  
      router.replace("/cashmanager");  
    } else {  
      alert("Invalid role");  
    }  
  } else {  
    alert("No role found");  
  }  

} catch (error: any) {  
  alert(error.message);  
}

};

return (
<View style={styles.container}>
<Text style={styles.title}>Restaurant Login</Text>

<TextInput  
    placeholder="Email"  
    style={styles.input}  
    value={email}  
    onChangeText={setEmail}  
  />  

  <TextInput  
    placeholder="Password"  
    secureTextEntry  
    style={styles.input}  
    value={password}  
    onChangeText={setPassword}  
  />  

  <Button title="Login" onPress={handleLogin} />  
</View>

);
}
const styles = StyleSheet.create({
container: {
flex: 1,
justifyContent: "center",
padding: 20,
},
title: {
fontSize: 24,
textAlign: "center",
marginBottom: 20,
},
input: {
borderWidth: 1,
padding: 10,
marginBottom: 15,
borderRadius: 5,
},}
);