import React, { useState } from 'react';

const RoomList = ({ rooms, activeRoom, onRoomSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div className="room-search-bar">
        <input
          className="room-search-input"
          type="text"
          placeholder="Search or start new chat"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="room-list-container">
        <div className="room-list-title">Rooms</div>
        
        {filteredRooms.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No rooms found
          </div>
        ) : (
          filteredRooms.map((room) => (
            <div
              key={room._id}
              className={`room-item ${activeRoom?._id === room._id ? 'active' : ''}`}
              onClick={() => onRoomSelect(room)}
            >
              <div className="room-info">
                <div className="room-item-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {room.name}
                  {room.isPrivate && <span title="Private Room" style={{ fontSize: '0.8rem' }}>🔒</span>}
                </div>
                <div className="room-item-desc">
                  {room.description || 'No description available'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RoomList;
