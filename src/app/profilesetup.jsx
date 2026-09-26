import { useRouter } from "expo-router";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import BottomNav from "../components/BottomNav";
import { auth, db } from "../services/firebase";

import ProfileBackground from "../../assets/icons/profilebackground.svg";
import MaleBackground from "../../assets/icons/male-background.svg";
import FemaleBackground from "../../assets/icons/female-background.svg";
import maleAvatarImage from "../../assets/icons/male-avatar.png";
import femaleAvatarImage from "../../assets/icons/female-avatar.png";

export default function ProfileSetupScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("male");
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const user = auth.currentUser;
      if (!user) {
        router.replace("/login");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.name) setName(data.name);
          if (data.avatar) setAvatar(data.avatar);
          setProfileCompleted(Boolean(data.profileCompleted));
          setModalVisible(!data.profileCompleted);
        } else {
          setModalVisible(true);
        }
      } catch (error) {
        console.log("Error loading profile setup:", error);
        setModalVisible(true);
      } finally {
        setInitialLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  const handleConfirm = async () => {
    if (!name.trim()) {
      Alert.alert("Name Required", "Please enter your name.");
      return;
    }

    if (!avatar) {
      Alert.alert("Avatar Required", "Please choose an avatar.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Session Error", "Please login again.");
      router.replace("/login");
      return;
    }

    try {
      setLoading(true);

      await setDoc(
        doc(db, "users", user.uid),
        {
          name: name.trim(),
          avatar: avatar,
          profileCompleted: true,
          updatedAt: new Date(),
        },
        { merge: true },
      );

      setModalVisible(false);
  setProfileCompleted(true);
      router.replace("/home");
    } catch (error) {
      console.log("Error saving profile:", error);
      Alert.alert("Error", "Could not save your profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A72BFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Banner Header */}
      <View style={styles.topBanner}>
        {avatar === "male" ? (
          <MaleBackground width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
        ) : avatar === "female" ? (
          <FemaleBackground width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
        ) : (
          <ProfileBackground width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
        )}
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {/* Card Overlay */}
        <View style={styles.cardOverlay}>
          <Text style={styles.cardTitle}>
            {profileCompleted ? `Welcome, ${name}` : "Finish your profile!"}
          </Text>
          <Text style={styles.cardSubtitle}>
            {profileCompleted ? "PROFILE COMPLETE" : "1 STEP LEFT"}
          </Text>

          {!profileCompleted && (
            <View style={styles.primaryButtonBase}>
              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.primaryButtonPressed,
                ]}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.primaryButtonText}>COMPLETE PROFILE</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>

      {/* Profile Setup Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => {}}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>PROFILE SETUP</Text>

            {/* Name Input */}
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Name"
              placeholderTextColor="#A0A0A0"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            {/* Choose Avatar */}
            <Text style={styles.avatarLabel}>Choose Avatar</Text>
            <View style={styles.avatarRow}>
              <TouchableOpacity
                style={[
                  styles.avatarCard,
                  avatar === "male" && styles.avatarCardSelected,
                ]}
                onPress={() => setAvatar("male")}
              >
                <Image source={maleAvatarImage} style={styles.avatarImage} />
                <Text
                  style={[
                    styles.avatarCardText,
                    avatar === "male" && styles.avatarCardTextSelected,
                  ]}
                >
                  Male
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.avatarCard,
                  avatar === "female" && styles.avatarCardSelected,
                ]}
                onPress={() => setAvatar("female")}
              >
                <Image source={femaleAvatarImage} style={styles.avatarImage} />
                <Text
                  style={[
                    styles.avatarCardText,
                    avatar === "female" && styles.avatarCardTextSelected,
                  ]}
                >
                  Female
                </Text>
              </TouchableOpacity>
            </View>

            {/* Confirm Button */}
            <View style={styles.confirmButtonBase}>
              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.primaryButtonPressed,
                  loading && styles.buttonDisabled,
                ]}
                onPress={handleConfirm}
                disabled={loading}
              >
                <Text style={styles.primaryButtonText}>
                  {loading ? "SAVING..." : "CONFIRM"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Nav */}
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  topBanner: {
    height: "36%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  mainContent: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    marginTop: -30,
  },
  cardOverlay: {
    backgroundColor: "#F6E8FF",
    borderRadius: 20,
    padding: 20,
    width: "100%",
  },
  cardTitle: {
    fontFamily: "Nunito_900Black",
    fontSize: 20,
    color: "#211426",
  },
  cardSubtitle: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 12,
    color: "#8E8E93",
    letterSpacing: 0.8,
    marginTop: 4,
    marginBottom: 16,
  },
  primaryButtonBase: {
    width: "100%",
    height: 61,
    backgroundColor: "#7200B8",
    borderRadius: 16,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  primaryButton: {
    width: "100%",
    height: 54,
    backgroundColor: "#B42CFF",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ translateY: -7 }],
  },
  primaryButtonPressed: {
    backgroundColor: "#9D20E8",
    transform: [{ translateY: 0 }],
  },
  primaryButtonText: {
    fontFamily: "Nunito_900Black",
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalHeader: {
    fontFamily: "Nunito_900Black",
    fontSize: 16,
    color: "#8E8E93",
    letterSpacing: 0.8,
    marginBottom: 18,
  },
  label: {
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    color: "#000000",
    marginBottom: 8,
  },
  avatarLabel: {
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    color: "#000000",
    marginBottom: 8,
    marginTop: 20,
  },
  input: {
    height: 48,
    borderWidth: 2,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 15,
    color: "#211426",
    backgroundColor: "#FFFFFF",
  },
  avatarRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
    marginBottom: 20,
  },
  avatarImage: {
    width: 34,
    height: 36,
    resizeMode: "contain",
  },
  avatarCard: {
    flex: 1,
    height: 54,
    borderWidth: 2,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
  },
  avatarCardSelected: {
    borderColor: "#AF32FF",
    backgroundColor: "#F8EEFF",
  },
  avatarCardText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    color: "#211426",
  },
  avatarCardTextSelected: {
    color: "#AF32FF",
  },
  confirmButtonBase: {
    width: "100%",
    height: 61,
    backgroundColor: "#7200B8",
    borderRadius: 16,
    justifyContent: "flex-end",
    overflow: "hidden",
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});