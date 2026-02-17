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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/utils/api';
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns';
import { ro } from 'date-fns/locale';
import { Meeting } from '../../src/types';

const COLORS = [
  '#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'
];

export default function WorkScreen() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  useEffect(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const dates = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    setWeekDates(dates);
  }, [selectedDate]);

  const loadMeetings = async () => {
    try {
      const data = await api.getMeetings();
      setMeetings(data);
    } catch (error) {
      console.error('Error loading meetings:', error);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMeetings();
    setRefreshing(false);
  }, []);

  const openAddModal = () => {
    setEditingMeeting(null);
    setTitle('');
    setStartTime('09:00');
    setEndTime('10:00');
    setDescription('');
    setSelectedColor(COLORS[0]);
    setModalVisible(true);
  };

  const openEditModal = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setTitle(meeting.title);
    setStartTime(meeting.start_time);
    setEndTime(meeting.end_time);
    setDescription(meeting.description || '');
    setSelectedColor(meeting.color);
    setSelectedDate(parseISO(meeting.date));
    setModalVisible(true);
  };

  const saveMeeting = async () => {
    if (!title.trim()) {
      Alert.alert('Eroare', 'Te rog introdu un titlu');
      return;
    }

    const meetingData = {
      title: title.trim(),
      date: format(selectedDate, 'yyyy-MM-dd'),
      start_time: startTime,
      end_time: endTime,
      description: description.trim(),
      color: selectedColor,
    };

    try {
      if (editingMeeting) {
        await api.updateMeeting(editingMeeting.id, meetingData);
      } else {
        await api.createMeeting(meetingData);
      }
      await loadMeetings();
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving meeting:', error);
      Alert.alert('Eroare', 'Nu s-a putut salva \u00eent\u00e2lnirea');
    }
  };

  const deleteMeeting = async (id: string) => {
    Alert.alert(
      '\u0218terge \u00eent\u00e2lnirea',
      'E\u0219ti sigur\u0103 c\u0103 vrei s\u0103 \u0219tergi aceast\u0103 \u00eent\u00e2lnire?',
      [
        { text: 'Anuleaz\u0103', style: 'cancel' },
        {
          text: '\u0218terge',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteMeeting(id);
              await loadMeetings();
            } catch (error) {
              console.error('Error deleting meeting:', error);
            }
          },
        },
      ]
    );
  };

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayMeetings = meetings.filter((m) => m.date === selectedDateStr);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Calendar</Text>
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Month Display */}
        <Text style={styles.monthText}>
          {format(selectedDate, 'MMMM yyyy', { locale: ro })}
        </Text>

        {/* Week Calendar */}
        <View style={styles.weekContainer}>
          {weekDates.map((date, index) => {
            const isSelected = isSameDay(date, selectedDate);
            const dayMeetingsCount = meetings.filter(
              (m) => m.date === format(date, 'yyyy-MM-dd')
            ).length;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayButton,
                  isSelected && styles.dayButtonSelected,
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Text
                  style={[
                    styles.dayName,
                    isSelected && styles.dayNameSelected,
                  ]}
                >
                  {format(date, 'EEE', { locale: ro })}
                </Text>
                <Text
                  style={[
                    styles.dayNumber,
                    isSelected && styles.dayNumberSelected,
                  ]}
                >
                  {format(date, 'd')}
                </Text>
                {dayMeetingsCount > 0 && (
                  <View style={styles.meetingDot} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected Date Meetings */}
        <View style={styles.meetingsSection}>
          <Text style={styles.sectionTitle}>
            {format(selectedDate, 'EEEE, d MMMM', { locale: ro })}
          </Text>

          {dayMeetings.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>Nicio \u00eent\u00e2lnire programat\u0103</Text>
              <TouchableOpacity style={styles.emptyButton} onPress={openAddModal}>
                <Text style={styles.emptyButtonText}>Adaug\u0103 o \u00eent\u00e2lnire</Text>
              </TouchableOpacity>
            </View>
          ) : (
            dayMeetings
              .sort((a, b) => a.start_time.localeCompare(b.start_time))
              .map((meeting) => (
                <TouchableOpacity
                  key={meeting.id}
                  style={[styles.meetingCard, { borderLeftColor: meeting.color }]}
                  onPress={() => openEditModal(meeting)}
                  onLongPress={() => deleteMeeting(meeting.id)}
                >
                  <View style={styles.meetingTime}>
                    <Text style={styles.timeText}>{meeting.start_time}</Text>
                    <Text style={styles.timeDivider}>|</Text>
                    <Text style={styles.timeText}>{meeting.end_time}</Text>
                  </View>
                  <View style={styles.meetingContent}>
                    <Text style={styles.meetingTitle}>{meeting.title}</Text>
                    {meeting.description && (
                      <Text style={styles.meetingDesc} numberOfLines={2}>
                        {meeting.description}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => deleteMeeting(meeting.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
          )}
        </View>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingMeeting ? 'Editeaz\u0103 \u00eent\u00e2lnirea' : 'Ad\u0103ugare \u00eent\u00e2lnire'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.inputLabel}>Titlu</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Ex: Call cu clientul"
                placeholderTextColor="#9ca3af"
              />

              <Text style={styles.inputLabel}>Or\u0103 \u00eenceput</Text>
              <TextInput
                style={styles.input}
                value={startTime}
                onChangeText={setStartTime}
                placeholder="09:00"
                placeholderTextColor="#9ca3af"
              />

              <Text style={styles.inputLabel}>Or\u0103 sf\u00e2r\u0219it</Text>
              <TextInput
                style={styles.input}
                value={endTime}
                onChangeText={setEndTime}
                placeholder="10:00"
                placeholderTextColor="#9ca3af"
              />

              <Text style={styles.inputLabel}>Descriere (op\u021bional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Note despre \u00eent\u00e2lnire..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.inputLabel}>Culoare</Text>
              <View style={styles.colorPicker}>
                {COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorSelected,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  >
                    {selectedColor === color && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.saveButton} onPress={saveMeeting}>
              <Text style={styles.saveButtonText}>Salveaz\u0103</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3ff',
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
    color: '#4338ca',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6366f1',
    textAlign: 'center',
    marginBottom: 16,
    textTransform: 'capitalize',
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginBottom: 24,
  },
  dayButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    minWidth: 44,
  },
  dayButtonSelected: {
    backgroundColor: '#6366f1',
  },
  dayName: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  dayNameSelected: {
    color: '#c7d2fe',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 4,
  },
  dayNumberSelected: {
    color: '#fff',
  },
  meetingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6366f1',
    marginTop: 4,
  },
  meetingsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4338ca',
    marginBottom: 16,
    textTransform: 'capitalize',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
  },
  emptyButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#6366f1',
    borderRadius: 20,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  meetingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  meetingTime: {
    alignItems: 'center',
    marginRight: 16,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6366f1',
  },
  timeDivider: {
    fontSize: 12,
    color: '#d1d5db',
    marginVertical: 2,
  },
  meetingContent: {
    flex: 1,
  },
  meetingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  meetingDesc: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  deleteBtn: {
    padding: 8,
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
    maxHeight: '90%',
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
    fontSize: 20,
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
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButton: {
    backgroundColor: '#6366f1',
    margin: 20,
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
