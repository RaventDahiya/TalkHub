import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext';
import RoomList from '../Sidebar/RoomList';
import OnlineUsers from '../Sidebar/OnlineUsers';
import CreateRoom from '../Sidebar/CreateRoom';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import Avatar from './Avatar';
import ConfirmModal from './ConfirmModal';
import api from '../../utils/api';

const ChatRoom = () => {
  const { user, logout } = useContext(AuthContext);
  const { socket, isConnected } = useContext(SocketContext);

  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [hasMoreOlder, setHasMoreOlder] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const [joinAccessKey, setJoinAccessKey] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    setJoinAccessKey('');
    setJoinError('');
    setIsJoining(false);
  }, [activeRoom?._id]);

  // Fetch all rooms on load
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get('/api/rooms');
        setRooms(res.data);
        if (res.data.length > 0) {
          // Select first room by default
          setActiveRoom(res.data[0]);
        }
      } catch (err) {
        console.error('Error fetching rooms:', err);
      }
    };
    fetchRooms();
  }, []);

  const activeRoomId = activeRoom?._id;
  const socketId = socket?.id;
  const userId = user?.id;
  const username = user?.username;

  // Listen for global room creations
  useEffect(() => {
    if (!socket) return;

    const handleGlobalRoomCreated = (newRoom) => {
      setRooms((prev) => {
        // Prevent duplicate append if we were the creator
        if (prev.some(r => r._id === newRoom._id)) return prev;
        return [newRoom, ...prev];
      });
    };

    socket.on('roomCreated', handleGlobalRoomCreated);

    return () => {
      socket.off('roomCreated', handleGlobalRoomCreated);
    };
  }, [socket]);

  // Handle active room transitions
  useEffect(() => {
    if (!activeRoomId || !socket) return;

    // Join room
    socket.emit('joinRoom', {
      roomId: activeRoomId,
      username: username,
      userId: userId
    });

    setMessages([]);
    setOnlineUsers([]);
    setTypingUsers([]);
    setHasMoreOlder(true);

    // Set up socket event listeners
    const handleNewMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleLoadHistory = (history) => {
      setMessages(history);
      if (history.length < 50) {
        setHasMoreOlder(false);
      }
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
      // Avoid listing ourselves
      if (typingUsername === username) return;

      setTypingUsers((prev) => {
        if (isTyping) {
          if (!prev.includes(typingUsername)) {
            return [...prev, typingUsername];
          }
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

    // Cleanup listeners when switching rooms
    return () => {
      socket.emit('leaveRoom', { roomId: activeRoomId, username: username });
      socket.off('message', handleNewMessage);
      socket.off('loadHistory', handleLoadHistory);
      socket.off('onlineUsers', handleOnlineUsers);
      socket.off('userJoined', handleUserJoined);
      socket.off('userLeft', handleUserLeft);
      socket.off('typing', handleTyping);
      socket.off('reactionUpdate', handleReactionUpdate);
      setTypingUsers([]);
    };
  }, [activeRoomId, socketId, userId, username, socket]);

  const handleSendMessage = (content) => {
    if (!socket || !activeRoom) return;

    socket.emit('chatMessage', {
      roomId: activeRoom._id,
      userId: user.id,
      username: user.username,
      message: content
    });
  };

  const handleReactMessage = (messageId, emoji) => {
    if (!socket || !activeRoom) return;

    socket.emit('messageReaction', {
      roomId: activeRoom._id,
      messageId,
      username: user.username,
      reaction: emoji
    });
  };

  const handleTypingHook = (isTypingBool) => {
    if (!socket || !activeRoom) return;
    socket.emit('typing', {
      roomId: activeRoom._id,
      username: user.username,
      isTyping: isTypingBool
    });
  };

  const handleLoadOlderMessages = async () => {
    if (messages.length === 0) return;
    
    // Find oldest timestamp
    const firstMsgTimestamp = messages[0].timestamp;

    try {
      const res = await api.get(`/api/rooms/${activeRoom._id}/messages?before=${firstMsgTimestamp}&limit=50`);
      
      if (res.data.length === 0) {
        setHasMoreOlder(false);
        return;
      }

      if (res.data.length < 50) {
        setHasMoreOlder(false);
      }

      setMessages((prev) => [...res.data, ...prev]);
    } catch (err) {
      console.error('Error fetching older messages:', err);
    }
  };

  const handleRoomCreated = (newRoom) => {
    // Rely on global socket event for the list append
    setActiveRoom(newRoom);
  };

  const handleRoomSelect = (room) => {
    setActiveRoom(room);
    setSidebarOpen(false);
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    if (activeRoom.isPrivate && !joinAccessKey.trim()) {
      setJoinError('Access key is required.');
      return;
    }

    setIsJoining(true);
    setJoinError('');

    try {
      const res = await api.post(`/api/rooms/${activeRoom._id}/join`, {
        accessKey: joinAccessKey
      });
      // Update room details locally
      setRooms((prev) => prev.map(r => r._id === activeRoom._id ? res.data : r));
      setActiveRoom(res.data);
      setJoinAccessKey('');
    } catch (err) {
      setJoinError(err.response?.data?.message || 'Failed to join group.');
    } finally {
      setIsJoining(false);
    }
  };

  const confirmLeaveRoom = async () => {
    if (!activeRoom) return;

    try {
      await api.post(`/api/rooms/${activeRoom._id}/leave`);
      
      // Update local rooms list state
      setRooms((prev) => prev.map(r => {
        if (r._id === activeRoom._id) {
          return {
            ...r,
            members: r.members.filter(m => m !== user.id)
          };
        }
        return r;
      }));
      
      setActiveRoom(null);
      setShowLeaveModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to leave group');
      setShowLeaveModal(false);
    }
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="auth-logo" style={{ fontSize: '1.5rem', margin: 0, fontWeight: '700' }}>TalkHub</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div className="sidebar-user" style={{ padding: 0 }}>
            <Avatar username={user.username} size={36} />
            <div className="user-meta">
              <div className="user-meta-name">{user.username}</div>
              <div className="user-meta-status">{isConnected ? '● Connected' : '○ Offline'}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={logout} title="Sign Out">
            🚪
          </button>
        </div>
      </nav>

      {/* Main Content Workspace */}
      <div className="main-content">
        {/* Sidebar Panel containing Rooms List + Active Members */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="create-room-btn-area">
            <button className="btn-secondary" onClick={() => setIsCreateOpen(true)}>
              + Create Room
            </button>
          </div>

          <RoomList
            rooms={rooms}
            activeRoom={activeRoom}
            onRoomSelect={handleRoomSelect}
          />
        </aside>

        {/* Chat window viewport */}
        {activeRoom ? (
          <>
            <main className="chat-container">
              <div className="chat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button 
                    className="btn-secondary" 
                    style={{ width: 'auto', padding: '6px 12px', display: 'none', marginRight: '10px' }}
                    id="mobile-back-btn"
                    onClick={() => setSidebarOpen(true)}
                  >
                    ◀ Rooms
                  </button>
                  <div className="chat-room-info">
                    <span className="chat-room-name">{activeRoom.name}</span>
                    <span className="chat-room-status">{activeRoom.description}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {onlineUsers.length} online
                  </span>
                  {activeRoom.members?.includes(user.id) && (
                    <button
                      className="btn-secondary"
                      style={{
                        width: 'auto',
                        padding: '6px 12px',
                        backgroundColor: '#ffebe9',
                        color: '#d73a49',
                        border: '1px solid #ffd8d6'
                      }}
                      onClick={() => setShowLeaveModal(true)}
                    >
                      Leave Group
                    </button>
                  )}
                </div>
              </div>

              {activeRoom.members?.includes(user.id) ? (
                <>
                  <MessageList
                    messages={messages}
                    currentUserId={user.id}
                    onLoadOlder={handleLoadOlderMessages}
                    hasMoreOlder={hasMoreOlder}
                    onReact={handleReactMessage}
                  />
                  
                  <TypingIndicator typingUsers={typingUsers} />
                  
                  <MessageInput
                    onSendMessage={handleSendMessage}
                    onTyping={handleTypingHook}
                  />
                </>
              ) : (
                <div className="join-group-view">
                  <div className="join-group-card">
                    <div className="avatar-circle" style={{ width: '70px', height: '70px', fontSize: '2.2rem', margin: '0 auto 20px', fontWeight: 'bold' }}>
                      {activeRoom.name.substring(0, 2).toUpperCase()}
                    </div>
                    <h2 className="join-group-title">Join "{activeRoom.name}"</h2>
                    <p className="join-group-desc">{activeRoom.description || 'No description available'}</p>
                    
                    {activeRoom.isPrivate && (
                      <div className="form-group" style={{ textAlign: 'left', marginTop: '20px' }}>
                        <label className="form-label" htmlFor="joinAccessKey">Access Key Required</label>
                        <input
                          className="form-input"
                          type="password"
                          id="joinAccessKey"
                          placeholder="Enter access key"
                          value={joinAccessKey}
                          onChange={(e) => setJoinAccessKey(e.target.value)}
                          required
                        />
                      </div>
                    )}

                    {joinError && <div className="error-banner" style={{ marginTop: '15px' }}>{joinError}</div>}

                    <button
                      className="btn-primary"
                      style={{ marginTop: '20px' }}
                      onClick={handleJoinSubmit}
                      disabled={isJoining}
                    >
                      {isJoining ? 'Joining Group...' : 'Join Group'}
                    </button>
                  </div>
                </div>
              )}

              {/* CSS injection for back-btn visibility on small screen */}
              <style>{`
                @media (max-width: 680px) {
                  #mobile-back-btn {
                    display: block !important;
                  }
                }
              `}</style>
            </main>
            
            {/* Online Users right sidebar panel */}
            {activeRoom.members?.includes(user.id) && (
              <OnlineUsers users={onlineUsers} />
            )}
          </>
        ) : (
          <div className="empty-chat-view" style={{ flex: 1 }}>
            <div className="empty-chat-icon">💬</div>
            <h2 className="empty-chat-title">Welcome to TalkHub</h2>
            <p>Create or select a room to start talking with friends in real-time!</p>
            <button
              className="btn-primary"
              style={{ width: 'auto', padding: '12px 24px', marginTop: '20px' }}
              onClick={() => setIsCreateOpen(true)}
            >
              Create Your First Room
            </button>
          </div>
        )}
      </div>

      <CreateRoom
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onRoomCreated={handleRoomCreated}
      />

      <ConfirmModal
        isOpen={showLeaveModal}
        title="Leave Room?"
        message={`Are you sure you want to leave the room "${activeRoom?.name}"? You can always rejoin later.`}
        confirmText="Leave Room"
        cancelText="Stay"
        danger={true}
        onConfirm={confirmLeaveRoom}
        onCancel={() => setShowLeaveModal(false)}
      />
    </div>
  );
};

export default ChatRoom;
