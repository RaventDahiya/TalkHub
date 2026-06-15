import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  Modal,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import api from '../utils/api';
import colors from '../theme/colors';

export default function RoomListScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const { socket, isConnected } = useContext(SocketContext);

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // States for joining room modal
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [accessKey, setAccessKey] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joining, setJoining] = useState(false);

  const fetchRooms = async (isRef = false) => {
    if (!isRef) setLoading(true);
    try {
      const res = await api.get('/api/rooms');
      setRooms(res.data);
    } catch (err) {
      console.error('[RoomList] Error fetching rooms:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRooms();
    }, [])
  );

  // Listen to new rooms created via Socket
  useEffect(() => {
    if (!socket) return;

    const handleRoomCreated = (newRoom) => {
      setRooms((prev) => {
        if (prev.some(r => r._id === newRoom._id)) return prev;
        return [newRoom, ...prev];
      });
    };

    socket.on('roomCreated', handleRoomCreated);

    return () => {
      socket.off('roomCreated', handleRoomCreated);
    };
  }, [socket]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRooms(true);
  };

  const handleRoomPress = (room) => {
    const isMember = room.members && room.members.includes(user.id);
    if (isMember) {
      navigation.navigate('Chat', { roomId: room._id, roomName: room.name, roomDesc: room.description, isPrivate: room.isPrivate });
    } else {
      setSelectedRoom(room);
      setAccessKey('');
      setJoinError('');
      setJoinModalVisible(true);
    }
  };

  const handleJoinRoomSubmit = async () => {
    if (selectedRoom.isPrivate && !accessKey.trim()) {
      setJoinError('Access key is required for private rooms');
      return;
    }

    setJoining(true);
    setJoinError('');
    try {
      const res = await api.post(`/api/rooms/${selectedRoom._id}/join`, {
        accessKey: selectedRoom.isPrivate ? accessKey : undefined
      });
      
      // Update room local list membership
      setRooms((prev) => prev.map(r => r._id === selectedRoom._id ? res.data : r));
      setJoinModalVisible(false);
      
      // Navigate to chat
      navigation.navigate('Chat', {
        roomId: selectedRoom._id,
        roomName: selectedRoom.name,
        roomDesc: selectedRoom.description,
        isPrivate: selectedRoom.isPrivate
      });
    } catch (err) {
      setJoinError(err.response?.data?.message || 'Failed to join group');
    } finally {
      setJoining(false);
    }
  };

  const renderRoomItem = ({ item }) => {
    const isMember = item.members && item.members.includes(user.id);
    const initial = item.name ? item.name.substring(0, 2).toUpperCase() : 'RM';

    return (
      <TouchableOpacity style={styles.roomItem} onPress={() => handleRoomPress(item)}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.roomDetails}>
          <View style={styles.roomRow}>
            <Text style={styles.roomName} numberOfLines={1}>{item.name}</Text>
            {item.isPrivate && <Text style={styles.privateTag}>Lock</Text>}
          </View>
          <Text style={styles.roomDesc} numberOfLines={1}>
            {item.description || 'No description provided.'}
          </Text>
        </View>
        <View style={styles.actionCol}>
          {isMember ? (
            <Text style={styles.joinedLabel}>Joined</Text>
          ) : (
            <View style={styles.joinBtn}>
              <Text style={styles.joinBtnText}>Join</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.primary }}>
        <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
        
        {/* Header bar */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>{user?.username?.substring(0, 2).toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.username}>{user?.username}</Text>
              <Text style={styles.status}>
                {isConnected ? '● Connected' : '○ Offline'}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Title & Create Room Button */}
      <View style={styles.titleArea}>
        <Text style={styles.sectionTitle}>Chat Rooms</Text>
        <TouchableOpacity 
          style={styles.createBtn}
          onPress={() => navigation.navigate('CreateRoom')}
        >
          <Text style={styles.createBtnText}>+ Create Room</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.secondary} />
        </View>
      ) : (
        <FlatList
          data={rooms}
          renderItem={renderRoomItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.secondary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No chat rooms available.</Text>
              <Text style={styles.emptySub}>Tap Create Room above to start one!</Text>
            </View>
          }
        />
      )}

      {/* Join Room Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={joinModalVisible}
        onRequestClose={() => setJoinModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Join "{selectedRoom?.name}"</Text>
            <Text style={styles.modalDesc}>
              {selectedRoom?.description || 'No description available.'}
            </Text>

            {selectedRoom?.isPrivate ? (
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Access Key Required</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter Access Key"
                  placeholderTextColor={colors.textMuted}
                  value={accessKey}
                  onChangeText={setAccessKey}
                  secureTextEntry
                />
              </View>
            ) : (
              <Text style={styles.publicNote}>This is a public room. You can join directly.</Text>
            )}

            {joinError ? <Text style={styles.modalError}>{joinError}</Text> : null}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setJoinModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleJoinRoomSubmit}
                disabled={joining}
              >
                {joining ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.confirmButtonText}>Join Room</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgHeader,
  },
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  userAvatarText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  username: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  status: {
    color: '#a3ffd6',
    fontSize: 11,
    marginTop: 1,
  },
  logoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  logoutText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 13,
  },
  titleArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textMain,
  },
  createBtn: {
    backgroundColor: colors.lightGray,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  createBtnText: {
    color: colors.secondary,
    fontWeight: '700',
    fontSize: 13,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 12,
  },
  roomItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1.5,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#cbd5e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: colors.textMain,
    fontWeight: '700',
    fontSize: 15,
  },
  roomDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  roomName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textMain,
    marginRight: 8,
  },
  privateTag: {
    fontSize: 10,
    color: colors.danger,
    backgroundColor: colors.dangerBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: 'bold',
  },
  roomDesc: {
    fontSize: 13,
    color: colors.textMuted,
  },
  actionCol: {
    marginLeft: 8,
  },
  joinedLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  joinBtn: {
    backgroundColor: colors.secondary,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  joinBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMain,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 6,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.white,
    width: '100%',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 20,
  },
  modalInputGroup: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textMain,
    backgroundColor: colors.lightGray,
  },
  publicNote: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: '600',
    marginBottom: 20,
  },
  modalError: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: 14,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  cancelButton: {
    backgroundColor: colors.lightGray,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.textMuted,
    fontWeight: '700',
  },
  confirmButton: {
    backgroundColor: colors.secondary,
  },
  confirmButtonText: {
    color: colors.white,
    fontWeight: '700',
  },
});
