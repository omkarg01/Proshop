import React, { useState } from 'react';
import { useTamboThread, useTamboThreadInput } from '@tambo-ai/react';
import './TamboChat.css';

const TamboChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { thread } = useTamboThread();
  const { value, setValue, submit } = useTamboThreadInput();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (value.trim()) {
      await submit();
      setValue('');
    }
  };

  if (!thread) {
    return (
      <div className="tambo-chat-container">
        <button 
          className="tambo-chat-toggle"
          onClick={() => setIsOpen(!isOpen)}
        >
          💬 AI Assistant
        </button>
        {isOpen && (
          <div className="tambo-chat-window">
            <div className="tambo-chat-header">
              <h4>AI Assistant</h4>
              <button onClick={() => setIsOpen(false)}>×</button>
            </div>
            <div className="tambo-chat-messages">
              <p>Loading conversation...</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="tambo-chat-container">
      <button 
        className="tambo-chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        💬 AI Assistant
      </button>
      
      {isOpen && (
        <div className="tambo-chat-window">
          <div className="tambo-chat-header">
            <h4>AI Assistant</h4>
            <button onClick={() => setIsOpen(false)}>×</button>
          </div>
          
          <div className="tambo-chat-messages">
            {thread.messages.map((message) => (
              <div 
                key={message.id} 
                className={`tambo-message tambo-message-${message.role}`}
              >
                <div className="tambo-message-role">
                  {message.role === 'user' ? 'You' : 'AI Assistant'}
                </div>
                <div className="tambo-message-content">
                  {message.content.map((contentPart, idx) => {
                    if (contentPart.type === 'text') {
                      return <p key={idx}>{contentPart.text}</p>;
                    }
                    return null;
                  })}
                </div>
              </div>
            ))}
          </div>
          
          <form onSubmit={handleSubmit} className="tambo-chat-input">
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Type your message..."
              className="tambo-input-field"
            />
            <button type="submit" className="tambo-send-button">
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default TamboChat;
