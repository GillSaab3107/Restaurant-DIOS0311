const handleLogin = async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    const uid = userCredential.user.uid;

    const userDoc = await getDoc(doc(db, "users", uid));

    if (!userDoc.exists()) {
      alert("No role assigned to this user");
      return;
    }

    const role = userDoc.data().role;

    console.log("User role:", role); // DEBUG

    switch (role) {
      case "admin":
        router.replace("/admin");
        break;

      case "chef":
        router.replace("/chef");
        break;

      case "owner":
        router.replace("/owner");
        break;

      case "cashmanager":
        router.replace("/cashmanager");
        break;

      default:
        alert("Invalid role");
    }

  } catch (error: any) {
    alert(error.message);
  }
};