import React from 'react';
import Avatar from '../Chat/Avatar';
import './OnlineUsers.css';

const OnlineUsers = ({ users }) => {
  return (
    <div className="online-users-container">
      <div className="online-users-header">
        <h3>Online Users</h3>
        <span className="user-count">{users.length} online</span>
      </div>
      
      <div className="online-users-list">
        {users.length === 0 ? (
          <p className="no-users">No users online</p>
        ) : (
          users.map((user, index) => (
            <div key={user.userId || index} className="online-user-item">
              <Avatar username={user.username} size={36} />
              <span className="username">{user.username}</span>
              <span className="online-indicator"></span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OnlineUsers;
