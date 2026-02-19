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

// Modern 2026 Dark Theme
const C = {
  bg: '#0F0F14',
  bgLight: '#1A1A24',
  card: '#1E1E2A',
  surface: '#252532',
  primary: '#E91E9C',
  primaryGlow: 'rgba(233, 30, 156, 0.15)',
  purple: '#8B5CF6',
  purpleGlow: 'rgba(139, 92, 246, 0.15)',
  blue: '#3B82F6',
  cyan: '#06B6D4',
  gold: '#F5A623',
  green: '#10B981',
  orange: '#F97316',
  text: '#FFFFFF',
  textSecondary: '#A1A1B5',
  textMuted: '#6B6B80',
  border: '#2A2A3A',
};

// Age group configurations
const AGE_GROUPS = [
  { 
    id: '1-4', 
    label: '1-4 ani', 
    labelEn: '1-4 years',
    icon: 'happy-outline',
    color: C.gold,
    themes: ['bucurie', 'culori', 'animale', 'familie'],
    themesEn: ['joy', 'colors', 'animals', 'family'],
  },
  { 
    id: '4-7', 
    label: '4-7 ani', 
    labelEn: '4-7 years',
    icon: 'heart-outline',
    color: C.primary,
    themes: ['prietenie', 'empatie', 'încredere', 'înțelegere'],
    themesEn: ['friendship', 'empathy', 'confidence', 'understanding'],
  },
  { 
    id: '7+', 
    label: '7+ ani', 
    labelEn: '7+ years',
    icon: 'search-outline',
    color: C.purple,
    themes: ['mister', 'curiozitate', 'aventură', 'descoperire'],
    themesEn: ['mystery', 'curiosity', 'adventure', 'discovery'],
  },
];

export default function KidsScreen() {
  const { language, t } = useSettings();
  const isRo = language.code === 'ro';
  
  const [kids, setKids] = useState<any[]>([]);
  const [selectedKid, setSelectedKid] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'stories' | 'activities' | 'milestones'>('stories');
  
  // Story generation state
  const [generatingStory, setGeneratingStory] = useState(false);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(AGE_GROUPS[0]);
  const [storyModal, setStoryModal] = useState(false);
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
    return `${years} ${isRo ? 'ani' : 'years'}${months > 0 ? ` ${isRo ? 'și' : 'and'} ${months} ${isRo ? 'luni' : 'months'}` : ''}`;
  };

  const generateStory = async () => {
    setGeneratingStory(true);
    setStoryModal(false);
    
    try {
      const story = await api.generateStory({
        age_group: selectedAgeGroup.id,
        themes: isRo ? selectedAgeGroup.themes : selectedAgeGroup.themesEn,
        language: language.code,
        kid_name: selectedKid?.kid_name || '',
      });
      
      setGeneratedStory(story);
      setCurrentStory(story);
      setViewStoryModal(true);
      
      // Reload stories
      loadStories();
    } catch (error) {
      console.error('Error generating story:', error);
      Alert.alert(
        isRo ? 'Eroare' : 'Error', 
        isRo ? 'Nu s-a putut genera povestea' : 'Could not generate story'
      );
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
      const newKid = await api.createKid({
        kid_name: kidName.trim(),
        birth_date: kidBirthDate || null,
      });

      await loadKids();
      setSelectedKid(newKid);
      setAddKidModal(false);
      setKidName('');
      setKidBirthDate('');
    } catch (error) {
      console.error('Error adding kid:', error);
      Alert.alert(isRo ? 'Eroare' : 'Error', isRo ? 'Nu s-a putut adăuga copilul' : 'Could not add child');
    }
  };

  const addActivity = async () => {
    if (!selectedKid || !activityName.trim()) {
      Alert.alert(isRo ? 'Eroare' : 'Error', isRo ? 'Te rog introdu numele activității' : 'Please enter activity name');
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
      console.error('Error adding activity:', error);
      Alert.alert(isRo ? 'Eroare' : 'Error', isRo ? 'Nu s-a putut adăuga activitatea' : 'Could not add activity');
    }
  };

  const deleteKid = async (id: string) => {
    Alert.alert(
      isRo ? 'Șterge copilul' : 'Delete child',
      isRo ? 'Ești sigură că vrei să ștergi?' : 'Are you sure?',
      [
        { text: isRo ? 'Anulează' : 'Cancel', style: 'cancel' },
        {
          text: isRo ? 'Șterge' : 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteKid(id);
              const updatedKids = kids.filter((k) => k.id !== id);
              setKids(updatedKids);
              setSelectedKid(updatedKids[0] || null);
            } catch (error) {
              console.error('Error deleting kid:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{isRo ? 'Povești pentru Copii' : 'Kids Stories'}</Text>
            <Text style={styles.subtitle}>{isRo ? 'Generate de AI, adaptate vârstei' : 'AI-generated, age-adapted'}</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setAddKidModal(true)}
          >
            <Ionicons name="person-add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Kids Selector */}
        {kids.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.kidsScroll}
            contentContainerStyle={styles.kidsContainer}
          >
            {kids.map((kid) => (
              <TouchableOpacity
                key={kid.id}
                style={[
                  styles.kidChip,
                  selectedKid?.id === kid.id && styles.kidChipActive,
                ]}
                onPress={() => setSelectedKid(kid)}
                onLongPress={() => deleteKid(kid.id)}
              >
                <Ionicons
                  name="happy"
                  size={18}
                  color={selectedKid?.id === kid.id ? '#fff' : C.purple}
                />
                <Text
                  style={[
                    styles.kidChipText,
                    selectedKid?.id === kid.id && styles.kidChipTextActive,
                  ]}
                >
                  {kid.kid_name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Age Group Selection for Story Generation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isRo ? 'Generează Poveste' : 'Generate Story'}
          </Text>
          
          {/* Age Groups */}
          <View style={styles.ageGroupsContainer}>
            {AGE_GROUPS.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={[
                  styles.ageGroupCard,
                  selectedAgeGroup.id === group.id && styles.ageGroupCardActive,
                ]}
                onPress={() => setSelectedAgeGroup(group)}
              >
                <LinearGradient
                  colors={selectedAgeGroup.id === group.id 
                    ? [group.color, `${group.color}CC`] 
                    : ['#252532', '#1E1E2A']}
                  style={styles.ageGroupGradient}
                >
                  <View style={[styles.ageGroupIcon, { backgroundColor: `${group.color}20` }]}>
                    <Ionicons name={group.icon as any} size={24} color={group.color} />
                  </View>
                  <Text style={[
                    styles.ageGroupLabel,
                    selectedAgeGroup.id === group.id && styles.ageGroupLabelActive
                  ]}>
                    {isRo ? group.label : group.labelEn}
                  </Text>
                  <Text style={styles.ageGroupThemes}>
                    {(isRo ? group.themes : group.themesEn).slice(0, 2).join(', ')}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            style={styles.generateButton}
            onPress={generateStory}
            disabled={generatingStory}
          >
            <LinearGradient
              colors={['#E91E9C', '#B8157A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.generateGradient}
            >
              {generatingStory ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={22} color="#fff" />
                  <Text style={styles.generateText}>
                    {isRo ? 'Generează Poveste Nouă' : 'Generate New Story'}
                  </Text>
                </>              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Generated Stories List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isRo ? 'Povești Salvate' : 'Saved Stories'}
          </Text>
          
          {savedStories.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={48} color={C.textMuted} />
              <Text style={styles.emptyText}>
                {isRo ? 'Nicio poveste generată încă' : 'No stories generated yet'}
              </Text>
            </View>
          ) : (
            savedStories.map((story: any, index: number) => (
              <TouchableOpacity
                key={story.id || index}
                style={styles.storyCard}
                onPress={() => {
                  setCurrentStory(story);
                  setViewStoryModal(true);
                }}
              >
                <LinearGradient
                  colors={['#252532', '#1E1E2A']}
                  style={styles.storyGradient}
                >
                  <View style={styles.storyIcon}>
                    <Ionicons name="book" size={24} color={C.purple} />
                  </View>
                  <View style={styles.storyContent}>
                    <Text style={styles.storyTitle} numberOfLines={1}>
                      {story.title}
                    </Text>
                    <Text style={styles.storyMeta}>
                      {story.age_group} • {story.created_at ? format(new Date(story.created_at), 'dd MMM', { locale: isRo ? ro : enUS }) : ''}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={C.textMuted} />
                </LinearGradient>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Kids Activities Section */}
        {selectedKid && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {isRo ? `Activitățile lui ${selectedKid.kid_name}` : `${selectedKid.kid_name}'s Activities`}
              </Text>
              <TouchableOpacity onPress={() => setAddActivityModal(true)}>
                <Ionicons name="add-circle" size={28} color={C.primary} />
              </TouchableOpacity>
            </View>
            
            {selectedKid.activities?.length === 0 ? (
              <View style={styles.emptyStateSmall}>
                <Text style={styles.emptyTextSmall}>
                  {isRo ? 'Nicio activitate înregistrată' : 'No activities recorded'}
                </Text>
              </View>
            ) : (
              selectedKid.activities?.slice(0, 3).reverse().map((activity: any) => (
                <View key={activity.id} style={styles.activityCard}>
                  <View style={styles.activityIcon}>
                    <Ionicons name="star" size={18} color={C.gold} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityName}>{activity.name}</Text>
                    <Text style={styles.activityDate}>
                      {format(parseISO(activity.date), 'd MMM yyyy', { locale: isRo ? ro : enUS })}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {kids.length === 0 && (
          <View style={styles.emptyStateLarge}>
            <Ionicons name="people-outline" size={64} color={C.textMuted} />
            <Text style={styles.emptyTitle}>
              {isRo ? 'Niciun copil adăugat' : 'No children added'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {isRo 
                ? 'Adaugă copiii tăi pentru povești personalizate'
                : 'Add your children for personalized stories'}
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setAddKidModal(true)}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.emptyButtonText}>
                {isRo ? 'Adaugă copil' : 'Add child'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* View Story Modal */}
      <Modal visible={viewStoryModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentFull}>
            <LinearGradient
              colors={['#1E1E2A', '#0F0F14']}
              style={styles.storyModalContent}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle} numberOfLines={2}>
                  {currentStory?.title}
                </Text>
                <TouchableOpacity onPress={() => setViewStoryModal(false)}>
                  <Ionicons name="close-circle" size={32} color={C.textMuted} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.storyMeta}>
                <View style={styles.storyMetaBadge}>
                  <Ionicons name="people" size={14} color={C.purple} />
                  <Text style={styles.storyMetaText}>{currentStory?.age_group}</Text>
                </View>
              </View>
              
              <ScrollView style={styles.storyScrollView}>
                <Text style={styles.storyText}>
                  {currentStory?.content}
                </Text>
                
                {currentStory?.moral && (
                  <View style={styles.moralCard}>
                    <Ionicons name="heart" size={20} color={C.primary} />
                    <Text style={styles.moralText}>{currentStory.moral}</Text>
                  </View>
                )}
              </ScrollView>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* Add Kid Modal */}
      <Modal visible={addKidModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient colors={['#1E1E2A', '#0F0F14']} style={styles.modalGradient}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {isRo ? 'Adaugă copil' : 'Add child'}
                </Text>
                <TouchableOpacity onPress={() => setAddKidModal(false)}>
                  <Ionicons name="close" size={24} color={C.textMuted} />
                </TouchableOpacity>
              </View>
              <View style={styles.modalBody}>
                <Text style={styles.inputLabel}>{isRo ? 'Nume' : 'Name'}</Text>
                <TextInput
                  style={styles.input}
                  value={kidName}
                  onChangeText={setKidName}
                  placeholder={isRo ? 'Ex: Maria' : 'Ex: Maria'}
                  placeholderTextColor={C.textMuted}
                />

                <Text style={styles.inputLabel}>
                  {isRo ? 'Data nașterii (opțional)' : 'Birth date (optional)'}
                </Text>
                <TextInput
                  style={styles.input}
                  value={kidBirthDate}
                  onChangeText={setKidBirthDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={C.textMuted}
                />

                <TouchableOpacity style={styles.saveButton} onPress={addKid}>
                  <LinearGradient
                    colors={['#E91E9C', '#B8157A']}
                    style={styles.saveGradient}
                  >
                    <Text style={styles.saveButtonText}>
                      {isRo ? 'Salvează' : 'Save'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* Add Activity Modal */}
      <Modal visible={addActivityModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient colors={['#1E1E2A', '#0F0F14']} style={styles.modalGradient}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {isRo ? 'Adaugă activitate' : 'Add activity'}
                </Text>
                <TouchableOpacity onPress={() => setAddActivityModal(false)}>
                  <Ionicons name="close" size={24} color={C.textMuted} />
                </TouchableOpacity>
              </View>
              <View style={styles.modalBody}>
                <Text style={styles.inputLabel}>
                  {isRo ? 'Numele activității' : 'Activity name'}
                </Text>
                <TextInput
                  style={styles.input}
                  value={activityName}
                  onChangeText={setActivityName}
                  placeholder={isRo ? 'Ex: Cursuri de înot' : 'Ex: Swimming lessons'}
                  placeholderTextColor={C.textMuted}
                />

                <Text style={styles.inputLabel}>
                  {isRo ? 'Note (opțional)' : 'Notes (optional)'}
                </Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={activityNotes}
                  onChangeText={setActivityNotes}
                  placeholder={isRo ? 'Detalii...' : 'Details...'}
                  placeholderTextColor={C.textMuted}
                  multiline
                  numberOfLines={3}
                />

                <TouchableOpacity style={styles.saveButton} onPress={addActivity}>
                  <LinearGradient
                    colors={['#E91E9C', '#B8157A']}
                    style={styles.saveGradient}
                  >
                    <Text style={styles.saveButtonText}>
                      {isRo ? 'Salvează' : 'Save'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* Loading Overlay */}
      {generatingStory && (
        <View style={styles.loadingOverlay}>
          <LinearGradient
            colors={['rgba(15,15,20,0.95)', 'rgba(15,15,20,0.98)']}
            style={styles.loadingContent}
          >
            <ActivityIndicator size="large" color={C.primary} />
            <Text style={styles.loadingText}>
              {isRo ? 'Se generează povestea...' : 'Generating story...'}
            </Text>
            <Text style={styles.loadingSubtext}>
              {isRo ? 'AI creează o poveste magică' : 'AI is creating a magical story'}
            </Text>
          </LinearGradient>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: C.text,
  },
  subtitle: {
    fontSize: 14,
    color: C.textMuted,
    marginTop: 4,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kidsScroll: {
    marginBottom: 16,
  },
  kidsContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  kidChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    gap: 6,
  },
  kidChipActive: {
    backgroundColor: C.purple,
  },
  kidChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.purple,
  },
  kidChipTextActive: {
    color: '#fff',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
    marginBottom: 16,
  },
  ageGroupsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  ageGroupCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  ageGroupCardActive: {
    transform: [{ scale: 1.02 }],
  },
  ageGroupGradient: {
    padding: 14,
    alignItems: 'center',
  },
  ageGroupIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  ageGroupLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: C.text,
    marginBottom: 4,
  },
  ageGroupLabelActive: {
    color: '#fff',
  },
  ageGroupThemes: {
    fontSize: 10,
    color: C.textMuted,
    textAlign: 'center',
  },
  generateButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  generateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 10,
  },
  generateText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  storyCard: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
  },
  storyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  storyIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.purpleGlow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyContent: {
    flex: 1,
  },
  storyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
  },
  storyMeta: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  storyMetaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.purpleGlow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  storyMetaText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.purple,
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 166, 35, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityName: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },
  activityDate: {
    fontSize: 12,
    color: C.textMuted,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateSmall: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyStateLarge: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 14,
    color: C.textMuted,
    marginTop: 12,
  },
  emptyTextSmall: {
    fontSize: 13,
    color: C.textMuted,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: C.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 24,
    gap: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  modalContentFull: {
    flex: 1,
    marginTop: 60,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: 0,
  },
  storyModalContent: {
    flex: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
    flex: 1,
    marginRight: 12,
  },
  modalBody: {
    padding: 20,
    paddingTop: 0,
  },
  storyScrollView: {
    flex: 1,
  },
  storyText: {
    fontSize: 16,
    lineHeight: 26,
    color: C.textSecondary,
  },
  moralCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: C.primaryGlow,
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    gap: 12,
  },
  moralText: {
    flex: 1,
    fontSize: 14,
    fontStyle: 'italic',
    color: C.text,
    lineHeight: 22,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    color: C.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
  },
  saveGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: C.text,
    marginTop: 20,
  },
  loadingSubtext: {
    fontSize: 14,
    color: C.textMuted,
    marginTop: 8,
  },
});
