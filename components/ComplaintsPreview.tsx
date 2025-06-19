import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import { Complaint } from '~/store/complaintsStore';

export interface ComplaintsPreviewProps {
  complaints: Complaint[];
  onAddPress: () => void;
  onComplaintPress?: (complaint: Complaint) => void;
}

export function ComplaintsPreview({
  complaints,
  onAddPress,
  onComplaintPress,
}: ComplaintsPreviewProps) {
  const activeComplaints = complaints.filter(
    (complaint) => complaint.is_active && !complaint.is_deleted
  );

  const getPriorityColor = (priorityLevel: string | null | undefined) => {
    switch (priorityLevel) {
      case 'high':
        return '#dc3545'; // Kırmızı
      case 'medium':
        return '#fd7e14'; // Turuncu
      case 'low':
        return '#28a745'; // Yeşil
      default:
        return '#6c757d'; // Gri
    }
  };

  const getPriorityIcon = (priorityLevel: string | null | undefined) => {
    switch (priorityLevel) {
      case 'high':
        return 'exclamation-triangle';
      case 'medium':
        return 'exclamation';
      case 'low':
        return 'info-circle';
      default:
        return 'question-circle';
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Tarih belirtilmemiş';
    try {
      return new Date(dateString).toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return 'Geçersiz tarih';
    }
  };

  const renderComplaintCard = (complaint: Complaint) => {
    const priorityColor = getPriorityColor(complaint.priority_level);
    const priorityIcon = getPriorityIcon(complaint.priority_level);
    const cardColor = getCardColor(complaint.priority_level);
    const priorityDots = getPriorityDots(complaint.priority_level);

    return (
      <TouchableOpacity
        key={complaint.id}
        style={[styles.complaintCard, { backgroundColor: cardColor, borderColor: priorityColor }]}
        onPress={() => onComplaintPress?.(complaint)}
        activeOpacity={0.7}>
        {/* Priority Badge - Sağ üst köşe */}
        <View style={styles.priorityBadge}>
          {priorityDots.map((_, index) => (
            <View key={index} style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
          ))}
        </View>

        <View style={styles.cardHeader}>
          <FontAwesome name="stethoscope" size={16} color={priorityColor} />
          <Text style={[styles.cardTitle, { color: priorityColor }]}>
            {complaint.category_name ?? 'Kategori belirtilmemiş'}
          </Text>
          {complaint.is_critical && (
            <View style={styles.criticalBadge}>
              <Text style={styles.criticalBadgeText}>KRİTİK</Text>
            </View>
          )}
        </View>

        <Text style={styles.cardSubtitle}>
          {complaint.subcategory_name ?? 'Alt kategori belirtilmemiş'}
        </Text>

        <Text style={styles.cardContent} numberOfLines={2}>
          {complaint.description || 'Açıklama yok'}
        </Text>

        <Text style={styles.cardTime}>{formatDate(complaint.start_date)}</Text>
      </TouchableOpacity>
    );
  };

  const getCardColor = (priorityLevel: string | null | undefined) => {
    switch (priorityLevel) {
      case 'high':
        return '#fff5f5'; // Açık kırmızı
      case 'medium':
        return '#fff8f1'; // Açık turuncu
      case 'low':
        return '#f8fff9'; // Açık yeşil
      default:
        return '#f8f9fa'; // Açık gri
    }
  };

  const getPriorityDots = (priorityLevel: string | null | undefined) => {
    switch (priorityLevel) {
      case 'high':
        return [1, 2, 3]; // 3 nokta
      case 'medium':
        return [1, 2]; // 2 nokta
      case 'low':
        return [1]; // 1 nokta
      default:
        return [1]; // Varsayılan 1 nokta
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Frame */}
      <View style={styles.headerFrame}>
        <View style={styles.titleContainer}>
          <FontAwesome name="stethoscope" size={14} color="#495057" />
          <Text style={styles.title}>Şikayetler</Text>
          {activeComplaints.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{activeComplaints.length}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.addButton} onPress={onAddPress} activeOpacity={0.7}>
          <Ionicons name="add" size={12} color="#fff" />
          <Text style={styles.addButtonText}>Yeni Şikayet</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeComplaints.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome name="info-circle" size={32} color="#6c757d" />
            <Text style={styles.emptyTitle}>Aktif şikayet bulunmuyor</Text>
            <Text style={styles.emptyText}>
              Yeni bir şikayet eklemek için yukarıdaki butonu kullanın
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.complaintsContainer} showsVerticalScrollIndicator={false}>
            {activeComplaints.map(renderComplaintCard)}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 0,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerFrame: {
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
    marginLeft: 6,
  },
  countBadge: {
    backgroundColor: '#6c757d',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    paddingHorizontal: 4,
  },
  countText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6c757d',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 3,
  },
  content: {
    minHeight: 100,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginTop: 8,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
  complaintsContainer: {
    maxHeight: 250,
  },
  complaintCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    position: 'relative',
  },
  priorityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 3,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  criticalBadge: {
    backgroundColor: '#dc3545',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 30,
  },
  criticalBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 8,
    marginLeft: 24,
  },
  cardContent: {
    fontSize: 14,
    color: '#212529',
    lineHeight: 20,
    marginBottom: 8,
  },
  cardTime: {
    fontSize: 12,
    color: '#6c757d',
  },
});
