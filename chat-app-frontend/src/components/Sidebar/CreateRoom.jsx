import React, { useState } from 'react';
import api from '../../utils/api';

const CreateRoom = ({ isOpen, onClose, onRoomCreated }) => {
  const [roomName, setRoomName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) {
      setError('Room name is required');
      return;
    }
    if (isPrivate && !accessKey.trim()) {
      setError('Access key is required for private rooms');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await api.post('/api/rooms', {
        name: roomName,
        description,
        isPrivate,
        accessKey: isPrivate ? accessKey : ''
      });
      onRoomCreated(res.data);
      setRoomName('');
      setDescription('');
      setIsPrivate(false);
      setAccessKey('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">Create New Chat Room</h3>
        
        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="roomName">Room Name</label>
            <input
              className="form-input"
              type="text"
              id="roomName"
              placeholder="e.g. Technology Talk"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">Description (Optional)</label>
            <input
              className="form-input"
              type="text"
              id="description"
              placeholder="What is this room about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '15px 0' }}>
            <input
              type="checkbox"
              id="isPrivate"
              checked={isPrivate}
              onChange={(e) => {
                setIsPrivate(e.target.checked);
                if (!e.target.checked) setAccessKey('');
              }}
              style={{ cursor: 'pointer', width: '18px', height: '18px' }}
            />
            <label htmlFor="isPrivate" style={{ cursor: 'pointer', fontWeight: '500', fontSize: '0.95rem' }}>
              Private Room (Requires key to join)
            </label>
          </div>

          {isPrivate && (
            <div className="form-group">
              <label className="form-label" htmlFor="accessKey">Access Key / Password</label>
              <input
                className="form-input"
                type="text"
                id="accessKey"
                placeholder="Enter room password key"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                required={isPrivate}
              />
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              style={{ width: 'auto' }}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ width: 'auto', padding: '12px 24px' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoom;
