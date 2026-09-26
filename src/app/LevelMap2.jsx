import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, Dimensions, SafeAreaView } from 'react-native';

import BottomNav from '../components/BottomNav';
import LockedLevelIcon from '../../assets/icons/locked-level.svg';
import CurrentStarIcon from '../../assets/icons/Star.svg';
import ThropyIcon from '../../assets/icons/thropy.svg';
import ThropyGoldIcon from '../../assets/icons/thropy-gold.svg';
import ThropyCurrentIcon from '../../assets/icons/thropy-gold.svg';
import startYellow from '../../assets/icons/start-yellow.png';
import LevelMapHeader from '../components/LevelMapHeader';
import learningContent from '../data/learningContent.json';
import { isLevelComplete } from '../services/learningProgress';

const levelPositions = [
  { x: 28, y: 12 },
  { x: 65, y: 31 },
  { x: 25, y: 50 },
  { x: 68, y: 62 },
  { x: 27, y: 80 },
];

function getContentLanguage(language) {
  const requested = String(language).toLowerCase();
  const key = Object.keys(learningContent).find(
    (item) => item.toLowerCase() === requested,
  );
  return key ? learningContent[key] : learningContent.JavaScript;
}

function MapScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const language = Array.isArray(params.language)
    ? params.language[0]
    : params.language || 'Java';
  const unit = Array.isArray(params.unit) ? params.unit[0] : params.unit || 'unit-1';
  const moduleId = Array.isArray(params.module) ? params.module[0] : params.module || 'module-1';
  const languageData = getContentLanguage(language);
  const moduleData = languageData?.units
    ?.find((item) => item.id === unit)?.modules
    ?.find((item) => item.id === moduleId)
    || learningContent.JavaScript.units[0].modules[0];
  const levels = moduleData.levels.map((level, index) => ({
    ...level,
    ...levelPositions[index % levelPositions.length],
    type: index === moduleData.levels.length - 1 ? 'trophy' : 'level',
  }));
  const [completedLevels, setCompletedLevels] = useState([]);

  useEffect(() => {
    Promise.all(levels.map((level) => isLevelComplete(language, unit, moduleId, level.id)))
      .then((values) => setCompletedLevels(levels.filter((_, index) => values[index]).map((level) => level.id)))
      .catch(() => setCompletedLevels([]));
  }, [language, unit, moduleId]);

  const unlockedLevels = levels.filter((level, index) => index === 0 || completedLevels.includes(levels[index - 1].id));

  const openLevel = (level) => {
    if (!unlockedLevels.some((item) => item.id === level.id)) return;
    router.push({ pathname: '/programmingQuestions', params: { language, unit, module: moduleId, level: level.id } });
  };

  const openFlashcards = () => {
    const level = unlockedLevels[unlockedLevels.length - 1] || levels[0];
    if (!level) return;
    router.push({ pathname: '/flashcard', params: { pl: language, unit, module: moduleId, level: level.id } });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <LevelMapHeader
        language={language}
        unitLabel={`${unit.toUpperCase()} / ${moduleId.toUpperCase()}`}
        unitTitle={moduleData.title}
        onBookPress={openFlashcards}
      />

      <View style={styles.container}>
      <Image source={{ uri: 'https://i.imgur.com/sF1rd5s.png' }} style={[styles.decoIcon, { left: '60%', top: '9%', width: 105, height: 80, opacity: 0.7 }]} resizeMode="contain" />
      <Image source={{ uri: 'https://i.imgur.com/YPUAaYy.png' }} style={[styles.decoIcon, { left: '12%', top: '24%', width: 100, height: 100, opacity: 0.35 }]} resizeMode="contain" />
      <Image source={{ uri: 'https://i.imgur.com/8duz86x.png' }} style={[styles.decoIcon, { left: '64%', top: '44%', width: 120, height: 120, opacity: 0.4 }]} resizeMode="contain" />
      <Image source={{ uri: 'https://i.imgur.com/lHqmmiH.png' }} style={[styles.decoIcon, { left: '7%', top: '58%', width: 120, height: 90, opacity: 0.3 }]} resizeMode="contain" />

      {levels.map((level) => {
        const isCompleted = completedLevels.includes(level.id);
        const isUnlocked = unlockedLevels.some((item) => item.id === level.id);
        const isActive = isUnlocked && !isCompleted;

        let btnBg = '#e5e7eb';
        let LevelIcon = LockedLevelIcon;
        let iconSize = { width: 22, height: 22 };

        if (level.type === 'trophy') {
          btnBg = 'transparent';
          if (isCompleted) {
            LevelIcon = ThropyGoldIcon;
          } else if (isActive) {
            LevelIcon = ThropyCurrentIcon;
          } else {
            LevelIcon = ThropyIcon;
          }
          iconSize = { width: 30, height: 26 };
        } else if (isCompleted) {
          btnBg = '#a855f7';
          LevelIcon = null;
        } else if (isActive) {
          btnBg = '#a855f7';
          LevelIcon = CurrentStarIcon;
          iconSize = { width: 24, height: 24 };
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
              onPress={() => openLevel(level)}>
              {isCompleted && level.type !== 'trophy' ? (
                <Image source={startYellow} style={styles.completeStarImage} resizeMode="contain" />
              ) : (
                <LevelIcon {...iconSize} />
              )}
            </TouchableOpacity>
          </View>
        );
      })}

      </View>

      <BottomNav />
    </SafeAreaView>
  );//patanggal nalang pag nalagyan na placeholder // ayoko nga
}

export default MapScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    backgroundColor: '#ffffff',
    flex: 1,
    position: 'relative',
    overflow: 'visible',
    marginTop: 18,
    paddingVertical: 24,
  },
  decoIcon: { position: 'absolute' },
  nodeWrapper: {
    position: 'absolute',
    transform: [{ translateX: -34 }, { translateY: -34 }],
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  levelBtn: {
    width: 68, height: 68, borderRadius: 34, borderWidth: 4, borderColor: '#ffffff',
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
  completeStarImage: { width: 26, height: 26 },
  glowInner: {
    position: 'absolute', width: 88, height: 88, borderRadius: 44, borderWidth: 3,
    borderColor: '#f3e8ff', backgroundColor: 'transparent', opacity: 0.8, zIndex: 1,
  },
  glowOuter: {
    position: 'absolute', width: 104, height: 104, borderRadius: 52, borderWidth: 2.5,
    borderColor: 'rgba(243,232,255,0.5)', borderStyle: 'dashed', backgroundColor: 'transparent', zIndex: 0,
  },
  startBadge: {
    position: 'absolute', 
    top: -18, 
    backgroundColor: '#ffffff', 
    color: '#8F69CC',
    fontWeight: '900', 
    fontSize: 15,
    fontFamily: "Nunito_900Black", 
    paddingVertical: 3, 
    paddingHorizontal: 8,
    borderRadius: 6, 
    overflow: 'hidden', 
    zIndex: 3, 
    letterSpacing: 0.4, 
    textAlign: 'center',
    width: "70",
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
