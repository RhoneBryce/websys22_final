import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

    aiProfile: AIProfile | null;
  thread: {
    id: number;
    match: {
      id: number;
      user: {
        id: number;
        username: string;
      } | null;
      ai1: AIProfile;
      ai2: AIProfile;
    };
  };
}

const Threads: React.FC = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
  }, [threadId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/messages/${threadId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="threads-container">
      <button onClick={() => navigate('/dashboard')} className="back-button">Back to Dashboard</button>
      <h2 className="conversation-title">Conversation</h2>
      <div className="messages-container">
        {messages.map((msg) => {
          // Messages are AI-only per DB schema. Determine sender from aiProfile.
          const isAI1 = msg.aiProfile && msg.aiProfile.id === msg.thread.match.ai1.id;
          const senderName = msg.aiProfile ? msg.aiProfile.name : 'Unknown';
          const messageClass = isAI1 ? 'ai1-message' : 'ai2-message';
          return (
            <div key={msg.id} className={`message ${messageClass}`}>
              <div className="message-bubble">
                <strong>{senderName}:</strong> {msg.message_text}
              </div>
              <div className="message-timestamp">
                {new Date(msg.timestamp).toLocaleString()}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default Threads;
