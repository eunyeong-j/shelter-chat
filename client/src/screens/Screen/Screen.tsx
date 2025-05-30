import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Settings } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { Message, User, UserMessage } from "../../@types/global";
import { SettingModal } from "./SettingModal";

const DEFAULT_BG_COLOR = "#fff4ff";

export const Screen = (): JSX.Element => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [message, setMessage] = useState("");
  const [messageLength, setMessageLength] = useState(0);
  const [newName, setNewName] = useState("");
  const [newBgColor, setNewBgColor] = useState(DEFAULT_BG_COLOR);

  const [hiddenUserName, setHiddenUserName] = useState(false);

  const {
    data: userData,
    isLoading: isIpLoading,
    isError: isIpError,
  } = useQuery({
    queryKey: ["ip"],
    queryFn: async () => {
      const res = await axios.get("http://192.168.0.126:5050/check-user");
      return res.data;
    },
  });

  const {
    data: users = [],
    isLoading: isUsersLoading,
    isError: isUsersError,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axios.get("http://192.168.0.126:5050/users");
      return res.data;
    },
  });

  const {
    data: messages = [],
    isLoading: isMessagesLoading,
    isError: isMessagesError,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      const res = await axios.get("http://192.168.0.126:5050/messages");
      return res.data;
    },
  });

  const { mutate: sendMessage } = useMutation({
    mutationFn: async (message: Message) => {
      const res = await axios.post(
        "http://192.168.0.126:5050/message",
        message
      );
      refetchMessages();
      return res.data;
    },
  });

  const { mutate: updateUserName } = useMutation({
    mutationFn: async (name: string) => {
      const res = await axios.put(
        `http://192.168.0.126:5050/user/${userData.user.id}/name`,
        {
          name,
        }
      );
      refetchUsers();
      setNewName("");
      setHiddenUserName(false);
      return res.data;
    },
  });

  const { mutate: updateUserBgColor } = useMutation({
    mutationFn: async (bgColor: string) => {
      const res = await axios.put(
        `http://192.168.0.126:5050/user/${userData.user.id}/bgColor`,
        {
          bgColor,
        }
      );
      refetchMessages();
      setNewBgColor(DEFAULT_BG_COLOR);
      return res.data;
    },
  });

  const { mutate: deleteMessage } = useMutation({
    mutationFn: async (id: number) => {
      const res = await axios.delete(`http://192.168.0.126:5050/message/${id}`);
      return res.data;
    },
  });

  const isServerError = useMemo(() => {
    return isUsersError || isMessagesError || isIpError;
  }, [isUsersError, isMessagesError, isIpError]);

  useEffect(() => {
    const interval = setInterval(() => {
      refetchMessages();
      refetchUsers();
      return () => clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const mainElement = document.querySelector("main");
    if (mainElement) {
      mainElement.scrollTo({
        top: mainElement.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(() => {
    setMessageLength(message.length);
  }, [message]);

  const handleEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.target as HTMLTextAreaElement).value.trim() === "") return;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();

      // Send the message
      const text = (e.target as HTMLTextAreaElement).value;
      send(text);

      // Reset the message and textarea value
      setMessage("");
      (e.target as HTMLTextAreaElement).value = "";
    }
  };

  const send = (text: string) => {
    const newMessage = {
      id: 1,
      userId: userData.user.id,
      message: text,
      createdAt: new Date(),
    };
    sendMessage(newMessage);
  };

  if (isServerError) {
    return (
      <div className="flex items-center justify-center h-screen">
        서버 오류가 발생했습니다. T.T 관리자에게 문의주세요.
      </div>
    );
  }

  if (isIpLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        허용된 사용자인지 확인중...
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (!isIpLoading && !userData?.allowed) {
    return (
      <div className="flex items-center justify-center h-screen">
        접근이 허용된 사용자가 아닙니다!
      </div>
    );
  }

  return (
    <div className="bg-[#f8f8f8] flex flex-row justify-center w-full overflow-hidden">
      <div className=" w-[1280px] h-[100vh] pt-[46px] relative">
        {/* Main Chat Container */}
        <main className="absolute w-[900px] h-[calc(100vh-180px)] top-[0x] left-[190px] bg-white border border-solid border-[#f0f0f0] overflow-y-auto overflow-x-hidden pb-[20px]">
          {/* Header */}
          <header className="fixed w-full h-[46px] top-0 left-0 bg-[#6d5fbb] shadow-[0px_4px_4px_#a3a3a340] flex items-center z-10">
            <h1 className="ml-[35px] font-bold text-white text-lg">
              FZ 한화팀 임시 대피소
            </h1>

            <SettingModal
              newName={newName}
              newBgColor={newBgColor}
              hiddenUserName={hiddenUserName}
              onNameChange={setNewName}
              onBgColorChange={setNewBgColor}
              onUpdateName={updateUserName}
              onUpdateBgColor={updateUserBgColor}
              onToggleNameVisibility={() => setHiddenUserName(!hiddenUserName)}
            />
          </header>
          <div className="relative h-[100px] flex flex-col items-center">
            {/* Previous chat message */}
            <p className="font-normal text-[#8a8a8a] text-xs text-center font-sans tracking-[0] leading-[normal] h-[100px] flex items-center justify-center">
              이전 대화가 존재하지 않습니다.
            </p>

            {/* Date Separator */}
            <div className="mx-auto flex flex-col items-center justify-center h-[50px]">
              <Separator className="w-[900px] h-px" />
              <div className="absolute bottom-0 bg-white px-3 rounded-[12.5px] border border-solid border-[#d9d9d9]">
                <span className=" py-1 font-normal text-[#8a8a8a] text-xs text-center">
                  2025년 5월 29일
                </span>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          {!isMessagesLoading &&
            messages.length > 0 &&
            messages.map((message: UserMessage) => (
              <div key={message.id} className="relative">
                <div
                  className={`flex items-start gap-4 ml-4 mt-4 ${
                    message.userId === userData.user.id
                      ? "justify-flex-start flex-row-reverse"
                      : "justify-start"
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Avatar className="w-[45px] h-[45px]">
                      <AvatarImage src={message.image} alt={message.name} />
                    </Avatar>
                    <span className="text-xs font-bold text-black">
                      {message.name}
                    </span>
                  </div>

                  <div
                    className={`flex flex-row gap-1 ${
                      message.userId === userData.user.id
                        ? "flex-row-reverse"
                        : ""
                    }`}
                  >
                    <div
                      className={`rounded-[7px] p-3 max-w-[551px]`}
                      style={{ backgroundColor: message.bgColor }}
                    >
                      <p className="font-normal text-black text-sm break-words whitespace-pre-wrap">
                        {message.message}
                      </p>
                    </div>
                    <span className="font-normal text-[#8a8a8a] text-xs self-center mb-2">
                      {message.createdAt.toLocaleString()}
                    </span>
                    {message.userId === userData.user.id && (
                      <button
                        className="font-normal text-[#8a8a8a] text-xs self-center mb-2 text-red-500 hover:text-red-700"
                        onClick={() =>
                          message.messageId
                            ? deleteMessage(message.messageId)
                            : null
                        }
                      >
                        X
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

          {/* Message Input Area */}
          <div className="fixed w-full h-[100px] bottom-[2vh] left-0 flex">
            <div className="relative w-[900px] mx-auto bg-white rounded-md border border-solid border-[#e2e2e2] flex">
              <textarea
                ref={textareaRef}
                className="h-full w-full border-none focus-visible:ring-0 font-normal text-[#000000] placeholder:text-[#8b8b8b] text-sm pl-[13px] pt-2.5 rounded-md"
                placeholder="여기에 텍스트를 입력합니다..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                onKeyDown={handleEnter}
              />
              <div className="absolute bottom-1 right-[110px] font-normal text-[#8a8a8a] text-[10px]">
                {messageLength}/500
              </div>
              <Button
                className="w-20 h-[100px] absolute right-0 bg-[#6d60bc] hover:bg-[#5d51a9] rounded-[0px_6px_6px_0px] font-bold"
                onClick={() => send(message)}
              >
                Enter
              </Button>
            </div>
          </div>
        </main>

        {/* User Sidebar */}
        <aside className="absolute right-0 top-[46px]">
          {isUsersLoading && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-10 h-10 animate-spin" />
            </div>
          )}
          {!isUsersLoading &&
            users.length > 0 &&
            users.map((user: User, index: number) => (
              <div key={user.id} className="flex items-center mb-1">
                <span
                  className={`absolute right-[100px] top-[83px] font-normal text-black text-sm w-max ${
                    hiddenUserName ? "hidden" : ""
                  }`}
                  style={{ top: `${83 + index * 56}px` }}
                >
                  {user.name}
                </span>
                <Avatar
                  className="w-[50px] h-[50px] absolute right-[40px] hover:cursor-pointer hover:opacity-90"
                  style={{ top: `${68 + index * 56}px` }}
                >
                  <AvatarImage src={user.image} alt={user.name} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
              </div>
            ))}
        </aside>
      </div>
    </div>
  );
};
