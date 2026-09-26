import { useRouter, usePathname } from "expo-router";
import { useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

import homeIcon from "../../assets/icons/home.png";
import mapIcon from "../../assets/icons/map.png";
import weeklychallenge from "../../assets/icons/weeklychallenge.png";
import profileIcon from "../../assets/icons/profile.png";
import settingsIcon from "../../assets/icons/settings.png";

import homeIconActive from "../../assets/icons/home-active.png";
import mapIconActive from "../../assets/icons/map-active.png";
import weeklychallengeIconActive from "../../assets/icons/weeklychallenge-active.png";
import profileIconActive from "../../assets/icons/profile-active.png";
import settingsIconActive from "../../assets/icons/settings-active.png";

export default function BottomNav() {
  const router = useRouter();

  const currentPage = usePathname();

  const [pressedTab, setPressedTab] = useState("");

  const goToHome = () => {
    router.push("/home");
  };

  const goToMap = () => {
    router.push("/phase-map");
  };

  const goToQuests = () => {
    router.push("/weeklybossHome");
  };

  const goToProfile = () => {
    router.push("/profile");
  };

  const goToSettings = () => {
    router.push("/settings");
  };

  return (
    <View style={styles.navbar}>
      {/* HOME */}
      <TouchableOpacity
        style={styles.tabButton}
        onPress={goToHome}
        onPressIn={() => setPressedTab("home")}
        onPressOut={() => setPressedTab("")}
      >
        {currentPage === "/home" || pressedTab === "home" ? (
          <Image source={homeIconActive} style={styles.icon} />
        ) : (
          <Image source={homeIcon} style={styles.icon} />
        )}
      </TouchableOpacity>

      {/* MAP */}
      <TouchableOpacity
        style={styles.tabButton}
        onPress={goToMap}
        onPressIn={() => setPressedTab("map")}
        onPressOut={() => setPressedTab("")}
      >
        {currentPage === "/phase-map" || pressedTab === "map" ? (
          <Image source={mapIconActive} style={styles.icon} />
        ) : (
          <Image source={mapIcon} style={styles.icon} />
        )}
      </TouchableOpacity>

      {/* QUESTS */}
      <TouchableOpacity
        style={styles.tabButton}
        onPress={goToQuests}
        onPressIn={() => setPressedTab("quests")}
        onPressOut={() => setPressedTab("")}
      >
        {currentPage === "/weeklyboss" || currentPage === "/weeklybossHome" || pressedTab === "quests" ? (
          <Image source={weeklychallengeIconActive} style={styles.icon} />
        ) : (
          <Image source={weeklychallenge} style={styles.icon} />
        )}
      </TouchableOpacity>

      {/* PROFILE */}
      <TouchableOpacity
        style={styles.tabButton}
        onPress={goToProfile}
        onPressIn={() => setPressedTab("profile")}
        onPressOut={() => setPressedTab("")}
      >
        {currentPage === "/profile" || currentPage === "/profilesetup" || pressedTab === "profile" ? (
          <Image source={profileIconActive} style={styles.icon} />
        ) : (
          <Image source={profileIcon} style={styles.icon} />
        )}
      </TouchableOpacity>

      {/* SETTINGS -- wala PA*/} 
      <TouchableOpacity
        style={styles.tabButton}
        onPress={goToSettings}
        onPressIn={() => setPressedTab("settings")}
        onPressOut={() => setPressedTab("")}
      >
        {currentPage === "/settings" || pressedTab === "settings" ? (
          <Image source={settingsIconActive} style={styles.icon} />
        ) : (
          <Image source={settingsIcon} style={styles.icon} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingTop: 8,
    paddingBottom: 4,
    borderTopWidth: 2.5,
    borderTopColor: "#E6E3E6",
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    height: 50,
  },
  icon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
});
