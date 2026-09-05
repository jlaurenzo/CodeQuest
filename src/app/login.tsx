import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { auth } from "../firebase";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Show / Hide Password
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      // Login successful
      router.replace("/home");

    } catch (error: any) {
      console.log("Login error:", error);

      Alert.alert(
        "Login Failed",
        "Incorrect email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      {/* Title */}
      <Text style={styles.title}>Welcome Back!</Text>

      <Text style={styles.subtitle}>
        Login to continue your CodeQuest journey.
      </Text>

      {/* Email */}
      <Text style={styles.label}>Email</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#777"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Password */}
      <Text style={styles.label}>Password</Text>

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Enter your password"
          placeholderTextColor="#777"
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
          <Text style={styles.showButtonText}>
            {showPassword ? "Hide" : "Show"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.loginButtonText}>
            Login
          </Text>
        )}
      </TouchableOpacity>

      {/* Register */}
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>
          Don't have an account?
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/register")}
        >
          <Text style={styles.registerLink}>
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#12051F",
    paddingHorizontal: 25,
    justifyContent: "center",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },

  subtitle: {
    color: "#E9C7FF",
    fontSize: 15,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 35,
  },

  label: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 12,
  },

  input: {
    height: 52,
    backgroundColor: "#1E0B2F",
    borderWidth: 1,
    borderColor: "#4B0082",
    borderRadius: 10,
    paddingHorizontal: 15,
    color: "#FFFFFF",
    fontSize: 16,
  },

  // Password input + Show button
  passwordContainer: {
    height: 52,
    backgroundColor: "#1E0B2F",
    borderWidth: 1,
    borderColor: "#4B0082",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 15,
    color: "#FFFFFF",
    fontSize: 16,
  },

  showButton: {
    paddingHorizontal: 15,
    height: "100%",
    justifyContent: "center",
  },

  showButtonText: {
    color: "#35B8E8",
    fontWeight: "bold",
    fontSize: 14,
  },

  loginButton: {
    height: 52,
    backgroundColor: "#8B1DFF",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
  },

  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
  },

  registerText: {
    color: "#777777",
    fontSize: 14,
  },

  registerLink: {
    color: "#35B8E8",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 5,
  },
});