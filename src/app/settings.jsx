
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  deleteUser,
  updateEmail,
  updatePassword,
} from "firebase/auth";

import {
  deleteDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import BottomNav from "../components/BottomNav";
import { auth, db } from "../services/firebase";

const settings = () => {
  const router = useRouter();

  const [page, setPage] = useState("settings");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [isAdmin, setIsAdmin] = useState(false);

  const [musicEnabled, setMusicEnabled] =
    useState(true);

  const [soundEnabled, setSoundEnabled] =
    useState(true);

  const [notificationsEnabled, setNotificationsEnabled] =
    useState(true);

  const [theme, setTheme] =
    useState("System");

  const [language, setLanguage] =
    useState("English");

  const [modalType, setModalType] =
    useState(null);

  const [inputValue, setInputValue] =
    useState("");

  const [secondInput, setSecondInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const user = auth.currentUser;

    if (!user) {
      return;
    }

    try {
      const userDoc = await getDoc(
        doc(db, "users", user.uid)
      );

      if (userDoc.exists()) {
        const data = userDoc.data();

        setName(data.name || "");

        setEmail(
          data.email ||
            user.email ||
            ""
        );

        setIsAdmin(
          data.role === "admin" ||
            data.isAdmin === true
        );
      } else {
        setEmail(user.email || "");
        setIsAdmin(false);
      }

      const savedMusic =
        await AsyncStorage.getItem(
          "musicEnabled"
        );

      const savedSound =
        await AsyncStorage.getItem(
          "soundEnabled"
        );

      const savedNotifications =
        await AsyncStorage.getItem(
          "notificationsEnabled"
        );

      const savedTheme =
        await AsyncStorage.getItem(
          "theme"
        );

      const savedLanguage =
        await AsyncStorage.getItem(
          "appLanguage"
        );

      if (savedMusic !== null) {
        setMusicEnabled(
          savedMusic === "true"
        );
      }

      if (savedSound !== null) {
        setSoundEnabled(
          savedSound === "true"
        );
      }

      if (
        savedNotifications !== null
      ) {
        setNotificationsEnabled(
          savedNotifications ===
            "true"
        );
      }

      if (savedTheme !== null) {
        setTheme(savedTheme);
      }

      if (savedLanguage !== null) {
        setLanguage(
          savedLanguage
        );
      }
    } catch (error) {
      console.log(
        "Error loading settings:",
        error
      );
    }
  };

  const saveMusicSetting = async (
    value
  ) => {
    setMusicEnabled(value);

    try {
      await AsyncStorage.setItem(
        "musicEnabled",
        String(value)
      );
    } catch (error) {
      console.log(
        "Music setting error:",
        error
      );
    }
  };

  const saveSoundSetting = async (
    value
  ) => {
    setSoundEnabled(value);

    try {
      await AsyncStorage.setItem(
        "soundEnabled",
        String(value)
      );
    } catch (error) {
      console.log(
        "Sound setting error:",
        error
      );
    }
  };

  const saveNotificationSetting =
    async (value) => {
      setNotificationsEnabled(value);

      try {
        await AsyncStorage.setItem(
          "notificationsEnabled",
          String(value)
        );
      } catch (error) {
        console.log(
          "Notification setting error:",
          error
        );
      }
    };

  const closeModal = () => {
    setModalType(null);
    setInputValue("");
    setSecondInput("");
  };

  const cancelModal = () => {
    if (loading) return;

    closeModal();
  };

  const openModal = (type) => {
    setInputValue("");
    setSecondInput("");
    setModalType(type);
  };

  const changeName = async () => {
    const user = auth.currentUser;

    if (!user) return;

    if (!inputValue.trim()) {
      Alert.alert(
        "Invalid Name",
        "Please enter a name."
      );
      return;
    }

    try {
      setLoading(true);

      await setDoc(
        doc(db, "users", user.uid),
        {
          name: inputValue.trim(),
        },
        {
          merge: true,
        }
      );

      setName(inputValue.trim());

      closeModal();

      Alert.alert(
        "Success",
        "Your name has been updated."
      );
    } catch (error) {
      console.log(
        "Name update error:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to update your name."
      );
    } finally {
      setLoading(false);
    }
  };

  const changeEmail = async () => {
    const user = auth.currentUser;

    if (!user) return;

    if (!inputValue.trim()) {
      Alert.alert(
        "Invalid Email",
        "Please enter a new email address."
      );
      return;
    }

    try {
      setLoading(true);

      await updateEmail(
        user,
        inputValue.trim()
      );

      await setDoc(
        doc(db, "users", user.uid),
        {
          email: inputValue.trim(),
        },
        {
          merge: true,
        }
      );

      setEmail(inputValue.trim());

      closeModal();

      Alert.alert(
        "Success",
        "Your email has been updated."
      );
    } catch (error) {
      console.log(
        "Email update error:",
        error
      );

      if (
        error.code ===
        "auth/requires-recent-login"
      ) {
        Alert.alert(
          "Login Required",
          "For security, please log in again before changing your email."
        );
      } else if (
        error.code ===
        "auth/invalid-email"
      ) {
        Alert.alert(
          "Invalid Email",
          "Please enter a valid email address."
        );
      } else if (
        error.code ===
        "auth/email-already-in-use"
      ) {
        Alert.alert(
          "Email Already Used",
          "That email is already connected to another account."
        );
      } else {
        Alert.alert(
          "Error",
          "Unable to update your email."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    const user = auth.currentUser;

    if (!user) return;

    if (inputValue.length < 6) {
      Alert.alert(
        "Invalid Password",
        "Password must be at least 6 characters."
      );
      return;
    }

    if (inputValue !== secondInput) {
      Alert.alert(
        "Passwords Do Not Match",
        "Please enter the same password twice."
      );
      return;
    }

    try {
      setLoading(true);

      await updatePassword(
        user,
        inputValue
      );

      closeModal();

      Alert.alert(
        "Success",
        "Your password has been changed."
      );
    } catch (error) {
      console.log(
        "Password update error:",
        error
      );

      if (
        error.code ===
        "auth/requires-recent-login"
      ) {
        Alert.alert(
          "Login Required",
          "For security, please log in again before changing your password."
        );
      } else {
        Alert.alert(
          "Error",
          "Unable to change your password."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const resetLearningProgress =
    async () => {
      const user = auth.currentUser;

      if (!user) return;

      try {
        setLoading(true);

        await setDoc(
          doc(db, "users", user.uid),
          {
            xp: 0,
            progress: 0,
            streak: 0,
            completedLessons: 0,
            completedChallenges: 0,
          },
          {
            merge: true,
          }
        );

        closeModal();

        Alert.alert(
          "Progress Reset",
          "Your learning progress has been reset."
        );
      } catch (error) {
        console.log(
          "Reset progress error:",
          error
        );

        Alert.alert(
          "Error",
          "Unable to reset your learning progress."
        );
      } finally {
        setLoading(false);
      }
    };

  const deleteAccount = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert(
        "No Account",
        "No signed-in account was found."
      );
      return;
    }

    try {
      setLoading(true);

      await deleteDoc(
        doc(db, "users", user.uid)
      );

      await deleteUser(user);

      closeModal();

      Alert.alert(
        "Account Deleted",
        "Your CodeQuest account has been deleted."
      );
    } catch (error) {
      console.log(
        "Delete account error:",
        error
      );

      if (
        error.code ===
        "auth/requires-recent-login"
      ) {
        Alert.alert(
          "Login Required",
          "For security, please log in again before deleting your account."
        );
      } else {
        Alert.alert(
          "Error",
          "Unable to delete your account."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const changeTheme = async () => {
    const nextTheme =
      theme === "System"
        ? "Light"
        : theme === "Light"
        ? "Dark"
        : "System";

    setTheme(nextTheme);

    try {
      await AsyncStorage.setItem(
        "theme",
        nextTheme
      );
    } catch (error) {
      console.log(
        "Theme setting error:",
        error
      );
    }
  };

  const changeLanguage = async () => {
    const nextLanguage =
      language === "English"
        ? "Filipino"
        : "English";

    setLanguage(nextLanguage);

    try {
      await AsyncStorage.setItem(
        "appLanguage",
        nextLanguage
      );
    } catch (error) {
      console.log(
        "Language setting error:",
        error
      );
    }
  };

  const openAdminWeeklyBoss =
    () => {
      router.push(
        "/AdminWeeklyBoss"
      );
    };

  const renderSettingsPage = () => {
    return (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={
          styles.content
        }
      >
        <Text style={styles.title}>
          Settings
        </Text>

        <Text
          style={
            styles.sectionTitle
          }
        >
          Account
        </Text>

        <TouchableOpacity
          style={styles.item}
          onPress={() =>
            setPage(
              "preference"
            )
          }
        >
          <View>
            <Text
              style={
                styles.itemTitle
              }
            >
              Profile
            </Text>

            <Text
              style={
                styles.itemSubtitle
              }
            >
              Manage your profile
              information
            </Text>
          </View>

          <Text
            style={
              styles.arrow
            }
          >
            →
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() =>
            Alert.alert(
              "Subscription",
              "Subscription functionality will be added later."
            )
          }
        >
          <View>
            <Text
              style={
                styles.itemTitle
              }
            >
              Subscription
            </Text>

            <Text
              style={
                styles.itemSubtitle
              }
            >
              Manage your
              subscription plan
            </Text>
          </View>

          <Text
            style={
              styles.arrow
            }
          >
            →
          </Text>
        </TouchableOpacity>

        <Text
          style={
            styles.sectionTitle
          }
        >
          Preferences
        </Text>

        <TouchableOpacity
          style={styles.item}
          onPress={() =>
            setPage(
              "appSettings"
            )
          }
        >
          <View>
            <Text
              style={
                styles.itemTitle
              }
            >
              Notifications
            </Text>

            <Text
              style={
                styles.itemSubtitle
              }
            >
              Manage your
              notification settings
            </Text>
          </View>

          <Text
            style={
              styles.arrow
            }
          >
            →
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() =>
            setPage(
              "appSettings"
            )
          }
        >
          <View>
            <Text
              style={
                styles.itemTitle
              }
            >
              App Settings
            </Text>

            <Text
              style={
                styles.itemSubtitle
              }
            >
              Manage your app
              preferences
            </Text>
          </View>

          <Text
            style={
              styles.arrow
            }
          >
            →
          </Text>
        </TouchableOpacity>

        <Text
          style={
            styles.sectionTitle
          }
        >
          Support
        </Text>

        <TouchableOpacity
          style={styles.item}
          onPress={() =>
            Alert.alert(
              "Help Center",
              "Help Center will be added later."
            )
          }
        >
          <View>
            <Text
              style={
                styles.itemTitle
              }
            >
              Help Center
            </Text>

            <Text
              style={
                styles.itemSubtitle
              }
            >
              Get help and support
            </Text>
          </View>

          <Text
            style={
              styles.arrow
            }
          >
            →
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() =>
            Alert.alert(
              "Contact Us",
              "Contact support will be added later."
            )
          }
        >
          <View>
            <Text
              style={
                styles.itemTitle
              }
            >
              Contact Us
            </Text>

            <Text
              style={
                styles.itemSubtitle
              }
            >
              Contact us for
              assistance
            </Text>
          </View>

          <Text
            style={
              styles.arrow
            }
          >
            →
          </Text>
        </TouchableOpacity>

        {isAdmin && (
          <>
            <Text
              style={
                styles.sectionTitle
              }
            >
              Administration
            </Text>

            <TouchableOpacity
              style={
                styles.adminItem
              }
              onPress={
                openAdminWeeklyBoss
              }
            >
              <View
                style={
                  styles.adminContent
                }
              >
                <Text
                  style={
                    styles.adminTitle
                  }
                >
                  Weekly Boss Admin
                </Text>

                <Text
                  style={
                    styles.adminSubtitle
                  }
                >
                  Create and manage
                  weekly boss
                  challenges
                </Text>
              </View>

              <Text
                style={
                  styles.adminArrow
                }
              >
                →
              </Text>
            </TouchableOpacity>
          </>
        )}

        <Text
          style={
            styles.version
          }
        >
          Version 1.0.0
        </Text>
      </ScrollView>
    );
  };

  const renderPreferencePage =
    () => {
      return (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={
            styles.content
          }
        >
          <TouchableOpacity
            onPress={() =>
              setPage(
                "settings"
              )
            }
          >
            <Text
              style={
                styles.back
              }
            >
              ← Back
            </Text>
          </TouchableOpacity>

          <Text
            style={
              styles.title
            }
          >
            Profile
          </Text>

          <Text
            style={
              styles.profileName
            }
          >
            {name || "User"}
          </Text>

          <Text
            style={
              styles.profileEmail
            }
          >
            {email ||
              "No email available"}
          </Text>

          <Text
            style={
              styles.sectionTitle
            }
          >
            Account Settings
          </Text>

          <TouchableOpacity
            style={
              styles.action
            }
            onPress={() =>
              openModal(
                "name"
              )
            }
          >
            <Text
              style={
                styles.actionText
              }
            >
              Edit name
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={
              styles.action
            }
            onPress={() =>
              Alert.alert(
                "Change Avatar",
                "Avatar upload can be connected once the profile image system is added."
              )
            }
          >
            <Text
              style={
                styles.actionText
              }
            >
              Change Avatar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={
              styles.action
            }
            onPress={() =>
              openModal(
                "email"
              )
            }
          >
            <Text
              style={
                styles.actionText
              }
            >
              Change email
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={
              styles.action
            }
            onPress={() =>
              openModal(
                "password"
              )
            }
          >
            <Text
              style={
                styles.actionText
              }
            >
              Change password
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={
              styles.action
            }
            onPress={() =>
              openModal(
                "reset"
              )
            }
          >
            <Text
              style={
                styles.resetText
              }
            >
              Reset learning
              progress
            </Text>
          </TouchableOpacity>

          <Text
            style={
              styles.sectionTitle
            }
          >
            Audio
          </Text>

          <View
            style={
              styles.switchRow
            }
          >
            <Text
              style={
                styles.actionText
              }
            >
              Music
            </Text>

            <Switch
              value={
                musicEnabled
              }
              onValueChange={
                saveMusicSetting
              }
            />
          </View>

          <View
            style={
              styles.switchRow
            }
          >
            <Text
              style={
                styles.actionText
              }
            >
              Sound effects
            </Text>

            <Switch
              value={
                soundEnabled
              }
              onValueChange={
                saveSoundSetting
              }
            />
          </View>

          <Text
            style={
              styles.sectionTitle
            }
          >
            Security
          </Text>

          <TouchableOpacity
            style={
              styles.deleteButton
            }
            onPress={() =>
              openModal(
                "delete"
              )
            }
          >
            <Text
              style={
                styles.deleteText
              }
            >
              DELETE ACCOUNT
            </Text>
          </TouchableOpacity>
        </ScrollView>
      );
    };

  const renderAppSettingsPage =
    () => {
      return (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={
            styles.content
          }
        >
          <TouchableOpacity
            onPress={() =>
              setPage(
                "settings"
              )
            }
          >
            <Text
              style={
                styles.back
              }
            >
              ← Back
            </Text>
          </TouchableOpacity>

          <Text
            style={
              styles.title
            }
          >
            App Settings
          </Text>

          <Text
            style={
              styles.sectionTitle
            }
          >
            Notifications
          </Text>

          <View
            style={
              styles.switchRow
            }
          >
            <View
              style={
                styles.flex
              }
            >
              <Text
                style={
                  styles.actionText
                }
              >
                App Notifications
              </Text>

              <Text
                style={
                  styles.itemSubtitle
                }
              >
                Receive updates about
                your progress and new
                features.
              </Text>
            </View>

            <Switch
              value={
                notificationsEnabled
              }
              onValueChange={
                saveNotificationSetting
              }
            />
          </View>

          <Text
            style={
              styles.sectionTitle
            }
          >
            Appearance
          </Text>

          <TouchableOpacity
            style={styles.item}
            onPress={
              changeTheme
            }
          >
            <View>
              <Text
                style={
                  styles.itemTitle
                }
              >
                Theme
              </Text>

              <Text
                style={
                  styles.itemSubtitle
                }
              >
                Choose between
                system, light, and
                dark mode.
              </Text>
            </View>

            <Text
              style={
                styles.value
              }
            >
              {theme}
            </Text>
          </TouchableOpacity>

          <Text
            style={
              styles.sectionTitle
            }
          >
            Language
          </Text>

          <TouchableOpacity
            style={styles.item}
            onPress={
              changeLanguage
            }
          >
            <View>
              <Text
                style={
                  styles.itemTitle
                }
              >
                Language
              </Text>

              <Text
                style={
                  styles.itemSubtitle
                }
              >
                Select your preferred
                language.
              </Text>
            </View>

            <Text
              style={
                styles.value
              }
            >
              {language}
            </Text>
          </TouchableOpacity>

          <Text
            style={
              styles.version
            }
          >
            CodeQuest v1.0.0
          </Text>
        </ScrollView>
      );
    };

  const renderModal = () => {
    if (!modalType) {
      return null;
    }

    return (
      <Modal
        transparent
        visible={true}
        animationType="fade"
        onRequestClose={
          cancelModal
        }
      >
        <View
          style={
            styles.modalBackground
          }
        >
          <View
            style={
              styles.modalBox
            }
          >
            {modalType ===
              "name" && (
              <>
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Edit Name
                </Text>

                <TextInput
                  style={
                    styles.input
                  }
                  placeholder="Enter new name"
                  placeholderTextColor="#777"
                  value={
                    inputValue
                  }
                  onChangeText={
                    setInputValue
                  }
                />

                <TouchableOpacity
                  style={
                    styles.confirmButton
                  }
                  onPress={
                    changeName
                  }
                  disabled={
                    loading
                  }
                >
                  <Text
                    style={
                      styles.confirmText
                    }
                  >
                    {loading
                      ? "Saving..."
                      : "CONFIRM"}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {modalType ===
              "email" && (
              <>
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Change Email
                </Text>

                <TextInput
                  style={
                    styles.input
                  }
                  placeholder="Enter new email"
                  placeholderTextColor="#777"
                  value={
                    inputValue
                  }
                  onChangeText={
                    setInputValue
                  }
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <TouchableOpacity
                  style={
                    styles.confirmButton
                  }
                  onPress={
                    changeEmail
                  }
                  disabled={
                    loading
                  }
                >
                  <Text
                    style={
                      styles.confirmText
                    }
                  >
                    {loading
                      ? "Saving..."
                      : "CONFIRM"}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {modalType ===
              "password" && (
              <>
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Change Password
                </Text>

                <TextInput
                  style={
                    styles.input
                  }
                  placeholder="New password"
                  placeholderTextColor="#777"
                  value={
                    inputValue
                  }
                  onChangeText={
                    setInputValue
                  }
                  secureTextEntry
                />

                <TextInput
                  style={
                    styles.input
                  }
                  placeholder="Confirm password"
                  placeholderTextColor="#777"
                  value={
                    secondInput
                  }
                  onChangeText={
                    setSecondInput
                  }
                  secureTextEntry
                />

                <TouchableOpacity
                  style={
                    styles.confirmButton
                  }
                  onPress={
                    changePassword
                  }
                  disabled={
                    loading
                  }
                >
                  <Text
                    style={
                      styles.confirmText
                    }
                  >
                    {loading
                      ? "Saving..."
                      : "CONFIRM"}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {modalType ===
              "reset" && (
              <>
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Reset Progress
                </Text>

                <Text
                  style={
                    styles.modalMessage
                  }
                >
                  This will reset your
                  XP, progress, streak,
                  and completed learning
                  records.
                </Text>

                <TouchableOpacity
                  style={
                    styles.confirmButton
                  }
                  onPress={
                    resetLearningProgress
                  }
                  disabled={
                    loading
                  }
                >
                  <Text
                    style={
                      styles.confirmText
                    }
                  >
                    {loading
                      ? "Resetting..."
                      : "RESET PROGRESS"}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {modalType ===
              "delete" && (
              <>
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Delete Account
                </Text>

                <Text
                  style={
                    styles.modalMessage
                  }
                >
                  This permanently
                  deletes your CodeQuest
                  profile and account.
                  This action cannot be
                  undone.
                </Text>

                <TouchableOpacity
                  style={
                    styles.deleteButton
                  }
                  onPress={
                    deleteAccount
                  }
                  disabled={
                    loading
                  }
                >
                  <Text
                    style={
                      styles.deleteText
                    }
                  >
                    {loading
                      ? "DELETING..."
                      : "DELETE ACCOUNT"}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {!loading && (
              <TouchableOpacity
                style={
                  styles.cancelButton
                }
                onPress={
                  cancelModal
                }
              >
                <Text
                  style={
                    styles.cancelText
                  }
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View
      style={
        styles.container
      }
    >
      <View
        style={
          styles.main
        }
      >
        {page ===
          "settings" &&
          renderSettingsPage()}

        {page ===
          "preference" &&
          renderPreferencePage()}

        {page ===
          "appSettings" &&
          renderAppSettingsPage()}
      </View>

      <BottomNav />

      {renderModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      "#FFFFFF",
  },

  main: {
    flex: 1,
  },

  scroll: {
    flex: 1,
  },

  content: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 120,
  },

  flex: {
    flex: 1,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#202020",
    marginBottom: 30,
  },

  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#202020",
  },

  profileEmail: {
    fontSize: 14,
    color: "#888888",
    marginTop: 5,
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#555555",
    marginTop: 24,
    marginBottom: 10,
  },

  item: {
    minHeight: 65,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor:
      "#EEEEEE",
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#202020",
  },

  itemSubtitle: {
    fontSize: 12,
    color: "#888888",
    marginTop: 4,
    maxWidth: 230,
    lineHeight: 17,
  },

  arrow: {
    fontSize: 20,
    color: "#888888",
  },

  value: {
    fontSize: 14,
    color: "#555555",
    fontWeight: "600",
  },

  version: {
    textAlign: "center",
    marginTop: 40,
    color: "#888888",
    fontSize: 12,
  },

  back: {
    fontSize: 15,
    color: "#555555",
    marginBottom: 20,
  },

  action: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor:
      "#EEEEEE",
  },

  actionText: {
    fontSize: 15,
    color: "#202020",
  },

  resetText: {
    fontSize: 15,
    color: "#C00000",
  },

  switchRow: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    borderBottomWidth: 1,
    borderBottomColor:
      "#EEEEEE",
    paddingVertical: 8,
  },

  adminItem: {
    minHeight: 65,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#A72BFF",
    backgroundColor: "#F7EEFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  adminContent: {
    flex: 1,
  },

  adminTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#7D15C4",
  },

  adminSubtitle: {
    fontSize: 12,
    color: "#8A6A9D",
    marginTop: 4,
    maxWidth: 260,
    lineHeight: 17,
  },

  adminArrow: {
    fontSize: 22,
    color: "#A72BFF",
    marginLeft: 10,
  },

  deleteButton: {
    backgroundColor:
      "#D71920",
    minHeight: 50,
    borderRadius: 7,
    alignItems:
      "center",
    justifyContent:
      "center",
    marginTop: 12,
  },

  deleteText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },

  modalBackground: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.55)",
    justifyContent:
      "center",
    padding: 24,
  },

  modalBox: {
    backgroundColor:
      "#FFFFFF",
    borderRadius: 12,
    padding: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#202020",
    marginBottom: 18,
  },

  modalMessage: {
    fontSize: 14,
    color: "#555555",
    lineHeight: 21,
    marginBottom: 18,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 7,
    paddingHorizontal: 14,
    color: "#202020",
    marginBottom: 12,
  },

  confirmButton: {
    height: 50,
    backgroundColor:
      "#8B00FF",
    borderRadius: 7,
    alignItems:
      "center",
    justifyContent:
      "center",
    marginTop: 5,
  },

  confirmText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },

  cancelButton: {
    alignItems:
      "center",
    padding: 12,
    marginTop: 8,
  },

  cancelText: {
    color: "#777777",
    fontSize: 14,
  },
});

export default settings;

