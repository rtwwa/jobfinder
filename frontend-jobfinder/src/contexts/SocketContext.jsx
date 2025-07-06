import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const SocketContext = createContext();

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [newMessage, setNewMessage] = useState(null);
  const [newVacancy, setNewVacancy] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io("http://localhost:5000", {
        auth: {
          token: localStorage.getItem("token"),
        },
      });

      newSocket.on("connect", () => {
        console.log("Connected to server");
      });

      newSocket.on("disconnect", () => {
        console.log("Disconnected from server");
      });

      newSocket.on("newVacancy", (data) => {
        console.log("Получено уведомление о новой вакансии:", data);
        setNewVacancy(data);

        if (data.isRelevant) {
          toast.success(
            `${data.message}\n🎯 Совпадения: ${
              data.matchedInterests?.join(", ") || "не указаны"
            }`,
            {
              duration: 8000,
              icon: "🎯",
              action: {
                text: "Посмотреть",
                onClick: () => {
                  window.location.href = "/vacancies";
                },
              },
            }
          );
        } else {
          toast.info(data.message, {
            duration: 5000,
            icon: "📢",
            action: {
              text: "Посмотреть",
              onClick: () => {
                window.location.href = "/vacancies";
              },
            },
          });
        }
      });

      newSocket.on("newMessage", (message) => {
        console.log("Получено новое сообщение:", message);
        setNewMessage(message);

        if (message.sender !== user?.email) {
          toast.success(`Новое сообщение от ${message.sender.name}`, {
            duration: 4000,
            icon: "💬",
            action: {
              text: "Открыть чат",
              onClick: () => {
                window.location.href = "/chat";
              },
            },
          });
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const value = {
    socket,
    newMessage,
    newVacancy,
    clearNewMessage: () => setNewMessage(null),
    clearNewVacancy: () => setNewVacancy(null),
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}
