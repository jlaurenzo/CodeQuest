import { Image, StyleSheet, Text, View } from "react-native";

import FireActive from "../../assets/icons/fire-active.svg";
import SilverIcon from "../../assets/icons/silver.svg";
import cppIcon from "../../assets/icons/cpp.png";
import javaIcon from "../../assets/icons/java.png";
import javascriptIcon from "../../assets/icons/javascript.png";

const languageIcons = {
  "C++": cppIcon,
  Java: javaIcon,
  JavaScript: javascriptIcon,
};

export default function PhaseMapHeader({ language = "JavaScript", streak = 12, league = "Silver II" }) {
  const languageIcon = languageIcons[language] || javaIcon;

  return (
    <View style={styles.header}>
      <View style={styles.headerItem}>
        <Image source={languageIcon} style={styles.languageIcon} />
        <Text style={styles.headerLabel}>{language}</Text>
      </View>
      <View style={styles.headerItem}>
        <FireActive width={25} height={25} />
        <Text style={styles.headerValue}>{streak}</Text>
      </View>
      <View style={styles.headerItem}>
        <SilverIcon width={25} height={25} />
        <Text style={styles.headerLabel}>{league}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignSelf: "center",
    width: "90%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 16,
  },
  headerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  languageIcon: {
    width: 25,
    height: 25,
    resizeMode: "contain",
  },
  headerLabel: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 18,
    fontWeight: "800",
    color: "#1F1130",
  },
  headerValue: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 18,
    fontWeight: "800",
    color: "#FF9600",
  },
});