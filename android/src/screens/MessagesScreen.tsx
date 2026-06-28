import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  IconButton,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

import { chatApi } from '@/services/ChatApi';
import { userStore } from '@/services/UserStore';
import { markMessageSeen } from '@/services/WonderPushService';
import { useRoomCount } from '@/hooks/useRoomCount';
import type { ChatMessageDto } from '@/types/chat';
import type { DrawerParamList } from '@/navigation/types';

interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  outgoing: boolean;
  pending: boolean;
}

const DEFAULT_ROOM = 'common';

/**
 * Native chat UI for the Messages tab.
 *
 * Mirrors `frontend/src/app/components-chat/data-chat.ts`:
 *  - Loads messages for the current room/user.
 *  - Sends messages with optimistic updates.
 *  - Marks the room as read once messages are loaded.
 *  - Re-fetches whenever the unread count for the room changes.
 */
export function MessagesScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<DrawerParamList, 'Messages'>>();

  const room = route.params?.room ?? DEFAULT_ROOM;
  const currentUser = userStore.user;
  const count = useRoomCount(room);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const dtos = await chatApi.getMessages(room);
      setMessages(dtos.map((dto) => toChatMessage(dto, currentUser)));
      await chatApi.markAsRead(room, currentUser);
    } catch (err) {
      console.warn('Failed to load messages', err);
    } finally {
      setLoading(false);
    }
  }, [room, currentUser]);

  // Initial load + reload on room/user change.
  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  // Re-fetch when the unread count for this room changes (SignalR push).
  const lastCountRef = useRef<number>(-1);
  useEffect(() => {
    if (count !== lastCountRef.current) {
      lastCountRef.current = count;
      if (count > 0) {
        void loadMessages();
      }
    }
  }, [count, loadMessages]);

  const send = async () => {
    const text = draft.trim();
    if (!text || sending) return;

    const id = uuid();
    const optimistic: ChatMessage = {
      id,
      content: text,
      timestamp: new Date(),
      outgoing: true,
      pending: true,
    };

    setMessages((list) => [...list, optimistic]);
    setDraft('');
    setSending(true);

    try {
      const dto = await chatApi.sendMessage(room, {
        id,
        username: currentUser,
        content: text,
      });
      markMessageSeen(dto.id);
      setMessages((list) =>
        list.map((m) => (m.id === id ? toChatMessage(dto, currentUser) : m)),
      );
    } catch (err) {
      console.warn('Message failed to send', err);
      setMessages((list) => list.filter((m) => m.id !== id));
      setDraft(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={96}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.outgoing ? styles.bubbleOutgoing : styles.bubbleIncoming,
            ]}
          >
            <Text style={item.outgoing ? styles.textOutgoing : styles.textIncoming}>
              {item.content}
            </Text>
            <Text style={styles.timestamp}>
              {item.pending ? '…' : formatTime(item.timestamp)}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={{ marginTop: 24 }} />
          ) : (
            <Text style={styles.empty}>Noch keine Nachrichten</Text>
          )
        }
      />

      <View style={styles.inputRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Nachricht schreiben…"
          style={styles.input}
          mode="flat"
          editable={!sending}
        />
        <IconButton
          icon="send"
          mode="contained"
          onPress={send}
          disabled={!draft.trim() || sending}
          accessibilityLabel="Send message"
        />
      </View>
    </KeyboardAvoidingView>
  );
}

function toChatMessage(dto: ChatMessageDto, currentUser: string): ChatMessage {
  return {
    id: dto.id,
    content: dto.content,
    timestamp: new Date(dto.timestamp),
    outgoing: dto.username === currentUser,
    pending: false,
  };
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function uuid(): string {
  // crypto.randomUUID is available on modern RN / Hermes.
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  list: {
    padding: 12,
    flexGrow: 1,
  },
  bubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 12,
    marginVertical: 4,
  },
  bubbleOutgoing: {
    alignSelf: 'flex-end',
    backgroundColor: '#1976d2',
  },
  bubbleIncoming: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
  },
  textOutgoing: {
    color: '#ffffff',
  },
  textIncoming: {
    color: '#0b1f3a',
  },
  timestamp: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  empty: {
    textAlign: 'center',
    marginTop: 24,
    color: '#9fb3d1',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e6ee',
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
