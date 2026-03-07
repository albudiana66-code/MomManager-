import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../../src/utils/api';
import { format, differenceInMonths, differenceInYears, parseISO } from 'date-fns';
import { ro, enUS } from 'date-fns/locale';
import { v4 as uuidv4 } from 'uuid';
import { useSettings } from '../../src/context/SettingsContext';

// Age group configurations
const AGE_GROUPS = [
  {
    id: '1-4',
    label: '1-4 ani',
    labelEn: '1-4 years',
    icon: 'happy-outline',
    colorKey: 'gold',
    themes: ['bucurie', 'culori', 'animale', 'familie'],
    themesEn: ['joy', 'colors', 'animals', 'family'],
  },
  {
    id: '4-7',
    label: '4-7 ani',
    labelEn: '4-7 years',
    icon: 'heart-outline',
    colorKey: 'primary',
    themes: ['prietenie', 'empatie', 'incredere', 'intelegere'],
    themesEn: ['friendship', 'empathy', 'confidence', 'understanding'],
  },
  {
    id: '7+',
    label: '7+ ani',
    labelEn: '7+ years',
    icon: 'search-outline',
    colorKey: 'purple',
    themes: ['mister', 'curiozitate', 'aventura', 'descoperire'],
    themesEn: ['mystery', 'curiosity', 'adventure', 'discovery'],
  },
];

export default function KidsScreen() {
  const { language, t, colors: C, isDarkMode } = useSettings();
  const isRo = language.code === 'ro';

  const gradCard = isDarkMode ? ['#252532', '#1E1E2A'] as const : ['#F8F9FA', '#FFFFFF'] as const;
  const gradModal = isDarkMode ? ['#1E1E2A', '#0F0F14'] as const : ['#F8F9FA', '#E5E7EB'] as const;

  const [kids, setKids] = useState<any[]>([]);
  const [selectedKid, setSelectedKid] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Story generation state
  const [generatingStory, setGeneratingStory] = useState(false);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(AGE_GROUPS[0]);
  const [generatedStory, setGeneratedStory] = useState<any>(null);
  const [savedStories, setSavedStories] = useState<any[]>([]);
  const [viewStoryModal, setViewStoryModal] = useState(false);
  const [currentStory, setCurrentStory] = useState<any>(null);

  // Modals
  const [addKidModal, setAddKidModal] = useState(false);
  const [addActivityModal, setAddActivityModal] = useState(false);

  // Form fields
  const [kidName, setKidName] = useState('');
  const [kidBirthDate, setKidBirthDate] = useState('');
  const [activityName, setActivityName] = useState('');
  const [activityNotes, setActivityNotes] = useState('');

  // Lunch box state
  const [lunchBoxLoading, setLunchBoxLoading] = useState(false);
  const [lunchBoxResult, setLunchBoxResult] = useState<any>(null);
  const [lunchBoxModal, setLunchBoxModal] = useState(false);
  const [lunchPrefs, setLunchPrefs] = useState('');
  const [lunchAllergies, setLunchAllergies] = useState('');

  const loadKids = async () => {
    try {
      const data = await api.getKids();
      setKids(data);
      if (data.length > 0 && !selectedKid) {
        setSelectedKid(data[0]);
      } else if (selectedKid) {
        const updated = data.find((k: any) => k.id === selectedKid.id);
        setSelectedKid(updated || data[0] || null);
      }
    } catch (error) {
      console.error('Error loading kids:', error);
    }
  };

  const loadStories = async () => {
    try {
      const stories = await api.getStories();
      setSavedStories(stories || []);
    } catch (error) {
      console.error('Error loading stories:', error);
    }
  };

  useEffect(() => {
    loadKids();
    loadStories();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadKids(), loadStories()]);
    setRefreshing(false);
  }, []);

  const getAge = (birthDate: string) => {
    if (!birthDate) return null;
    const birth = parseISO(birthDate);
    const years = differenceInYears(new Date(), birth);
    const months = differenceInMonths(new Date(), birth) % 12;
    if (years === 0) return `${months} ${isRo ? 'luni' : 'months'}`;
    return `${years} ${isRo ? 'ani' : 'years'}${months > 0 ? ` ${isRo ? 'si' : 'and'} ${months} ${isRo ? 'luni' : 'months'}` : ''}`;
  };

  const generateStory = async () => {
    setGeneratingStory(true);
    try {
      const story = await api.generateStory({
        age_group: selectedAgeGroup.id,
        themes: isRo ? selectedAgeGroup.themes : selectedAgeGroup.themesEn,
        language: language.code,
      });
      setGeneratedStory(story);
      setCurrentStory(story);
      setViewStoryModal(true);
      loadStories();
    } catch (error) {
      console.error('Error generating story:', error);
      Alert.alert(isRo ? 'Eroare' : 'Error', isRo ? 'Nu s-a putut genera povestea' : 'Could not generate story');
    } finally {
      setGeneratingStory(false);
    }
  };

  const addKid = async () => {
    if (!kidName.trim()) {
      Alert.alert(isRo ? 'Eroare' : 'Error', isRo ? 'Te rog introdu numele copilului' : 'Please enter child name');
      return;
    }
    try {
      const newKid = await api.createKid({ kid_name: kidName.trim(), birth_date: kidBirthDate || null });
      await loadKids();
      setSelectedKid(newKid);
      setAddKidModal(false);
      setKidName('');
      setKidBirthDate('');
    } catch (error) {
      Alert.alert(isRo ? 'Eroare' : 'Error', isRo ? 'Nu s-a putut adauga copilul' : 'Could not add child');
    }
  };

  const addActivity = async () => {
    if (!selectedKid || !activityName.trim()) {
      Alert.alert(isRo ? 'Eroare' : 'Error', isRo ? 'Te rog introdu numele activitatii' : 'Please enter activity name');
      return;
    }
    try {
      await api.addActivity(selectedKid.id, {
        id: uuidv4(),
        name: activityName.trim(),
        date: format(new Date(), 'yyyy-MM-dd'),
        notes: activityNotes.trim(),
      });
      await loadKids();
      setAddActivityModal(false);
      setActivityName('');
      setActivityNotes('');
    } catch (error) {
      Alert.alert(isRo ? 'Eroare' : 'Error', isRo ? 'Nu s-a putut adauga activitatea' : 'Could not add activity');
    }
  };

  const deleteKid = async (id: string) => {
    const msg = isRo ? 'Esti sigura ca vrei sa stergi?' : 'Are you sure you want to delete?';
    if (typeof window !== 'undefined' && !window.confirm(msg)) return;
    try {
      await api.deleteKid(id);
      const updatedKids = kids.filter((k) => k.id !== id);
      setKids(updatedKids);
      setSelectedKid(updatedKids[0] || null);
    } catch (error) {
      console.error('Error deleting kid:', error);
    }
  };

  const deleteStory = async (id: string) => {
    const msg = isRo ? 'Esti sigura ca vrei sa stergi povestea?' : 'Are you sure you want to delete this story?';
    if (typeof window !== 'undefined' && !window.confirm(msg)) return;
    try {
      await api.deleteStory(id);
      setSavedStories(savedStories.filter((st) => st.id !== id));
    } catch (error) {
      console.error('Error deleting story:', error);
    }
  };

  const generateLunchBox = async () => {
    if (!selectedKid && kids.length === 0) {
      Alert.alert(isRo ? 'Eroare' : 'Error', isRo ? 'Adauga un copil mai intai' : 'Add a child first');
      return;
    }
    setLunchBoxLoading(true);
    try {
      const result = await api.generateLunchBox({
        kid_name: selectedKid?.kid_name || '',
        age_group: selectedAgeGroup.id,
        preferences: lunchPrefs,
        allergies: lunchAllergies,
        language: language.code,
        days: 5,
      });
      setLunchBoxResult(result);
      setLunchBoxModal(true);
    } catch (error) {
      console.error('Error generating lunch box:', error);
      Alert.alert(isRo ? 'Eroare' : 'Error', isRo ? 'Nu s-a putut genera meniul' : 'Could not generate menu');
    } finally {
      setLunchBoxLoading(false);
    }
  };

  const borderStyle = !isDarkMode ? { borderWidth: 1, borderColor: C.border } : {};

  return (
    <SafeAreaView style={[s.container, { backgroundColor: C.bg }]} data-testid="kids-screen">
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={[s.title, { color: C.text }]}>{isRo ? 'Povesti pentru Copii' : 'Kids Stories'}</Text>
            <Text style={[s.subtitle, { color: C.textMuted }]}>{isRo ? 'Generate de AI, adaptate varstei' : 'AI-generated, age-adapted'}</Text>
          </View>
          <TouchableOpacity style={[s.addButton, { backgroundColor: C.surface }]} onPress={() => setAddKidModal(true)} data-testid="add-kid-btn">
            <Ionicons name="person-add" size={20} color={C.text} />
          </TouchableOpacity>
        </View>

        {/* Kids Selector */}
        {kids.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.kidsScroll} contentContainerStyle={s.kidsContainer}>
            {kids.map((kid) => (
              <View key={kid.id} style={[s.kidChip, { backgroundColor: C.surface }, selectedKid?.id === kid.id && { backgroundColor: C.purple }]}>
                <TouchableOpacity
                  style={s.kidChipInner}
                  onPress={() => setSelectedKid(kid)}
                >
                  <Ionicons name="happy" size={18} color={selectedKid?.id === kid.id ? '#fff' : C.purple} />
                  <Text style={[s.kidChipText, { color: C.purple }, selectedKid?.id === kid.id && { color: '#fff' }]}>{kid.kid_name}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteKid(kid.id)} style={s.kidDeleteBtn}>
                  <Ionicons name="close-circle" size={18} color={selectedKid?.id === kid.id ? 'rgba(255,255,255,0.7)' : C.red} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Age Group Selection */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: C.text }]}>{isRo ? 'Genereaza Poveste' : 'Generate Story'}</Text>
          <View style={s.ageGroupsContainer}>
            {AGE_GROUPS.map((group) => {
              const groupColor = (C as any)[group.colorKey];
              return (
                <TouchableOpacity key={group.id} style={s.ageGroupCard} onPress={() => setSelectedAgeGroup(group)}>
                  <LinearGradient
                    colors={selectedAgeGroup.id === group.id ? [groupColor, `${groupColor}CC`] : gradCard as any}
                    style={[s.ageGroupGradient, borderStyle]}
                  >
                    <View style={[s.ageGroupIcon, { backgroundColor: `${groupColor}20` }]}>
                      <Ionicons name={group.icon as any} size={24} color={groupColor} />
                    </View>
                    <Text style={[s.ageGroupLabel, { color: C.text }, selectedAgeGroup.id === group.id && { color: '#fff' }]}>
                      {isRo ? group.label : group.labelEn}
                    </Text>
                    <Text style={[s.ageGroupThemes, { color: C.textMuted }]}>
                      {(isRo ? group.themes : group.themesEn).slice(0, 2).join(', ')}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={s.generateButton} onPress={generateStory} disabled={generatingStory} data-testid="generate-story-btn">
            <LinearGradient colors={['#E91E9C', '#B8157A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.generateGradient}>
              {generatingStory ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={22} color="#fff" />
                  <Text style={s.generateText}>{isRo ? 'Genereaza Poveste Noua' : 'Generate New Story'}</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Saved Stories */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: C.text }]}>{isRo ? 'Povesti Salvate' : 'Saved Stories'}</Text>
          {savedStories.length === 0 ? (
            <View style={s.emptyState}>
              <Ionicons name="book-outline" size={48} color={C.textMuted} />
              <Text style={[s.emptyText, { color: C.textMuted }]}>{isRo ? 'Nicio poveste generata inca' : 'No stories generated yet'}</Text>
            </View>
          ) : (
            savedStories.map((story: any, index: number) => (
              <View key={story.id || index} style={s.storyCard}>
                <TouchableOpacity onPress={() => { setCurrentStory(story); setViewStoryModal(true); }} style={{ flex: 1 }}>
                  <LinearGradient colors={gradCard} style={[s.storyGradient, borderStyle]}>
                    <View style={[s.storyIcon, { backgroundColor: C.purpleGlow }]}>
                      <Ionicons name="book" size={24} color={C.purple} />
                    </View>
                    <View style={s.storyContent}>
                      <Text style={[s.storyTitle, { color: C.text }]} numberOfLines={1}>{story.title}</Text>
                      <Text style={[s.storyMetaText, { color: C.textMuted }]}>
                        {story.age_group} {story.created_at ? `- ${format(new Date(story.created_at), 'dd MMM', { locale: isRo ? ro : enUS })}` : ''}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={(e) => { e.stopPropagation(); deleteStory(story.id); }} style={s.storyDeleteBtn}>
                      <Ionicons name="trash-outline" size={18} color={C.red} />
                    </TouchableOpacity>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* School Lunch Box */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: C.text }]}>{isRo ? 'School Lunch Box' : 'School Lunch Box'}</Text>
          <TouchableOpacity activeOpacity={0.85} onPress={generateLunchBox} disabled={lunchBoxLoading} data-testid="generate-lunchbox-btn">
            <LinearGradient colors={['#F5A623', '#D4920B']} style={s.lunchBoxCard}>
              <View style={s.lunchBoxContent}>
                <View style={s.lunchBoxIconCircle}>
                  <Ionicons name="fast-food" size={24} color="#F5A623" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.lunchBoxTitle}>{isRo ? 'Meniu Scoala' : 'School Menu'}</Text>
                  <Text style={s.lunchBoxSub}>{isRo ? 'AI genereaza meniuri sanatoase pentru scoala' : 'AI generates healthy school menus'}</Text>
                </View>
                {lunchBoxLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="sparkles" size={24} color="rgba(255,255,255,0.8)" />
                )}
              </View>
            </LinearGradient>
          </TouchableOpacity>
          {lunchBoxResult && (
            <TouchableOpacity style={{ marginTop: 10 }} onPress={() => setLunchBoxModal(true)}>
              <LinearGradient colors={gradCard} style={[s.lunchBoxPreview, borderStyle]}>
                <View style={[s.lunchBoxPreviewIcon, { backgroundColor: C.goldGlow }]}>
                  <Ionicons name="checkmark-circle" size={20} color={C.gold} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.lunchBoxPreviewTitle, { color: C.text }]}>{isRo ? 'Meniu generat' : 'Menu generated'}</Text>
                  <Text style={[s.lunchBoxPreviewSub, { color: C.textMuted }]}>{lunchBoxResult.lunches?.length || 0} {isRo ? 'zile' : 'days'}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={C.textMuted} />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Activities Section */}
        {selectedKid && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={[s.sectionTitle, { color: C.text }]}>
                {isRo ? `Activitatile lui ${selectedKid.kid_name}` : `${selectedKid.kid_name}'s Activities`}
              </Text>
              <TouchableOpacity onPress={() => setAddActivityModal(true)}>
                <Ionicons name="add-circle" size={28} color={C.primary} />
              </TouchableOpacity>
            </View>
            {selectedKid.activities?.length === 0 ? (
              <View style={s.emptyStateSmall}>
                <Text style={[s.emptyTextSmall, { color: C.textMuted }]}>{isRo ? 'Nicio activitate inregistrata' : 'No activities recorded'}</Text>
              </View>
            ) : (
              selectedKid.activities?.slice(0, 3).reverse().map((activity: any) => (
                <View key={activity.id} style={[s.activityCard, { backgroundColor: C.surface }]}>
                  <View style={[s.activityIcon, { backgroundColor: C.goldGlow }]}>
                    <Ionicons name="star" size={18} color={C.gold} />
                  </View>
                  <View style={s.activityContent}>
                    <Text style={[s.activityName, { color: C.text }]}>{activity.name}</Text>
                    <Text style={[s.activityDate, { color: C.textMuted }]}>
                      {format(parseISO(activity.date), 'd MMM yyyy', { locale: isRo ? ro : enUS })}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {kids.length === 0 && (
          <View style={s.emptyStateLarge}>
            <Ionicons name="people-outline" size={64} color={C.textMuted} />
            <Text style={[s.emptyLargeTitle, { color: C.text }]}>{isRo ? 'Niciun copil adaugat' : 'No children added'}</Text>
            <Text style={[s.emptyLargeSub, { color: C.textMuted }]}>{isRo ? 'Adauga copiii tai pentru povesti personalizate' : 'Add your children for personalized stories'}</Text>
            <TouchableOpacity style={[s.emptyLargeBtn, { backgroundColor: C.primary }]} onPress={() => setAddKidModal(true)}>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={s.emptyLargeBtnText}>{isRo ? 'Adauga copil' : 'Add child'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* View Story Modal */}
      <Modal visible={viewStoryModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalContentFull}>
            <LinearGradient colors={gradModal} style={s.storyModalContent}>
              <View style={s.modalHeader}>
                <Text style={[s.modalTitle, { color: C.text }]} numberOfLines={2}>{currentStory?.title}</Text>
                <TouchableOpacity onPress={() => setViewStoryModal(false)}>
                  <Ionicons name="close-circle" size={32} color={C.textMuted} />
                </TouchableOpacity>
              </View>
              <View style={s.storyMetaBadgeRow}>
                <View style={[s.storyMetaBadge, { backgroundColor: C.purpleGlow }]}>
                  <Ionicons name="people" size={14} color={C.purple} />
                  <Text style={[s.storyMetaBadgeText, { color: C.purple }]}>{currentStory?.age_group}</Text>
                </View>
              </View>
              <ScrollView style={s.storyScrollView}>
                <Text style={[s.storyFullText, { color: C.textSecondary }]}>{currentStory?.content}</Text>
                {currentStory?.moral && (
                  <View style={[s.moralCard, { backgroundColor: C.primaryGlow }]}>
                    <Ionicons name="heart" size={20} color={C.primary} />
                    <Text style={[s.moralText, { color: C.text }]}>{currentStory.moral}</Text>
                  </View>
                )}
              </ScrollView>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* Add Kid Modal */}
      <Modal visible={addKidModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <LinearGradient colors={gradModal} style={s.modalGradientPad}>
              <View style={[s.modalHeaderBorder, { borderBottomColor: C.border }]}>
                <Text style={[s.modalTitle, { color: C.text }]}>{isRo ? 'Adauga copil' : 'Add child'}</Text>
                <TouchableOpacity onPress={() => setAddKidModal(false)}>
                  <Ionicons name="close" size={24} color={C.textMuted} />
                </TouchableOpacity>
              </View>
              <View style={s.modalBody}>
                <Text style={[s.inputLabel, { color: C.textSecondary }]}>{isRo ? 'Nume' : 'Name'}</Text>
                <TextInput style={[s.input, { backgroundColor: C.surface, color: C.text, borderColor: C.border }]} value={kidName} onChangeText={setKidName} placeholder={isRo ? 'Ex: Maria' : 'Ex: Maria'} placeholderTextColor={C.textMuted} />
                <Text style={[s.inputLabel, { color: C.textSecondary }]}>{isRo ? 'Data nasterii (optional)' : 'Birth date (optional)'}</Text>
                <TextInput style={[s.input, { backgroundColor: C.surface, color: C.text, borderColor: C.border }]} value={kidBirthDate} onChangeText={setKidBirthDate} placeholder="YYYY-MM-DD" placeholderTextColor={C.textMuted} />
                <TouchableOpacity style={s.saveButton} onPress={addKid}>
                  <LinearGradient colors={['#E91E9C', '#B8157A']} style={s.saveGradient}>
                    <Text style={s.saveButtonText}>{isRo ? 'Salveaza' : 'Save'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* Add Activity Modal */}
      <Modal visible={addActivityModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <LinearGradient colors={gradModal} style={s.modalGradientPad}>
              <View style={[s.modalHeaderBorder, { borderBottomColor: C.border }]}>
                <Text style={[s.modalTitle, { color: C.text }]}>{isRo ? 'Adauga activitate' : 'Add activity'}</Text>
                <TouchableOpacity onPress={() => setAddActivityModal(false)}>
                  <Ionicons name="close" size={24} color={C.textMuted} />
                </TouchableOpacity>
              </View>
              <View style={s.modalBody}>
                <Text style={[s.inputLabel, { color: C.textSecondary }]}>{isRo ? 'Numele activitatii' : 'Activity name'}</Text>
                <TextInput style={[s.input, { backgroundColor: C.surface, color: C.text, borderColor: C.border }]} value={activityName} onChangeText={setActivityName} placeholder={isRo ? 'Ex: Cursuri de inot' : 'Ex: Swimming lessons'} placeholderTextColor={C.textMuted} />
                <Text style={[s.inputLabel, { color: C.textSecondary }]}>{isRo ? 'Note (optional)' : 'Notes (optional)'}</Text>
                <TextInput style={[s.input, s.textArea, { backgroundColor: C.surface, color: C.text, borderColor: C.border }]} value={activityNotes} onChangeText={setActivityNotes} placeholder={isRo ? 'Detalii...' : 'Details...'} placeholderTextColor={C.textMuted} multiline numberOfLines={3} />
                <TouchableOpacity style={s.saveButton} onPress={addActivity}>
                  <LinearGradient colors={['#E91E9C', '#B8157A']} style={s.saveGradient}>
                    <Text style={s.saveButtonText}>{isRo ? 'Salveaza' : 'Save'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* Lunch Box Results Modal */}
      <Modal visible={lunchBoxModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={[s.modalContentFull, { maxHeight: '85%' }]}>
            <LinearGradient colors={gradModal} style={{ flex: 1 }}>
              <View style={[s.modalHeaderBorder, { borderBottomColor: C.border }]}>
                <Text style={[s.modalTitle, { color: C.text }]}>{isRo ? 'Meniu Scoala' : 'School Lunch Box'}</Text>
                <TouchableOpacity onPress={() => setLunchBoxModal(false)}>
                  <Ionicons name="close" size={24} color={C.textMuted} />
                </TouchableOpacity>
              </View>
              <ScrollView style={s.modalBody}>
                {lunchBoxResult?.lunches?.map((lunch: any, i: number) => (
                  <View key={i} style={[s.lunchDayCard, { backgroundColor: C.surface }]}>
                    <View style={s.lunchDayHeader}>
                      <View style={[s.lunchDayBadge, { backgroundColor: C.goldGlow }]}>
                        <Text style={[s.lunchDayNum, { color: C.gold }]}>{i + 1}</Text>
                      </View>
                      <Text style={[s.lunchDayName, { color: C.text }]}>{lunch.day}</Text>
                    </View>
                    <View style={s.lunchItems}>
                      {lunch.main && (
                        <View style={s.lunchItem}>
                          <Ionicons name="restaurant" size={14} color={C.primary} />
                          <Text style={[s.lunchItemText, { color: C.textSecondary }]}>{lunch.main}</Text>
                        </View>
                      )}
                      {lunch.snack && (
                        <View style={s.lunchItem}>
                          <Ionicons name="cafe" size={14} color={C.gold} />
                          <Text style={[s.lunchItemText, { color: C.textSecondary }]}>{lunch.snack}</Text>
                        </View>
                      )}
                      {lunch.fruit && (
                        <View style={s.lunchItem}>
                          <Ionicons name="nutrition" size={14} color={C.green} />
                          <Text style={[s.lunchItemText, { color: C.textSecondary }]}>{lunch.fruit}</Text>
                        </View>
                      )}
                      {lunch.drink && (
                        <View style={s.lunchItem}>
                          <Ionicons name="water" size={14} color={C.blue} />
                          <Text style={[s.lunchItemText, { color: C.textSecondary }]}>{lunch.drink}</Text>
                        </View>
                      )}
                    </View>
                    {lunch.note && (
                      <Text style={[s.lunchNote, { color: C.textMuted }]}>{lunch.note}</Text>
                    )}
                  </View>
                ))}
              </ScrollView>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* Loading Overlay */}
      {generatingStory && (
        <View style={s.loadingOverlay}>
          <LinearGradient colors={['rgba(15,15,20,0.95)', 'rgba(15,15,20,0.98)']} style={s.loadingContent}>
            <ActivityIndicator size="large" color={C.primary} />
            <Text style={[s.loadingText, { color: C.text }]}>{isRo ? 'Se genereaza povestea...' : 'Generating story...'}</Text>
            <Text style={[s.loadingSubtext, { color: C.textMuted }]}>{isRo ? 'AI creeaza o poveste magica' : 'AI is creating a magical story'}</Text>
          </LinearGradient>
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 20 },
  title: { fontSize: 26, fontWeight: '700' },
  subtitle: { fontSize: 14, marginTop: 4 },
  addButton: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  kidsScroll: { marginBottom: 16 },
  kidsContainer: { paddingHorizontal: 16, gap: 8 },
  kidChip: { flexDirection: 'row', alignItems: 'center', paddingLeft: 4, paddingRight: 4, paddingVertical: 4, borderRadius: 25 },
  kidChipInner: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, gap: 6 },
  kidChipText: { fontSize: 14, fontWeight: '600' },
  kidDeleteBtn: { padding: 4, marginRight: 4 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  ageGroupsContainer: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  ageGroupCard: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  ageGroupGradient: { padding: 14, alignItems: 'center' },
  ageGroupIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  ageGroupLabel: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  ageGroupThemes: { fontSize: 10, textAlign: 'center' },
  generateButton: { borderRadius: 16, overflow: 'hidden' },
  generateGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, gap: 10 },
  generateText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  storyCard: { borderRadius: 14, overflow: 'hidden', marginBottom: 10 },
  storyGradient: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  storyIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  storyContent: { flex: 1 },
  storyTitle: { fontSize: 15, fontWeight: '600' },
  storyMetaText: { fontSize: 12, marginTop: 2 },
  storyDeleteBtn: { padding: 8 },
  // Lunch Box
  lunchBoxCard: { borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center' },
  lunchBoxContent: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  lunchBoxIconCircle: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  lunchBoxTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  lunchBoxSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  lunchBoxPreview: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, gap: 12 },
  lunchBoxPreviewIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  lunchBoxPreviewTitle: { fontSize: 14, fontWeight: '600' },
  lunchBoxPreviewSub: { fontSize: 12, marginTop: 2 },
  lunchDayCard: { borderRadius: 14, padding: 14, marginBottom: 10 },
  lunchDayHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  lunchDayBadge: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  lunchDayNum: { fontSize: 14, fontWeight: '700' },
  lunchDayName: { fontSize: 15, fontWeight: '600' },
  lunchItems: { gap: 6, marginLeft: 44 },
  lunchItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  lunchItemText: { fontSize: 13, lineHeight: 18 },
  lunchNote: { fontSize: 12, fontStyle: 'italic', marginTop: 8, marginLeft: 44 },
  activityCard: { flexDirection: 'row', borderRadius: 12, padding: 14, marginBottom: 8, gap: 12 },
  activityIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  activityContent: { flex: 1 },
  activityName: { fontSize: 14, fontWeight: '600' },
  activityDate: { fontSize: 12, marginTop: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyStateSmall: { alignItems: 'center', paddingVertical: 20 },
  emptyStateLarge: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  emptyText: { fontSize: 14, marginTop: 12 },
  emptyTextSmall: { fontSize: 13 },
  emptyLargeTitle: { fontSize: 20, fontWeight: '700', marginTop: 16 },
  emptyLargeSub: { fontSize: 14, textAlign: 'center', marginTop: 8 },
  emptyLargeBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 25, marginTop: 24, gap: 8 },
  emptyLargeBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
  modalContentFull: { flex: 1, marginTop: 60, borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
  modalGradientPad: { padding: 0 },
  storyModalContent: { flex: 1, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 12 },
  modalHeaderBorder: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
  modalTitle: { fontSize: 20, fontWeight: '700', flex: 1, marginRight: 12 },
  modalBody: { padding: 20, paddingTop: 0 },
  storyMetaBadgeRow: { flexDirection: 'row', gap: 8, marginBottom: 16, paddingHorizontal: 4 },
  storyMetaBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
  storyMetaBadgeText: { fontSize: 12, fontWeight: '600' },
  storyScrollView: { flex: 1 },
  storyFullText: { fontSize: 16, lineHeight: 26 },
  moralCard: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: 16, padding: 16, marginTop: 20, gap: 12 },
  moralText: { flex: 1, fontSize: 14, fontStyle: 'italic', lineHeight: 22 },
  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  input: { borderRadius: 14, padding: 14, fontSize: 16, marginBottom: 0, borderWidth: 1 },
  textArea: { height: 80, textAlignVertical: 'top' },
  saveButton: { borderRadius: 14, overflow: 'hidden', marginTop: 20 },
  saveGradient: { paddingVertical: 16, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  loadingContent: { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 18, fontWeight: '600', marginTop: 20 },
  loadingSubtext: { fontSize: 14, marginTop: 8 },
});
