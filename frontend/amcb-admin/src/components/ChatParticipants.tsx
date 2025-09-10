import React from 'react';
import { Chat } from '../types';

interface ChatParticipantsProps {
  chat: Chat;
}

const ChatParticipants: React.FC<ChatParticipantsProps> = ({ chat }) => {
  if (!chat.participants || chat.participants.length === 0) {
    return null;
  }

  const getParticipantDisplayName = (participantId: string) => {
    if (participantId === 'support' || participantId === 'admin') {
      return '🛡️ Support';
    }
    if (participantId === chat.userId) {
      return `👤 ${chat.userName || 'Utilisateur'}`;
    }
    return `👤 ${participantId}`;
  };

  return (
    <div className="mt-2">
      <div className="text-xs text-gray-600 mb-1">Participants :</div>
      <div className="flex flex-wrap gap-1">
        {chat.participants.map((participantId, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
          >
            {getParticipantDisplayName(participantId)}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ChatParticipants;
