import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isUnread: boolean;
  type: 'doctor' | 'ai' | 'system';
}

export interface MessagesPreviewProps {
  messages: Message[];
  onDoctorPress: () => void;
  onAssistantPress: () => void;
  doctorMessages?: Message[];
  aiMessages?: Message[];
  hasNewMessages?: boolean;
  unreadDoctorCount?: number;
  unreadAiCount?: number;
}

export function MessagesPreview({
  messages,
  onDoctorPress,
  onAssistantPress,
  doctorMessages = [],
  aiMessages = [],
  hasNewMessages = false,
  unreadDoctorCount = 0,
  unreadAiCount = 0,
}: MessagesPreviewProps) {
  const totalUnreadCount = unreadDoctorCount + unreadAiCount;

  // Okunmamış mesajları bul
  const unreadDoctorMessage = doctorMessages.find(
    (msg) => msg.isUnread && !msg.sender.includes('Sen')
  );
  const unreadAiMessage = aiMessages.find((msg) => msg.isUnread && !msg.sender.includes('Sen'));

  const renderUnreadMessageCard = (message: Message, onPress: () => void) => {
    const isDoctorMessage = message.type === 'doctor';
    const icon = isDoctorMessage ? 'user-md' : 'android';
    const iconColor = isDoctorMessage ? '#007bff' : '#6f42c1';
    const cardColor = isDoctorMessage ? '#f8f9ff' : '#f8f9f9';
    const borderColor = isDoctorMessage ? '#007bff' : '#6f42c1';

    return (
      <TouchableOpacity
        style={[styles.unreadMessageCard, { backgroundColor: cardColor, borderColor }]}
        onPress={onPress}
        activeOpacity={0.7}>
        <View style={styles.cardHeader}>
          <FontAwesome name={icon as any} size={16} color={iconColor} />
          <Text style={[styles.cardTitle, { color: iconColor }]}>
            {isDoctorMessage ? 'Doktorunuzdan yeni mesaj' : "AI Asistan'dan yeni mesaj"}
          </Text>
          {/* <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>YENİ</Text>
          </View> */}
        </View>
        <Text style={styles.cardContent} numberOfLines={2}>
          {message.content}
        </Text>
        <Text style={styles.cardTime}>{message.timestamp}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Frame */}
      <View style={styles.headerFrame}>
        <View style={styles.titleContainer}>
          <FontAwesome name="comments" size={14} color="#495057" />
          <Text style={styles.title}>Mesajlar</Text>
          {totalUnreadCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{totalUnreadCount}</Text>
            </View>
          )}
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.doctorButton]}
            onPress={onDoctorPress}
            activeOpacity={0.7}>
            <FontAwesome name="user-md" size={10} color="#fff" />
            <Text style={styles.buttonText}>Doktorum</Text>
            {unreadDoctorCount > 0 && (
              <View style={styles.buttonBadge}>
                <Text style={styles.buttonBadgeText}>{unreadDoctorCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.assistantButton]}
            onPress={onAssistantPress}
            activeOpacity={0.7}>
            <FontAwesome name="android" size={10} color="#fff" />
            <Text style={styles.buttonText}>Asistan</Text>
            {unreadAiCount > 0 && (
              <View style={styles.buttonBadge}>
                <Text style={styles.buttonBadgeText}>{unreadAiCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {unreadDoctorMessage || unreadAiMessage ? (
          <View style={styles.unreadMessagesContainer}>
            {unreadDoctorMessage && renderUnreadMessageCard(unreadDoctorMessage, onDoctorPress)}
            {unreadAiMessage && renderUnreadMessageCard(unreadAiMessage, onAssistantPress)}
          </View>
        ) : (
          <View style={styles.noNewMessagesContainer}>
            <FontAwesome name="comments" size={24} color="#495057" />
            <Text style={styles.noNewMessagesTitle}>Yeni mesajınız yok</Text>
            {/* <Text style={styles.noNewMessagesText}>
              Doktorunuz veya AI asistan ile mesajlaşmak için yukarıdaki butonları kullanabilirsiniz
            </Text> */}
          </View>
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
  buttonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    position: 'relative',
  },
  doctorButton: {
    backgroundColor: '#007bff',
  },
  assistantButton: {
    backgroundColor: '#6f42c1',
  },
  buttonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  buttonBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#6c757d',
    borderRadius: 8,
    minWidth: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  buttonBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginTop: 8,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
  messagesContainer: {
    maxHeight: 200,
  },
  messageItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  messageTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#495057',
    marginLeft: 6,
  },
  headerSpacer: {
    flex: 1,
  },
  messageUnreadBadge: {
    backgroundColor: '#dc3545',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginRight: 6,
  },
  messageUnreadText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#dc3545',
  },
  messageText: {
    fontSize: 13,
    color: '#212529',
    lineHeight: 18,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 11,
    color: '#6c757d',
  },
  noMessageText: {
    fontSize: 13,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  unreadMessagesContainer: {
    gap: 12,
  },
  unreadMessageCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
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
  newBadge: {
    backgroundColor: '#dc3545',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
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
  noNewMessagesContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  noNewMessagesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginTop: 12,
    marginBottom: 8,
  },
  noNewMessagesText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
});
