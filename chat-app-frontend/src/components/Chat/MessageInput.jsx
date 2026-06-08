import React, { useState, useRef, useEffect } from 'react';

const MessageInput = ({ onSendMessage, onTyping }) => {
  const [text, setText] = useState('');
  const typingTimeoutRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;

    onSendMessage(text);
    setText('');
    
    // Stop typing indicator immediately
    if (isTyping) {
      setIsTyping(false);
      if (onTyping) onTyping(false);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
    
    // Trigger typing state start
    if (!isTyping) {
      setIsTyping(true);
      if (onTyping) onTyping(true);
    }

    // Reset typing clear timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (onTyping) onTyping(false);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="message-input-container">
      <form onSubmit={handleSubmit} className="message-input-form">
        <textarea
          className="message-text-area"
          placeholder="Type a message"
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows="1"
        />
        <button
          className="send-message-btn"
          type="submit"
          disabled={!text.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
