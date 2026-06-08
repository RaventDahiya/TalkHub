import React, { useState } from 'react';

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const Message = ({ msg, isOwnMessage, onReact }) => {
  const [showPicker, setShowPicker] = useState(false);

  const formatTime = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (err) {
      return '';
    }
  };

  // Group reactions by emoji key
  const reactionsGrouped = msg.reactions?.reduce((acc, curr) => {
    acc[curr.reaction] = (acc[curr.reaction] || 0) + 1;
    return acc;
  }, {}) || {};

  return (
    <div
      className={`message-bubble-wrapper ${isOwnMessage ? 'sent' : 'received'}`}
      onMouseEnter={() => setShowPicker(true)}
      onMouseLeave={() => setShowPicker(false)}
    >
      <div className="message-bubble" style={{ position: 'relative' }}>
        {showPicker && onReact && (
          <div className="reaction-picker">
            {EMOJIS.map((emoji) => (
              <span
                key={emoji}
                className="reaction-emoji-btn"
                onClick={() => onReact(msg._id, emoji)}
              >
                {emoji}
              </span>
            ))}
          </div>
        )}

        {!isOwnMessage && <div className="message-sender">{msg.senderUsername}</div>}
        <div className="message-content">{msg.content}</div>

        {/* Reaction badge icons */}
        {msg.reactions && msg.reactions.length > 0 && (
          <div className="message-reaction-badges">
            {Object.entries(reactionsGrouped).map(([emoji, count]) => (
              <span
                key={emoji}
                className="reaction-badge"
                title={`${count} reaction(s)`}
                onClick={() => onReact(msg._id, emoji)}
              >
                {emoji} {count > 1 ? count : ''}
              </span>
            ))}
          </div>
        )}

        <div className="message-time-meta">
          <span>{formatTime(msg.timestamp)}</span>
          {isOwnMessage && (
            <span style={{ color: 'var(--secondary-color)', fontSize: '0.85rem' }}>✓</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
