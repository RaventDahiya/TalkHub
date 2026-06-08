import React, { useEffect, useRef } from 'react';
import Message from './Message';

const MessageList = ({ messages, currentUserId, onLoadOlder, hasMoreOlder, onReact }) => {
  const bottomRef = useRef(null);
  const listRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="message-list" ref={listRef}>
      {hasMoreOlder && (
        <button className="load-more-btn" onClick={onLoadOlder}>
          Load older messages
        </button>
      )}

      {messages.length === 0 ? (
        <div className="system-message-box" style={{ margin: 'auto' }}>
          No messages here yet. Start the conversation!
        </div>
      ) : (
        messages.map((msg, index) => {
          // If system message (e.g. notifications)
          if (msg.isSystem || msg.senderUsername === 'System') {
            return (
              <div key={msg._id || index} className="message-bubble-wrapper system">
                <div className="system-message-box">{msg.content}</div>
              </div>
            );
          }

          const isOwn = msg.sender === currentUserId;
          return (
            <Message
              key={msg._id || index}
              msg={msg}
              isOwnMessage={isOwn}
              onReact={onReact}
            />
          );
        })
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
