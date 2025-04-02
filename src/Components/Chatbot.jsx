import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your AI assistant. How can I help you today?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Get API key from environment variables
  const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (input.trim() === "") return;
    
    const userMessage = { text: input, sender: "user" };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            ...messages.map(msg => ({
              role: msg.sender === "user" ? "user" : "assistant",
              content: msg.text
            })),
            { role: "user", content: input }
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`,
          },
        }
      );
      
      const botReply = {
        text: response.data.choices[0].message.content,
        sender: "bot",
      };
      
      setMessages(prev => [...prev, botReply]);
    } catch (error) {
      console.error("Error fetching response:", error);
      let errorMessage = "Sorry, I couldn't fetch a response.";
      
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        
        if (error.response.status === 401) {
          errorMessage = "API key error. Please check your OpenAI API key.";
        } else if (error.response.data?.error?.message) {
          errorMessage = `Error: ${error.response.data.error.message}`;
        }
      } else if (error.request) {
        errorMessage = "No response received from the server. Please check your internet connection.";
      }
      
      setMessages(prev => [
        ...prev,
        { text: errorMessage, sender: "bot" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-lg border-0" style={{ borderRadius: "16px", background: "#f8f9fa" }}>
            {/* Header */}
            <div className="card-header d-flex align-items-center" style={{ 
              background: "linear-gradient(135deg, #4b6cb7 0%, #182848 100%)",
              borderRadius: "16px 16px 0 0",
              border: "none",
              padding: "16px"
            }}>
              <div className="rounded-circle bg-white p-1 me-3 d-flex justify-content-center align-items-center" style={{ width: "40px", height: "40px" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#4b6cb7" className="bi bi-robot" viewBox="0 0 16 16">
                  <path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5M3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.6 26.6 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.93.93 0 0 1-.765.935c-.845.147-2.34.346-4.235.346s-3.39-.2-4.235-.346A.93.93 0 0 1 3 9.219zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a24.8 24.8 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25 25 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.135"/>
                  <path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2zM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5"/>
                </svg>
              </div>
              <div>
                <h5 className="mb-0 text-white fw-bold">AI Assistant</h5>
                <small className="text-white-50">Powered by OpenAI</small>
              </div>
              <div className="ms-auto">
                {isLoading && (
                  <div className="spinner-grow spinner-grow-sm text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Messages */}
            <div className="card-body" style={{ 
              height: "450px", 
              overflowY: "auto",
              padding: "20px",
              background: "#f8f9fa"
            }}>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`d-flex mb-3 ${
                    msg.sender === "user" ? "justify-content-end" : "justify-content-start"
                  }`}
                >
                  {msg.sender === "bot" && (
                    <div className="rounded-circle bg-primary d-flex justify-content-center align-items-center me-2" style={{ minWidth: "32px", height: "32px", marginTop: "6px" }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" className="bi bi-robot" viewBox="0 0 16 16">
                        <path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5M3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.6 26.6 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.93.93 0 0 1-.765.935c-.845.147-2.34.346-4.235.346s-3.39-.2-4.235-.346A.93.93 0 0 1 3 9.219zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a24.8 24.8 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25 25 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.135"/>
                        <path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2zM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5"/>
                      </svg>
                    </div>
                  )}
                  <div className="d-flex flex-column" style={{ maxWidth: "75%" }}>
                    <div
                      className={`p-3 ${
                        msg.sender === "user" 
                          ? "bg-primary text-white" 
                          : "bg-white"
                      }`}
                      style={{ 
                        borderRadius: msg.sender === "user" 
                          ? "18px 18px 0 18px" 
                          : "0 18px 18px 18px",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
                      }}
                    >
                      {msg.text}
                    </div>
                    <div className={`text-muted small mt-1 ${
                      msg.sender === "user" ? "text-end" : ""
                    }`}>
                      {formatTimestamp()}
                    </div>
                  </div>
                  {msg.sender === "user" && (
                    <div className="rounded-circle bg-info d-flex justify-content-center align-items-center ms-2" style={{ minWidth: "32px", height: "32px", marginTop: "6px" }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" className="bi bi-person-fill" viewBox="0 0 16 16">
                        <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="d-flex justify-content-start mb-3">
                  <div className="rounded-circle bg-primary d-flex justify-content-center align-items-center me-2" style={{ minWidth: "32px", height: "32px" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" className="bi bi-robot" viewBox="0 0 16 16">
                      <path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5M3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.6 26.6 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.93.93 0 0 1-.765.935c-.845.147-2.34.346-4.235.346s-3.39-.2-4.235-.346A.93.93 0 0 1 3 9.219zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a24.8 24.8 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25 25 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.135"/>
                      <path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2zM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5"/>
                    </svg>
                  </div>
                  <div 
                    className="p-3 bg-white"
                    style={{ 
                      borderRadius: "0 18px 18px 18px",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                      minWidth: "60px"
                    }}
                  >
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input */}
            <div className="card-footer bg-white" style={{ 
              borderTop: "1px solid rgba(0,0,0,0.05)",
              borderRadius: "0 0 16px 16px",
              padding: "16px"
            }}>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control border-2"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  disabled={isLoading}
                  style={{ 
                    borderRadius: "30px 0 0 30px",
                    padding: "12px 20px",
                    fontSize: "14px",
                    boxShadow: "none",
                    backgroundColor: "#f8f9fa"
                  }}
                />
                <button 
                  className="btn btn-primary px-4"
                  onClick={handleSend}
                  disabled={isLoading}
                  style={{ 
                    borderRadius: "0 30px 30px 0",
                    background: "linear-gradient(135deg, #4b6cb7 0%, #182848 100%)",
                    border: "none"
                  }}
                >
                  {isLoading ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-send-fill" viewBox="0 0 16 16">
                      <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Add custom CSS for typing animation */}
          <style jsx>{`
            .typing-indicator {
              display: flex;
              align-items: center;
            }
            
            .typing-indicator span {
              height: 8px;
              width: 8px;
              margin: 0 1px;
              background-color: #4b6cb7;
              display: block;
              border-radius: 50%;
              opacity: 0.4;
              animation: typing 1s infinite;
            }
            
            .typing-indicator span:nth-child(1) {
              animation-delay: 0s;
            }
            
            .typing-indicator span:nth-child(2) {
              animation-delay: 0.2s;
            }
            
            .typing-indicator span:nth-child(3) {
              animation-delay: 0.4s;
            }
            
            @keyframes typing {
              0% {
                opacity: 0.4;
                transform: scale(1);
              }
              50% {
                opacity: 1;
                transform: scale(1.2);
              }
              100% {
                opacity: 0.4;
                transform: scale(1);
              }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;