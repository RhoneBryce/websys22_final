import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { UserContext } from '../context/UserContext';

interface AIProfile {
  id: number;
  name: string;
  personality: string;
  description: string;
  hobbies?: string;
  model_type?: string;
  compatibility_tags?: string;
}

interface Message {
  id: number;
  message_text: string;
  timestamp: string;
  sender: {
    id: number;
    name: string;
    user: {
      id: number;
    };
  };
  thread: {
    id: number;
    match: {
      id: number;
      ai1: AIProfile;
      ai2: AIProfile;
    };
  };
}

const Threads: React.FC = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [senderId, setSenderId] = useState<number | ''>('');
  const [aiProfiles, setAiProfiles] = useState<AIProfile[]>([]);
  const { user } = useContext(UserContext);

  useEffect(() => {
    fetchMessages();
    fetchAIProfiles();
  }, [threadId, user]);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/messages/${threadId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchAIProfiles = async () => {
    if (!user) return;
    try {
      const response = await api.get('/ai-profiles');
      setAiProfiles(response.data);
    } catch (error) {
      console.error('Error fetching AI profiles:', error);
    }
  };

  const sendMessage = async () => {
    if (!senderId) return;
    try {
      await api.post(`/messages/${threadId}`, { senderId: Number(senderId), message_text: newMessage });
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div>
      <h2>Thread {threadId}</h2>
      <div>
        {messages.map((msg) => {
          const isUserMessage = msg.sender.user.id === user?.id;
          let displayText;
          if (isUserMessage) {
            const matchedAI = msg.sender.id === msg.thread.match.ai1.id ? msg.thread.match.ai2 : msg.thread.match.ai1;
            displayText = `From you: Sent to: ${matchedAI.name}`;
          } else {
            displayText = `${msg.sender.name}:`;
          }
          return (
            <div key={msg.id}>
              <strong>{displayText}</strong> {msg.message_text} <em>({new Date(msg.timestamp).toLocaleString()})</em>
            </div>
          );
        })}
      </div>
      <select
        value={senderId}
        onChange={(e) => setSenderId(Number(e.target.value) || '')}
      >
        <option value="">Select AI Profile</option>
        {aiProfiles.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.name}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Message"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Threads;
