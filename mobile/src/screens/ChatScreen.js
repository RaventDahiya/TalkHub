import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import api from '../utils/api';
import colors from '../theme/colors';

export default function ChatScreen({ route, navigation }) {
  const { roomId, roomName, roomDesc } = route.params;

  const { user } = useContext(AuthContext);
  const { socket, isConnected } = useContext(SocketContext);

  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  
  const [inputText, setInputText] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [hasMoreOlder, setHasMoreOlder] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);

  // Reaction modal
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [reactionModalVisible, setReactionModalVisible] = useState(false);

  const typingTimeoutRef = useRef(null);
  const flatListRef = useRef(null);

  // Set up header buttons
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitleText} numberOfLines={1}>{roomName}</Text>
          <Text style={styles.headerSubtext} numberOfLines={1}>{onlineUsers.length} members online</Text>
        </View>
      ),
      headerRight: () => (
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('OnlineUsers', { users: onlineUsers })}
            style={styles.headerActionBtn}
          >
            <Text style={styles.headerActionBtnText}>👥</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleConfirmLeave}
            style={[styles.headerActionBtn, styles.leaveBtn]}
          >
            <Text style={styles.leaveBtnText}>Leave</Text>
          </TouchableOpacity>
        </View>
      ),
      headerStyle: {
        backgroundColor: colors.primary,
      },
      headerTintColor: colors.white,
    });
  }, [navigation, roomName, onlineUsers]);

  // Connect / Join Room Socket Events
  useEffect(() => {
    if (!socket || !roomId) return;

    // Join room
    socket.emit('joinRoom', {
      roomId,
      username: user.username,
      userId: user.id
    });

    setMessages([]);
    setOnlineUsers([]);
    setTypingUsers([]);
    setHasMoreOlder(true);
    setLoadingHistory(true);

    const handleNewMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleLoadHistory = (history) => {
      setMessages(history);
      if (history.length < 50) {
        setHasMoreOlder(false);
      }
      setLoadingHistory(false);
    };

    const handleOnlineUsers = (users) => {
      setOnlineUsers(users);
    };

    const handleUserJoined = (joinMeta) => {
      setMessages((prev) => [...prev, {
        isSystem: true,
        content: joinMeta.message,
        timestamp: new Date()
      }]);
    };

    const handleUserLeft = (leaveMeta) => {
      setMessages((prev) => [...prev, {
        isSystem: true,
        content: leaveMeta.message,
        timestamp: new Date()
      }]);
    };

    const handleTyping = ({ username: typingUsername, isTyping }) => {
      if (typingUsername === user.username) return;

      setTypingUsers((prev) => {
        if (isTyping) {
          if (!prev.includes(typingUsername)) return [...prev, typingUsername];
          return prev;
        } else {
          return prev.filter((u) => u !== typingUsername);
        }
      });
    };

    const handleReactionUpdate = ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, reactions } : msg
        )
      );
    };

    socket.on('message', handleNewMessage);
    socket.on('loadHistory', handleLoadHistory);
    socket.on('onlineUsers', handleOnlineUsers);
    socket.on('userJoined', handleUserJoined);
    socket.on('userLeft', handleUserLeft);
    socket.on('typing', handleTyping);
    socket.on('reactionUpdate', handleReactionUpdate);

    return () => {
      socket.emit('leaveRoom', { roomId, username: user.username });
      socket.off('message', handleNewMessage);
      socket.off('loadHistory', handleLoadHistory);
      socket.off('onlineUsers', handleOnlineUsers);
      socket.off('userJoined', handleUserJoined);
      socket.off('userLeft', handleUserLeft);
      socket.off('typing', handleTyping);
      socket.off('reactionUpdate', handleReactionUpdate);
    };
  }, [roomId, socket, user.id, user.username]);

  const handleSendMessage = () => {
    if (!socket || !inputText.trim()) return;

    socket.emit('chatMessage', {
      roomId,
      userId: user.id,
      username: user.username,
      message: inputText.trim()
    });

    setInputText('');
    handleTypingStatus(false);
  };

  const handleTypingStatus = (isTyping) => {
    if (!socket) return;
    socket.emit('typing', {
      roomId,
      username: user.username,
      isTyping
    });
  };

  const handleTextChange = (text) => {
    setInputText(text);

    // Typing indicator throttle/debounce
    handleTypingStatus(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      handleTypingStatus(false);
    }, 2000);
  };

  const handleLoadOlderMessages = async () => {
    if (messages.length === 0 || loadingOlder || !hasMoreOlder) return;

    setLoadingOlder(true);
    const firstMsgTimestamp = messages[0].timestamp;

    try {
      const res = await api.get(`/api/rooms/${roomId}/messages?before=${firstMsgTimestamp}&limit=50`);
      if (res.data.length === 0) {
        setHasMoreOlder(false);
        return;
      }
      if (res.data.length < 50) {
        setHasMoreOlder(false);
      }
      setMessages((prev) => [...res.data, ...prev]);
    } catch (err) {
      console.error('[Chat] Error loading older messages:', err);
    } finally {
      setLoadingOlder(false);
    }
  };

  const handleConfirmLeave = () => {
    Alert.alert(
      'Leave Group',
      `Are you sure you want to leave the room "${roomName}"? You can always rejoin later.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Leave Room', style: 'destructive', onPress: handleLeaveRoom }
      ]
    );
  };

  const handleLeaveRoom = async () => {
    try {
      await api.post(`/api/rooms/${roomId}/leave`);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to leave room');
    }
  };

  const handleReactionPress = (message) => {
    // Cannot react to system logs
    if (message.isSystem || message.senderUsername === 'System') return;
    setSelectedMessage(message);
    setReactionModalVisible(true);
  };

  const handleAddReaction = (emoji) => {
    if (!socket || !selectedMessage) return;

    socket.emit('messageReaction', {
      roomId,
      messageId: selectedMessage._id,
      username: user.username,
      reaction: emoji
    });

    setReactionModalVisible(false);
    setSelectedMessage(null);
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
  };

  const renderMessageItem = ({ item }) => {
    if (item.isSystem || item.senderUsername === 'System') {
      return (
        <View style={styles.systemBox}>
          <Text style={styles.systemText}>{item.content}</Text>
        </View>
      );
    }

    const isSentByMe = item.sender === user.id;

    return (
      <TouchableOpacity
        onLongPress={() => handleReactionPress(item)}
        activeOpacity={0.8}
        style={[
          styles.messageBubbleWrapper,
          isSentByMe ? styles.sentWrapper : styles.receivedWrapper
        ]}
      >
        <View style={[
          styles.messageBubble,
          isSentByMe ? styles.sentBubble : styles.receivedBubble
        ]}>
          {!isSentByMe && <Text style={styles.messageSender}>{item.senderUsername}</Text>}
          <Text style={styles.messageContent}>{item.content}</Text>
          
          <View style={styles.messageMeta}>
            <Text style={styles.messageTime}>{formatTime(item.timestamp)}</Text>
          </View>

          {/* Render Reactions */}
          {item.reactions && item.reactions.length > 0 ? (
            <View style={styles.reactionsContainer}>
              {item.reactions.map((r, idx) => (
                <View key={idx} style={styles.reactionPill}>
                  <Text style={styles.reactionEmoji}>{r.reaction}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 100}
      >
        {loadingHistory ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.secondary} />
            <Text style={styles.loadingText}>Loading chat history...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={(item, index) => item._id || index.toString()}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListHeaderComponent={
              hasMoreOlder ? (
                <TouchableOpacity 
                  onPress={handleLoadOlderMessages}
                  disabled={loadingOlder}
                  style={styles.loadOlderBtn}
                >
                  {loadingOlder ? (
                    <ActivityIndicator size="small" color={colors.secondary} />
                  ) : (
                    <Text style={styles.loadOlderText}>Load Older Messages</Text>
                  )}
                </TouchableOpacity>
              ) : null
            }
          />
        )}

        {/* Typing indicator */}
        {typingUsers.length > 0 ? (
          <View style={styles.typingIndicatorContainer}>
            <Text style={styles.typingText}>
              {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
            </Text>
          </View>
        ) : null}

        {/* Message Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message"
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={handleTextChange}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>

        {/* Reaction Emoji Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={reactionModalVisible}
          onRequestClose={() => setReactionModalVisible(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setReactionModalVisible(false)}
          >
            <View style={styles.reactionModalContent}>
              <Text style={styles.reactionModalTitle}>Add Reaction</Text>
              <View style={styles.emojiRow}>
                {['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '🎉'].map((emoji) => (
                  <TouchableOpacity 
                    key={emoji} 
                    style={styles.emojiBtn}
                    onPress={() => handleAddReaction(emoji)}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundChat,
  },
  keyboardView: {
    flex: 1,
  },
  headerInfo: {
    justifyContent: 'center',
  },
  headerTitleText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  headerSubtext: {
    color: '#a3ffd6',
    fontSize: 11,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionBtn: {
    padding: 6,
    borderRadius: 6,
  },
  headerActionBtnText: {
    fontSize: 18,
  },
  leaveBtn: {
    backgroundColor: '#ffebe9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  leaveBtnText: {
    color: '#d73a49',
    fontWeight: 'bold',
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textMuted,
    marginTop: 8,
    fontSize: 14,
  },
  messageList: {
    padding: 16,
    gap: 12,
    flexGrow: 1,
  },
  loadOlderBtn: {
    alignSelf: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  loadOlderText: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  messageBubbleWrapper: {
    maxWidth: '75%',
  },
  sentWrapper: {
    alignSelf: 'flex-end',
  },
  receivedWrapper: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sentBubble: {
    backgroundColor: colors.bubbleSent,
    borderTopRightRadius: 0,
  },
  receivedBubble: {
    backgroundColor: colors.bubbleReceived,
    borderTopLeftRadius: 0,
  },
  messageSender: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: 2,
  },
  messageContent: {
    fontSize: 15,
    color: colors.textMain,
  },
  messageMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 10,
    color: colors.textMuted,
  },
  systemBox: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: colors.border,
    marginVertical: 4,
  },
  systemText: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 4,
  },
  reactionPill: {
    backgroundColor: colors.bgHeader,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  reactionEmoji: {
    fontSize: 11,
  },
  typingIndicatorContainer: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    backgroundColor: 'rgba(239, 234, 226, 0.9)',
  },
  typingText: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  inputBar: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: colors.bgHeader,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 15,
    color: colors.textMain,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.secondary,
    width: 50,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 13,
  },
  // Reaction Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  reactionModalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
  },
  reactionModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 16,
    textAlign: 'center',
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  emojiBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
  },
  emojiText: {
    fontSize: 24,
  },
});
