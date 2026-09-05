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
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";

import { auth, db } from "../firebase";

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {

    // Check empty fields
    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !repeatPassword
    ) {
      Alert.alert(
        "Missing Information",
        "Please fill in all fields."
      );
      return;
    }

    // Check password length
    if (password.length < 6) {
      Alert.alert(
        "Password Too Short",
        "Your password must be at least 6 characters."
      );
      return;
    }

    // Check passwords match
    if (password !== repeatPassword) {
      Alert.alert(
        "Passwords Do Not Match",
        "Please make sure both passwords are the same."
      );
      return;
    }

    try {
      setLoading(true);

      // Create Firebase account
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      const user = userCredential.user;

      // Save user information
      await setDoc(doc(db, "users", user.uid), {
        name: name.trim(),
        email: email.trim(),
        programmingLanguage: "",
        createdAt: new Date(),
      });

      Alert.alert(
        "Account Created",
        `Welcome to CodeQuest, ${name.trim()}!`,
        [
          {
            text: "Continue",
            onPress: () => {
              router.push("/language");
            },
          },
        ]
      );

    } catch (error: any) {
      console.log(
        "Registration error:",
        error
      );

      let message =
        "Something went wrong. Please try again.";

      if (
        error.code ===
        "auth/email-already-in-use"
      ) {
        message =
          "This email is already registered.";
      } else if (
        error.code === "auth/invalid-email"
      ) {
        message =
          "Please enter a valid email address.";
      } else if (
        error.code === "auth/weak-password"
      ) {
        message =
          "Your password is too weak.";
      } else if (
        error.code ===
        "auth/network-request-failed"
      ) {
        message =
          "Please check your internet connection.";
      } else if (
        error.code === "permission-denied"
      ) {
        message =
          "Firebase denied access to the database.";
      }

      Alert.alert(
        "Registration Failed",
        message
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>

        {/* BACK */}

        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>
            ← Back
          </Text>
        </TouchableOpacity>

        {/* LOGO */}

        <Text style={styles.logo}>
          CODE
          <Text style={styles.logoPurple}>
            QUEST
          </Text>
        </Text>

        {/* TITLE */}

        <Text style={styles.title}>
          Sign Up
        </Text>

        <Text style={styles.subtitle}>
          Start your coding quest.
        </Text>

        {/* NAME */}

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#8D789A"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoCorrect={false}
        />

        {/* EMAIL */}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#8D789A"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* PASSWORD */}

        <View style={styles.passwordContainer}>

          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor="#8D789A"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={styles.showButton}
            onPress={() =>
              setShowPassword(!showPassword)
            }
          >
            <Text style={styles.showText}>
              {showPassword ? "Hide" : "Show"}
            </Text>
          </TouchableOpacity>

        </View>

        {/* REPEAT PASSWORD */}

        <View style={styles.passwordContainer}>

          <TextInput
            style={styles.passwordInput}
            placeholder="Repeat Password"
            placeholderTextColor="#8D789A"
            value={repeatPassword}
            onChangeText={setRepeatPassword}
            secureTextEntry={!showRepeatPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={styles.showButton}
            onPress={() =>
              setShowRepeatPassword(
                !showRepeatPassword
              )
            }
          >
            <Text style={styles.showText}>
              {showRepeatPassword
                ? "Hide"
                : "Show"}
            </Text>
          </TouchableOpacity>

        </View>

        {/* CREATE ACCOUNT */}

        <TouchableOpacity
          style={[
            styles.button,
            loading && styles.buttonDisabled,
          ]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </Text>
        </TouchableOpacity>

        {/* LOGIN */}

        <TouchableOpacity
          onPress={() => router.push("/login")}
          style={styles.loginButton}
        >
          <Text style={styles.loginText}>
            Already have an account?{" "}
            <Text style={styles.loginPurple}>
              Login
            </Text>
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
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  content: {
    width: "100%",
  },

  backButton: {
    marginBottom: 25,
  },

  backText: {
    color: "#C7B5D4",
    fontSize: 15,
  },

  logo: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 2,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 35,
  },

  logoPurple: {
    color: "#B82CFF",
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 15,
    color: "#9E8BAA",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 28,
  },

  input: {
    height: 54,
    backgroundColor: "#241331",
    borderWidth: 1,
    borderColor: "#51256C",
    borderRadius: 8,
    paddingHorizontal: 16,
    color: "#FFFFFF",
    fontSize: 15,
    marginBottom: 14,
  },

  passwordContainer: {
    height: 54,
    backgroundColor: "#241331",
    borderWidth: 1,
    borderColor: "#51256C",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 16,
    color: "#FFFFFF",
    fontSize: 15,
  },

  showButton: {
    paddingHorizontal: 15,
    height: "100%",
    justifyContent: "center",
  },

  showText: {
    color: "#B82CFF",
    fontSize: 13,
    fontWeight: "600",
  },

  button: {
    height: 54,
    backgroundColor: "#B82CFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  loginButton: {
    alignItems: "center",
    marginTop: 20,
    padding: 10,
  },

  loginText: {
    color: "#9E8BAA",
    fontSize: 14,
  },

  loginPurple: {
    color: "#B82CFF",
    fontWeight: "600",
  },
});