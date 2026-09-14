import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const { height } = Dimensions.get('window');

const levels = [
  { id: 1, label: 'Level 1', type: 'active', x: 28, y: 12, screenName: 'Level1ScreenPlaceholder' },
  { id: 2, label: 'Level 2', type: 'locked', x: 65, y: 31, screenName: 'Level2ScreenPlaceholder' },
  { id: 3, label: 'Level 3', type: 'locked', x: 25, y: 50, screenName: 'Level3ScreenPlaceholder' },
  { id: 4, label: 'Level 4', type: 'locked', x: 68, y: 62, screenName: 'Level4ScreenPlaceholder' },
  { id: 5, label: 'Level 5', type: 'locked', x: 27, y: 80, screenName: 'Level5ScreenPlaceholder' },
  { id: 6, label: 'Trophy', type: 'trophy', x: 74, y: 92, screenName: 'TrophyScreenPlaceholder' },
];

function MapScreen() {
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [unlockedLevels, setUnlockedLevels] = useState([1]);
  const navigation = useNavigation();

  const handleUnlockNext = () => {
    const nextId = currentLevelId + 1;
    if (nextId <= levels.length) {
      setCurrentLevelId(nextId);
      if (!unlockedLevels.includes(nextId)) {
        setUnlockedLevels([...unlockedLevels, nextId]);
      }
    } else {
      setCurrentLevelId(1);
      setUnlockedLevels([1]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill}>
        <Svg height="100%" width="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <Path
            d="M 28,12 Q 48,15 65,31 T 25,50 Q 50,55 68,62 T 27,80 Q 52,87 74,92"
            fill="none"
            stroke="#c084fc"
            strokeWidth="1.2"
            strokeDasharray="2,2"
          />
        </Svg>
      </View>

      <Image source={{ uri: 'https://i.imgur.com/sF1rd5s.png' }} style={[styles.decoIcon, { left: '60%', top: '9%', width: 105, height: 80, opacity: 0.7 }]} resizeMode="contain" />
      <Image source={{ uri: 'https://i.imgur.com/YPUAaYy.png' }} style={[styles.decoIcon, { left: '12%', top: '24%', width: 100, height: 100, opacity: 0.35 }]} resizeMode="contain" />
      <Image source={{ uri: 'https://i.imgur.com/8duz86x.png' }} style={[styles.decoIcon, { left: '64%', top: '44%', width: 120, height: 120, opacity: 0.4 }]} resizeMode="contain" />
      <Image source={{ uri: 'https://i.imgur.com/lHqmmiH.png' }} style={[styles.decoIcon, { left: '7%', top: '58%', width: 120, height: 90, opacity: 0.3 }]} resizeMode="contain" />

      {levels.map((level) => {
        const isActive = currentLevelId === level.id;
        const isUnlocked = unlockedLevels.includes(level.id);

        let btnBg = '#e5e7eb';
        let emoji = '🔒';

        if (level.type === 'trophy') {
          btnBg = '#eab308';
          emoji = '🏆';
        } else if (isUnlocked) {
          btnBg = '#a855f7';
          emoji = '⭐';
        }

        return (
          <View key={level.id} style={[styles.nodeWrapper, { left: `${level.x}%`, top: `${level.y}%` }]} pointerEvents="box-none">
            {isActive && (
              <>
                <View style={styles.glowOuter}></View>
                <View style={styles.glowInner}></View>
                <Text style={styles.startBadge}>START</Text>
              </>
            )}
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.levelBtn, { backgroundColor: btnBg }, isActive ? styles.btnActiveShadow : styles.btnInactiveShadow]}
              onPress={() => {
                if (isUnlocked) {
                  navigation.navigate(level.screenName);
                } else {
                  Alert.alert('Finish previous stage to unlock');
                }
              }}>
              <Text style={styles.emojiText}>{emoji}</Text>
            </TouchableOpacity>
          </View>
        );
      })}

      <TouchableOpacity onPress={handleUnlockNext} style={styles.controlBtn}>
        <Text style={styles.controlBtnText}>Test</Text>
      </TouchableOpacity>
    </View>
  );//patanggal nalang pag nalagyan na placeholder
}

const Level1Screen = () => <View style={styles.dummyScreen}><Text style={styles.dummyText}>Lvl1PLACE HOLDER</Text></View>;
const Level2Screen = () => <View style={styles.dummyScreen}><Text style={styles.dummyText}>Lvl2PLACE HOLDER</Text></View>;
const Level3Screen = () => <View style={styles.dummyScreen}><Text style={styles.dummyText}>Lvl3PLACE HOLDER</Text></View>;
const Level4Screen = () => <View style={styles.dummyScreen}><Text style={styles.dummyText}>Lvl4PLACE HOLDER</Text></View>;
const Level5Screen = () => <View style={styles.dummyScreen}><Text style={styles.dummyText}>Lvl5PLACE HOLDER</Text></View>;
const TrophyScreen = () => <View style={styles.dummyScreen}><Text style={styles.dummyText}>BOSS FIGHT PLACE HOLDER</Text></View>;

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Map">
        <Stack.Screen name="Map" component={MapScreen} options={{ headerShown: false }} />

        <Stack.Screen name="Level1Screen" component={Level1Screen} options={{ title: 'Level 1' }} />
        <Stack.Screen name="Level2Screen" component={Level2Screen} options={{ title: 'Level 2' }} />
        <Stack.Screen name="Level3Screen" component={Level3Screen} options={{ title: 'Level 3' }} />
        <Stack.Screen name="Level4Screen" component={Level4Screen} options={{ title: 'Level 4' }} />
        <Stack.Screen name="Level5Screen" component={Level5Screen} options={{ title: 'Level 5' }} />
        <Stack.Screen name="TrophyScreen" component={TrophyScreen} options={{ title: 'Final Stage' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#3b0764',
    flex: 1,
    minHeight: height,
    position: 'relative',
    overflow: 'hidden',
    paddingVertical: 24,
  },
  decoIcon: { position: 'absolute' },
  nodeWrapper: {
    position: 'absolute',
    transform: [{ translateX: -27 }, { translateY: -27 }],
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  levelBtn: {
    width: 54, height: 54, borderRadius: 27, borderWidth: 4, borderColor: '#ffffff',
    alignItems: 'center', justifyContent: 'center', zIndex: 2,
  },
  btnActiveShadow: {
    shadowColor: '#ffffff', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 10, elevation: 8,
  },
  btnInactiveShadow: {
    shadowColor: '#9ca3af', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  emojiText: { fontSize: 20 },
  glowInner: {
    position: 'absolute', width: 74, height: 74, borderRadius: 37, borderWidth: 3,
    borderColor: '#f3e8ff', backgroundColor: 'transparent', opacity: 0.8, zIndex: 1,
  },
  glowOuter: {
    position: 'absolute', width: 88, height: 88, borderRadius: 44, borderWidth: 2.5,
    borderColor: 'rgba(243,232,255,0.5)', borderStyle: 'dashed', backgroundColor: 'transparent', zIndex: 0,
  },
  startBadge: {
    position: 'absolute', top: -24, backgroundColor: '#ffffff', color: '#7e22ce',
    fontWeight: '900', fontSize: 11, paddingVertical: 4, paddingHorizontal: 10,
    borderRadius: 8, overflow: 'hidden', zIndex: 3, letterSpacing: 0.4, textAlign: 'center',
  },
  controlBtn: {
    position: 'absolute', bottom: 30, alignSelf: 'center', backgroundColor: '#ffffff',
    paddingVertical: 10, paddingHorizontal: 20, borderRadius: 24, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 5, zIndex: 10,
  },
  controlBtnText: { color: '#3b0764', fontSize: 14, fontWeight: '700' },
  dummyScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3e8ff' },
  dummyText: { fontSize: 24, fontWeight: 'bold', color: '#3b0764' }
});
