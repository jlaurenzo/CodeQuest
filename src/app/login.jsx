import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { auth, db } from "../services/firebase";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};

      if (userData.profileCompleted && userData.programmingLanguage) {
        router.replace("/home");
      } else if (userData.programmingLanguage) {
        router.replace("/profilesetup");
      } else {
        router.replace("/chooselanguage");
      }
    } catch (error) {
      console.log("Login error:", error);

      Alert.alert("Login Failed", "Incorrect email or password.");
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
      
      {/* Title */}
      <Text style={styles.title}>Login</Text>


     {/* Register */}
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Don't have an account?</Text>

        <TouchableOpacity onPress={() => router.push("/register")}>
          <Text style={styles.registerLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      {/* Email */}
      <Text style={styles.fieldLabel}>Email</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Email/Username"
        placeholderTextColor="#6C7278"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Password */}
      <Text style={styles.fieldLabel}>Password</Text>

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Enter Password"
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
          <Text style={styles.loginButtonText}>LOGIN</Text>
        )}
      </TouchableOpacity>
    </View>  
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 25,
    justifyContent: "center",
  },
  content: {
    width: "100%",
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 10,
  },

  title: {
    paddingTop: 10,
    color: "#000000",
    fontSize: 32,
    fontFamily: "Nunito_800ExtraBold",
    fontWeight: "800",
    textAlign: "center",
  },  

  subtitle: {
    color: "#000000",
    fontSize: 15,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 35,
  },

  label: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 5,
    marginTop: 0,
  },

  fieldLabel: {
    paddingTop: 20,
    fontFamily: "Nunito_500Medium",
    alignSelf: "stretch",
    color: "#6C7278",
    fontSize: 12,
    marginBottom: 6,
  },
  sublabel: {
    textAlign: "center",
    fontFamily: "Nunito_500Medium",
    color: "#6C7278",
    fontSize: 12,
    marginHorizontal: 12,
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#EDF1F3",
  },
  input: {
    height: 52,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#EDF1F3",
    borderRadius: 10,
    paddingHorizontal: 15,
    color: "#000000",
    fontSize: 16,
    fontFamily: "Nunito_500Medium",
    fontWeight: 500,
  },

  // Password input + Show button
  passwordContainer: {
    height: 52,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#EDF1F3",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 15,
    color: "#000000",
    fontSize: 16,
    fontFamily: "Nunito_500Medium",
    fontWeight: 500,
  },

  showButton: {
    paddingHorizontal: 15,
    height: "100%",
    justifyContent: "center",
  },

  showButtonText: {
    fontFamily: "Nunito_500Medium",
    fontWeight: 500,
    color: "#B82CFF",
    fontSize: 14,
  },

  loginButton: {
    height: 52,
    backgroundColor: "#B82CFF",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },

  loginButtonText: {
    fontFamily: "Nunito_900Black",
    color: "#ffffff",
    fontSize: 20,
    fontWeight: 900,
  },
  continuewithGoogleButton: {
    height: 52,
    backgroundColor: "#ffffff",
    borderColor: "#EFF0F6",
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
  },

  googleButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  googleIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
    marginRight: 10,
  },
  continuewithGoogleButtonText: {
    fontFamily: "Nunito_600SemiBold",
    fontWeight: "600",
    color: "#1A1C1E",
    fontSize: 14,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },

  registerText: {
    fontFamily: "Nunito_500Medium",
    fontWeight: 500,
    color: "#6C7278",
    fontSize: 14,
  },

  registerLink: {
    fontFamily: "Nunito_500Medium",
    color: "#4D81E7",
    fontSize: 14,
    fontWeight: 500,
    marginLeft: 5,
  },
});
