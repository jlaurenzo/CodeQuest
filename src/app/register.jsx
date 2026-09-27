import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useState } from "react";

import { LinearGradient } from "expo-linear-gradient";

import { auth, db } from "../services/firebase";
import ArrowBlack from "../../assets/icons/arrowblack.svg";

export default function RegisterScreen() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {

    if (!username.trim() || !email.trim() || !password || !repeatPassword) {
      Alert.alert("Missing Information", "Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Password Too Short",
        "Your password must be at least 6 characters.",
      );
      return;
    }

    if (password !== repeatPassword) {
      Alert.alert(
        "Passwords Do Not Match",
        "Please make sure both passwords are the same.",
      );
      return;
    }

    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        username: username.trim(),
        email: email.trim(),
        programmingLanguage: "",
        xp: 0,
        hearts: 5,
        heartRefillAt: null,
        streak: 0,
        lastXpDate: null,
        streakDates: [],
        createdAt: serverTimestamp(),
      });

      Alert.alert("Account Created", `Welcome to CodeQuest, ${username.trim()}!`, [
        {
          text: "Continue",
          onPress: () => {
            router.replace("/chooselanguage");
          },
        },
      ]);
    } catch (error) {
      console.log("Registration error:", error);

      let message = "Something went wrong. Please try again.";

      if (error.code === "auth/email-already-in-use") {
        message = "This email is already registered.";
      } else if (error.code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      } else if (error.code === "auth/weak-password") {
        message = "Your password is too weak.";
      } else if (error.code === "auth/network-request-failed") {
        message = "Please check your internet connection.";
      } else if (error.code === "permission-denied") {
        message = "Firebase denied access to the database.";
      }

      Alert.alert("Registration Failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#400069", "#AF32FF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>

        {/* BACK BUTTON */}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        >
          <ArrowBlack width={20} height={20} />
        </TouchableOpacity>

        {/* TITLE */}

        <Text style={styles.title}>Sign Up</Text>

        <View style={styles.loginContainer}>
          <Text style={styles.accountPrompt}>Already have an account?</Text>

          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>

        {/* USERNAME */}

        <Text style={styles.fieldLabel}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your username"
          placeholderTextColor="#6C7278"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* EMAIL */}

        <Text style={styles.fieldLabel}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#6C7278"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* PASSWORD */}

        <Text style={styles.fieldLabel}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter your password"
            placeholderTextColor="#6C7278"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={styles.showButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.showText}>
              {showPassword ? "Hide" : "Show"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* REPEAT PASSWORD */}

        <Text style={styles.fieldLabel}>Confirm Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Re-enter your password"
            placeholderTextColor="#6C7278"
            value={repeatPassword}
            onChangeText={setRepeatPassword}
            secureTextEntry={!showRepeatPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={styles.showButton}
            onPress={() => setShowRepeatPassword(!showRepeatPassword)}
          >
            <Text style={styles.showText}>
              {showRepeatPassword ? "Hide" : "Show"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* CREATE ACCOUNT */}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Creating Account..." : "REGISTER"}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  content: {
    width: "100%",
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 10,
  },

  backButton: {
    marginTop: 5,
    marginBottom: 25,
  },

  backText: {
    color: "#C7B5D4",
    fontSize: 15,
  },

  title: {
    fontFamily: "Nunito_800ExtraBold",
    paddingBottom: 10,
    fontSize: 32,
    fontWeight: "700",
    color: "#000000",
    textAlign: "left",
  },

  accountPrompt: {
    fontFamily: "Nunito_500Medium",
    fontSize: 12,
    color: "#6C7278",
  },

  input: {
    height: 54,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#EDF1F3",
    borderRadius: 8,
    paddingHorizontal: 16,
    color: "#000000",
    fontSize: 15,
    marginBottom: 14,
  },

  fieldLabel: {
    fontFamily: "Nunito_500Medium",
    alignSelf: "stretch",
    color: "#6C7278",
    fontSize: 12,
    marginBottom: 6,
  },

  passwordContainer: {
    height: 54,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#EDF1F3",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  passwordInput: {
    fontFamily: "Nunito_500Medium",
    flex: 1,
    height: "100%",
    paddingHorizontal: 16,
    color: "#000000",
    fontSize: 15,
  },

  showButton: {
    paddingHorizontal: 15,
    height: "100%",
    justifyContent: "center",
  },

  showText: {
    fontFamily: "Nunito_500Medium",
    color: "#B82CFF",
    fontSize: 13,
    fontWeight: "600",
  },

  button: {
    height: 54,
    backgroundColor: "#B82CFF",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },
  loginButton: {
    height: 54,
    backgroundColor:"#ffffff",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: "5%",
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonText: {
    fontFamily: "Nunito_900Black",
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },

  loginText: {
    color: "#9E8BAA",
    fontSize: 14,
  },

  loginPurple: {
    color: "#B82CFF",
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    alignSelf: "stretch",
    marginBottom: 20,
  },
  loginLink: {
    fontFamily: "Nunito_600SemiBold",
    color: "#4D81E7",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 5,
  },
});
