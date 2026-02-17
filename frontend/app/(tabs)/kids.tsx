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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/utils/api';
import { format, differenceInMonths, differenceInYears, parseISO } from 'date-fns';
import { ro } from 'date-fns/locale';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_MILESTONES = [
  { name: 'Primul zâmbet', achieved: false },
  { name: 'Se rostogolește', achieved: false },
  { name: 'Stă în fund', achieved: false },
  { name: 'Primii pași', achieved: false },
  { name: 'Primele cuvinte', achieved: false },
  { name: 'Mănâncă singur', achieved: false },
  { name: 'Prima zi de grădiniță', achieved: false },
  { name: 'Citește primele cuvinte', achieved: false },
];

export default function KidsScreen() {
  const [kids, setKids] = useState<any[]>([]);
  const [selectedKid, setSelectedKid] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'activities' | 'milestones'>('activities');

  // Modals
  const [addKidModal, setAddKidModal] = useState(false);
  const [addActivityModal, setAddActivityModal] = useState(false);
  const [addMilestoneModal, setAddMilestoneModal] = useState(false);

  // Form fields
  const [kidName, setKidName] = useState('');
  const [kidBirthDate, setKidBirthDate] = useState('');
  const [activityName, setActivityName] = useState('');
  const [activityNotes, setActivityNotes] = useState('');
  const [milestoneName, setMilestoneName] = useState('');

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

  useEffect(() => {
    loadKids();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadKids();
    setRefreshing(false);
  }, []);

  const getAge = (birthDate: string) => {
    if (!birthDate) return null;
    const birth = parseISO(birthDate);
    const years = differenceInYears(new Date(), birth);
    const months = differenceInMonths(new Date(), birth) % 12;

    if (years === 0) {
      return `${months} luni`;
    }
    return `${years} ani${months > 0 ? ` și ${months} luni` : ''}`;
  };

  const addKid = async () => {
    if (!kidName.trim()) {
      Alert.alert('Eroare', 'Te rog introdu numele copilului');
      return;
    }

    try {
      const newKid = await api.createKid({
        kid_name: kidName.trim(),
        birth_date: kidBirthDate || null,
      });

      // Add default milestones
      for (const milestone of DEFAULT_MILESTONES) {
        await api.addMilestone(newKid.id, {
          id: uuidv4(),
          name: milestone.name,
          achieved: false,
        });
      }

      await loadKids();
      setSelectedKid(newKid);
      setAddKidModal(false);
      setKidName('');
      setKidBirthDate('');
    } catch (error) {
      console.error('Error adding kid:', error);
      Alert.alert('Eroare', 'Nu s-a putut adăuga copilul');
    }
  };

  const addActivity = async () => {
    if (!selectedKid || !activityName.trim()) {
      Alert.alert('Eroare', 'Te rog introdu numele activității');
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
      Alert.alert('Eroare', 'Nu s-a putut adăuga activitatea');
    }
  };

  const addMilestone = async () => {
    if (!selectedKid || !milestoneName.trim()) {
      Alert.alert('Eroare', 'Te rog introdu numele milestone-ului');
      return;
    }

    try {
      await api.addMilestone(selectedKid.id, {
        id: uuidv4(),
        name: milestoneName.trim(),
        achieved: false,
      });
      await loadKids();
      setAddMilestoneModal(false);
      setMilestoneName('');
    } catch (error) {
      console.error('Error adding milestone:', error);
      Alert.alert('Eroare', 'Nu s-a putut adăuga milestone-ul');
    }
  };

  const toggleMilestone = async (milestoneId: string, achieved: boolean) => {
    if (!selectedKid) return;

    try {
      await api.updateMilestone(selectedKid.id, milestoneId, {
        achieved: !achieved,
        date: !achieved ? format(new Date(), 'yyyy-MM-dd') : null,
      });
      await loadKids();
    } catch (error) {
      console.error('Error updating milestone:', error);
    }
  };

  const deleteKid = async (id: string) => {
    Alert.alert(
      'Șterge copilul',
      'Ești sigură că vrei să ștergi acest copil?',
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Șterge',
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

  const achievedMilestones = selectedKid?.milestones?.filter((m: any) => m.achieved).length || 0;
  const totalMilestones = selectedKid?.milestones?.length || 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ec4899" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Copiii Mei</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setAddKidModal(true)}
          >
            <Ionicons name="add" size={24} color="#fff" />
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
                  size={20}
                  color={selectedKid?.id === kid.id ? '#fff' : '#ec4899'}
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

        {selectedKid && (
          <>
            {/* Kid Info Card */}
            <View style={styles.kidCard}>
              <View style={styles.kidAvatar}>
                <Ionicons name="happy" size={40} color="#ec4899" />
              </View>
              <View style={styles.kidInfo}>
                <Text style={styles.kidName}>{selectedKid.kid_name}</Text>
                {selectedKid.birth_date && (
                  <Text style={styles.kidAge}>{getAge(selectedKid.birth_date)}</Text>
                )}
              </View>
              <View style={styles.kidStats}>
                <View style={styles.kidStat}>
                  <Text style={styles.kidStatValue}>{selectedKid.activities?.length || 0}</Text>
                  <Text style={styles.kidStatLabel}>Activități</Text>
                </View>
                <View style={styles.kidStat}>
                  <Text style={styles.kidStatValue}>{achievedMilestones}/{totalMilestones}</Text>
                  <Text style={styles.kidStatLabel}>Milestones</Text>
                </View>
              </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'activities' && styles.tabActive]}
                onPress={() => setActiveTab('activities')}
              >
                <Text style={[styles.tabText, activeTab === 'activities' && styles.tabTextActive]}>
                  Activități
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'milestones' && styles.tabActive]}
                onPress={() => setActiveTab('milestones')}
              >
                <Text style={[styles.tabText, activeTab === 'milestones' && styles.tabTextActive]}>
                  Milestones
                </Text>
              </TouchableOpacity>
            </View>

            {/* Activities Tab */}
            {activeTab === 'activities' && (
              <View style={styles.section}>
                <TouchableOpacity
                  style={styles.addItemButton}
                  onPress={() => setAddActivityModal(true)}
                >
                  <Ionicons name="add-circle" size={24} color="#ec4899" />
                  <Text style={styles.addItemText}>Adaugă activitate</Text>
                </TouchableOpacity>

                {selectedKid.activities?.length === 0 && (
                  <View style={styles.emptySection}>
                    <Text style={styles.emptyText}>Nicio activitate înregistrată</Text>
                  </View>
                )}

                {selectedKid.activities
                  ?.slice()
                  .reverse()
                  .map((activity: any) => (
                    <View key={activity.id} style={styles.activityCard}>
                      <View style={styles.activityIcon}>
                        <Ionicons name="star" size={20} color="#f59e0b" />
                      </View>
                      <View style={styles.activityContent}>
                        <Text style={styles.activityName}>{activity.name}</Text>
                        <Text style={styles.activityDate}>
                          {format(parseISO(activity.date), 'd MMMM yyyy', { locale: ro })}
                        </Text>
                        {activity.notes && (
                          <Text style={styles.activityNotes}>{activity.notes}</Text>
                        )}
                      </View>
                    </View>
                  ))}
              </View>
            )}

            {/* Milestones Tab */}
            {activeTab === 'milestones' && (
              <View style={styles.section}>
                <TouchableOpacity
                  style={styles.addItemButton}
                  onPress={() => setAddMilestoneModal(true)}
                >
                  <Ionicons name="add-circle" size={24} color="#ec4899" />
                  <Text style={styles.addItemText}>Adaugă milestone</Text>
                </TouchableOpacity>

                {selectedKid.milestones?.map((milestone: any) => (
                  <TouchableOpacity
                    key={milestone.id}
                    style={styles.milestoneCard}
                    onPress={() => toggleMilestone(milestone.id, milestone.achieved)}
                  >
                    <Ionicons
                      name={milestone.achieved ? 'checkbox' : 'square-outline'}
                      size={26}
                      color={milestone.achieved ? '#10b981' : '#d1d5db'}
                    />
                    <View style={styles.milestoneContent}>
                      <Text
                        style={[
                          styles.milestoneName,
                          milestone.achieved && styles.milestoneAchieved,
                        ]}
                      >
                        {milestone.name}
                      </Text>
                      {milestone.achieved && milestone.date && (
                        <Text style={styles.milestoneDate}>
                          {format(parseISO(milestone.date), 'd MMMM yyyy', { locale: ro })}
                        </Text>
                      )}
                    </View>
                    {milestone.achieved && (
                      <Ionicons name="trophy" size={20} color="#f59e0b" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        {kids.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>Niciun copil adăugat</Text>
            <Text style={styles.emptySubtitle}>
              Adaugă copiii tăi pentru a urmări activitățile și milestones
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setAddKidModal(true)}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.emptyButtonText}>Adaugă copil</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Add Kid Modal */}
      <Modal visible={addKidModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adaugă copil</Text>
              <TouchableOpacity onPress={() => setAddKidModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Nume</Text>
              <TextInput
                style={styles.input}
                value={kidName}
                onChangeText={setKidName}
                placeholder="Ex: Maria"
                placeholderTextColor="#9ca3af"
              />

              <Text style={styles.inputLabel}>Data nașterii (opțional)</Text>
              <TextInput
                style={styles.input}
                value={kidBirthDate}
                onChangeText={setKidBirthDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
              />

              <TouchableOpacity style={styles.saveButton} onPress={addKid}>
                <Text style={styles.saveButtonText}>Salvează</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Activity Modal */}
      <Modal visible={addActivityModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adaugă activitate</Text>
              <TouchableOpacity onPress={() => setAddActivityModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Numele activității</Text>
              <TextInput
                style={styles.input}
                value={activityName}
                onChangeText={setActivityName}
                placeholder="Ex: Cursuri de înot"
                placeholderTextColor="#9ca3af"
              />

              <Text style={styles.inputLabel}>Note (opțional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={activityNotes}
                onChangeText={setActivityNotes}
                placeholder="Detalii despre activitate..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity style={styles.saveButton} onPress={addActivity}>
                <Text style={styles.saveButtonText}>Salvează</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Milestone Modal */}
      <Modal visible={addMilestoneModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adaugă milestone</Text>
              <TouchableOpacity onPress={() => setAddMilestoneModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Nume milestone</Text>
              <TextInput
                style={styles.input}
                value={milestoneName}
                onChangeText={setMilestoneName}
                placeholder="Ex: A mers pe bicicletă"
                placeholderTextColor="#9ca3af"
              />

              <TouchableOpacity style={styles.saveButton} onPress={addMilestone}>
                <Text style={styles.saveButtonText}>Salvează</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf2f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#9d174d',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ec4899',
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
    backgroundColor: '#fce7f3',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    gap: 6,
  },
  kidChipActive: {
    backgroundColor: '#ec4899',
  },
  kidChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ec4899',
  },
  kidChipTextActive: {
    color: '#fff',
  },
  kidCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  kidAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fce7f3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  kidInfo: {
    flex: 1,
  },
  kidName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#9d174d',
  },
  kidAge: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  kidStats: {
    flexDirection: 'row',
    gap: 16,
  },
  kidStat: {
    alignItems: 'center',
  },
  kidStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ec4899',
  },
  kidStatLabel: {
    fontSize: 11,
    color: '#9ca3af',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#fce7f3',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#ec4899',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ec4899',
  },
  tabTextActive: {
    color: '#fff',
  },
  section: {
    paddingHorizontal: 20,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fce7f3',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  addItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ec4899',
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 15,
    color: '#9ca3af',
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  activityDate: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
  },
  activityNotes: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  milestoneAchieved: {
    color: '#10b981',
  },
  milestoneDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#9d174d',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ec4899',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 24,
    gap: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 16,
    backgroundColor: '#f9fafb',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#ec4899',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
