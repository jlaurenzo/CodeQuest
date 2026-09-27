import { useRouter } from "expo-router";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import BottomNav from "../components/BottomNav";
import MaleBackground from "../../assets/icons/male-background.svg";
import FemaleBackground from "../../assets/icons/female-background.svg";
import maleAvatarImage from "../../assets/icons/male-avatar.png";
import femaleAvatarImage from "../../assets/icons/female-avatar.png";
import { auth, db } from "../services/firebase";

function formatJoinedDate(createdAt) {
  if (!createdAt) return "Joined";

  const date = createdAt.toDate
    ? createdAt.toDate()
    : createdAt.seconds
      ? new Date(createdAt.seconds * 1000)
      : new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "Joined";

  return `Joined ${date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })}`;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const user = auth.currentUser;
      if (!user) {
        router.replace("/login");
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        let profileData = userDoc.exists() ? userDoc.data() : {};

        if (!profileData.createdAt) {
          await setDoc(userRef, { createdAt: serverTimestamp() }, { merge: true });
          const updatedDoc = await getDoc(userRef);
          profileData = updatedDoc.exists() ? updatedDoc.data() : profileData;
        }

        setProfile(profileData);
      } catch (error) {
        console.log("Error loading profile:", error);
        setProfile({});
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  async function handleLogout() {
    try {
      await auth.signOut();
      router.replace("/login");
    } catch (error) {
      console.log("Error logging out:", error);
    }
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#A72BFF" />
      </View>
    );
  }

  const isFemale = profile?.avatar === "female";
  const Background = isFemale ? FemaleBackground : MaleBackground;
  const avatarImage = isFemale ? femaleAvatarImage : maleAvatarImage;
  const username =
    profile?.username || profile?.email?.split("@")[0] || "username";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundContainer}>
        <Background
          width="100%"
          height={241}
          preserveAspectRatio="xMidYMid slice"
          style={styles.background}
        />
        <Image source={avatarImage} style={styles.avatar} />
      </View>

      <View style={styles.profileInfo}>
        <Text style={styles.name}>{profile?.name || "Your Profile"}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.username}>@{username}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.joinedDate}>
            {formatJoinedDate(profile?.createdAt)}
          </Text>
        </View>

        <View style={styles.primaryButtonBase}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Log out"
          onPress={handleLogout}
          >
            <Text style={styles.primaryButtonText}>LOGOUT</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.navigation}>
        <BottomNav />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  backgroundContainer: {
    height: 241,
    width: "100%",
    position: "relative",
    overflow: "hidden",
  },
  background: {
    width: "100%",
    height: 241,
  },
  avatar: {
    position: "absolute",
    width: 150,
    height: 175,
    left: "50%",
    bottom: -4,
    marginLeft: -75,
    resizeMode: "contain",
  },
  profileInfo: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 18,
    backgroundColor: "#FFFFFF",
  },
  name: {
    fontFamily: "Nunito_900Black",
    fontSize: 22,
    color: "#4B4B4B",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  username: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    color: "#737373",
  },
  dot: {
    marginHorizontal: 10,
    fontSize: 14,
    color: "#737373",
  },
  joinedDate: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    color: "#737373",
  },
  primaryButtonBase: {
    width: "100%",
    height: 61,
    marginTop: 22,
    backgroundColor: "#88080e",
    borderRadius: 12,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  primaryButton: {
    width: "100%",
    height: 54,
    backgroundColor: "#CD101A",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ translateY: -7 }],
  },
  primaryButtonPressed: {
    backgroundColor: "#CD101A",
    transform: [{ translateY: 0 }],
  },
  primaryButtonText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "900",
  },
  navigation: {
    marginTop: "auto",
  },
});