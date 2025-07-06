import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";

function Chat() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { socket, newMessage: socketMessage, clearNewMessage } = useSocket();
  const messagesEndRef = useRef(null);
  const { conversationId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find((c) => c._id === conversationId);
      if (conversation) {
        setSelectedConversation(conversation);
      } else {
        navigate("/chat");
      }
    }
  }, [conversationId, conversations, navigate]);

  useEffect(() => {
    if (socketMessage && selectedConversation) {
      if (socketMessage.conversationId === selectedConversation._id) {
        if (socketMessage.sender._id !== user._id) {
          setMessages((prev) => [...prev, socketMessage]);
        }
      }
      fetchConversations();
      clearNewMessage();
    }
  }, [socketMessage, selectedConversation, user._id, clearNewMessage]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/messages/conversations"
      );
      setConversations(response.data);
    } catch (error) {
      console.error("Ошибка загрузки бесед:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/messages/${conversationId}`
      );
      setMessages(response.data);
    } catch (error) {
      console.error("Ошибка загрузки сообщений:", error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const messageContent = newMessage;
    setNewMessage("");

    try {
      const response = await axios.post(
        `http://localhost:5000/api/messages/${selectedConversation._id}`,
        {
          content: messageContent,
        }
      );

      setMessages((prev) => [...prev, response.data]);

      fetchConversations();
    } catch (error) {
      console.error("Ошибка отправки сообщения:", error);
      setNewMessage(messageContent);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getOtherUser = (conversation) => {
    return conversation.participants.find((p) => p._id !== user._id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Загрузка чата...</div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white rounded-lg shadow-md">
      <div className="w-1/3 border-r border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Сообщения</h2>
          <button
            onClick={() => navigate("/vacancies")}
            className="text-sm text-red-600 hover:text-red-800 font-semibold"
          >
            🔍 К вакансиям
          </button>
        </div>
        <div className="overflow-y-auto h-full">
          {conversations.map((conversation) => {
            const otherUser = getOtherUser(conversation);
            return (
              <div
                key={conversation._id}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-red-50 transition-all duration-200 ${
                  selectedConversation?._id === conversation._id
                    ? "bg-red-100 border-l-4 border-red-500"
                    : ""
                }`}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                    {otherUser.name.charAt(0)}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {otherUser.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {conversation.lastMessage?.content || "Нет сообщений"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {getOtherUser(selectedConversation).name}
              </h3>
              {selectedConversation.vacancy && (
                <p className="text-sm text-gray-600 mt-1">
                  Вакансия: {selectedConversation.vacancy.title} в{" "}
                  {selectedConversation.vacancy.company}
                </p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${
                    message.sender._id === user._id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-md ${
                      message.sender._id === user._id
                        ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                        : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender._id === user._id
                          ? "text-red-200"
                          : "text-gray-500"
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={sendMessage}
              className="p-4 border-t border-gray-200"
            >
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="💬 Введите сообщение..."
                  className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
                >
                  📤 Отправить
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Выберите беседу для начала общения</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
