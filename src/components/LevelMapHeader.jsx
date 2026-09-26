import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import BookIcon from "../../assets/icons/book.svg";
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

export default function LevelMapHeader({
  language = "Java",
  unitLabel = "UNIT 1, MODULE 2",
  unitTitle = "Java Variables",
  streak = 12,
  league = "Silver II",
  showUnit = true,
  onBookPress,
}) {
  const languageIcon = languageIcons[language] || javaIcon;

  return (
    <View>
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

      {showUnit && (
        <View style={styles.unitBanner}>
          <View>
            <Text style={styles.unitEyebrow}>{unitLabel}</Text>
            <Text style={styles.unitTitle}>{unitTitle}</Text>
          </View>
          <TouchableOpacity
            style={styles.unitIconButton}
            onPress={onBookPress}
            accessibilityLabel="Open flashcards"
          >
            <BookIcon width={18} height={18} />
          </TouchableOpacity>
        </View>
      )}
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
    paddingTop: "20%",
    paddingBottom: 25,
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
  unitBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#AF32FF",
    marginHorizontal: 20,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 8,
  },
  unitEyebrow: {
    color: "#FFFFFF",
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  unitTitle: {
    color: "#FFFFFF",
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 2,
  },
  unitIconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
});