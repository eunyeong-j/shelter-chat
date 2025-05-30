import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, X } from "lucide-react";
import { Avatar, AvatarImage } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { UserMessage } from "../../@types/global";
import { Setting } from "./Setting";
import { Users } from "./Users";
import { BackgroundVideo } from "../../components/BackgroundVideo";
import { websocketService } from "../../lib/websocket";
import {
  useDeleteMessage,
  useCheckUser,
  useUsers,
  useMessages,
  useSendMessage,
  useUpdateUserName,
  useUpdateUserBgColor,
} from "../../lib/api";
const DEFAULT_BG_COLOR = "#fff4ff";

export const Screen = (): JSX.Element => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [message, setMessage] = useState("");
  const [messageLength, setMessageLength] = useState(0);
  const [newName, setNewName] = useState("");
  const [newBgColor, setNewBgColor] = useState(DEFAULT_BG_COLOR);

  const {
    data: userData,
    isLoading: isIpLoading,
    isError: isIpError,
  } = useCheckUser();

  const {
    data: users = [],
    isLoading: isUsersLoading,
    isError: isUsersError,
    refetch: refetchUsers,
  } = useUsers();

  const {
    data: messages = [],
    isLoading: isMessagesLoading,
    isError: isMessagesError,
    refetch: refetchMessages,
  } = useMessages();

  const { mutate: sendMessage } = useSendMessage();
  const { mutate: updateUserName } = useUpdateUserName();
  const { mutate: updateUserBgColor } = useUpdateUserBgColor();
  const { mutate: deleteMessage } = useDeleteMessage();

  const isServerError = useMemo(() => {
    return isUsersError || isMessagesError || isIpError;
  }, [isUsersError, isMessagesError, isIpError]);

  useEffect(() => {
    // Subscribe to WebSocket events
    websocketService.subscribe("USER_UPDATE", () => {
      refetchUsers();
    });

    websocketService.subscribe("MESSAGE_UPDATE", () => {
      refetchMessages();
    });

    websocketService.subscribe("LOG_UPDATE", () => {
      refetchMessages();
    });

    // Cleanup subscriptions when component unmounts
    return () => {
      websocketService.unsubscribe("USER_UPDATE", refetchUsers);
      websocketService.unsubscribe("MESSAGE_UPDATE", refetchMessages);
      websocketService.unsubscribe("LOG_UPDATE", refetchMessages);
    };
  }, []);

  useEffect(() => {
    const mainElement = document.querySelector("#chat-container");
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
    const text = (e.target as HTMLTextAreaElement).value.trim();

    if (text === "") return;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();

      // Send the message
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
      <div className="flex items-center justify-center h-screen text-white">
        접근이 허용된 사용자가 아닙니다!
      </div>
    );
  }

  return (
    <div className="max-w-[640px] mx-auto bg-[#f8f8f8] flex flex-row justify-center w-full overflow-hidden">
      <BackgroundVideo />
      <div className=" w-full h-[100vh] pt-[46px] pb-[120px] relative">
        {/* Main Chat Container */}
        <div
          id="chat-container"
          className="w-full mx-auto h-full top-[0x] left-[190px] bg-white border border-solid border-[#f0f0f0] overflow-y-auto overflow-x-hidden py-[20px]"
        >
          {/* Header */}
          <header className="absolute w-full h-[45px] top-0 left-0 bg-[#6d5fbb] shadow-[0px_4px_4px_#a3a3a340] flex items-center z-10">
            <h1 className="ml-[45px] font-bold text-white text-lg ">
              직딩 임시 대피소
            </h1>

            <Users
              users={users}
              isUsersLoading={isUsersLoading}
              refetchUsers={refetchUsers}
            />

            <Setting
              newName={newName}
              newBgColor={newBgColor}
              onNameChange={setNewName}
              onBgColorChange={setNewBgColor}
              onUpdateName={() => {
                updateUserName({
                  userId: userData.user.id,
                  oldName: userData.user.name,
                  newName: newName,
                });
                setNewName("");
              }}
              onUpdateBgColor={() => {
                updateUserBgColor({
                  userId: userData.user.id,
                  bgColor: newBgColor,
                });
                setNewBgColor(DEFAULT_BG_COLOR);
              }}
            />
          </header>

          <div className="w-full relative h-[100px] flex flex-col items-center">
            {/* Previous chat message */}
            <p className="w-full font-normal text-[#8a8a8a] text-xs text-center font-sans tracking-[0] leading-[normal] h-[100px] flex items-center justify-center select-none">
              이전 대화가 존재하지 않습니다.
            </p>
          </div>

          {/* Chat Messages */}
          {!isMessagesLoading &&
            messages.length > 0 &&
            messages.map((message: UserMessage, index: number) => {
              const isContinueMessage =
                index !== 0 &&
                messages[index - 1].type !== "LOG" &&
                message.userId === messages[index - 1].userId;

              if (message?.type === "DATE") {
                return (
                  <div
                    key={`date-${message.id}-${index}`}
                    className="relative w-full mx-auto flex flex-col items-center justify-center h-[50px]"
                  >
                    <Separator className="w-full h-px absolute top-6" />
                    <div className="bg-white px-3 rounded-[12.5px] border border-solid border-[#d9d9d9] z-10">
                      <span className="font-normal text-[#8a8a8a] text-xs text-center">
                        {message.message}
                      </span>
                    </div>
                  </div>
                );
              }

              if (message?.type === "LOG") {
                return (
                  <div key={`log-${message.id}-${index}`} className="relative">
                    <p className="w-full font-normal text-[#8a8a8a] text-xs text-center font-sans tracking-[0] leading-[normal] h-[50px] flex items-center justify-center select-none">
                      ({message.createdAt.toLocaleString()}) {message.message}
                    </p>
                  </div>
                );
              }

              return (
                <div key={`${message.id}-${index}`} className="relative">
                  <div
                    className={`flex items-start gap-4 mx-4 ${
                      isContinueMessage ? "my-2" : "my-4"
                    } ${
                      message.userId === userData.user.id
                        ? "justify-flex-start flex-row-reverse"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex flex-col items-center gap-1 ${
                        isContinueMessage ? "mx-[23px]" : ""
                      }`}
                    >
                      {!isContinueMessage && (
                        <Avatar
                          className={`w-[45px] h-[45px]  ${
                            isContinueMessage ? "my-0" : "my-[14px]"
                          }`}
                        >
                          <AvatarImage src={message.image} alt={message.name} />
                        </Avatar>
                      )}
                    </div>

                    <div className={`flex flex-col gap-1`}>
                      {!isContinueMessage && (
                        <span
                          className={`text-xs font-bold text-[#595959] ${
                            message.userId === userData.user.id
                              ? "text-right"
                              : "text-left"
                          }`}
                        >
                          {message.name}
                        </span>
                      )}

                      <div
                        className={`flex flex-row gap-1 ${
                          message.userId === userData.user.id
                            ? "flex-row-reverse"
                            : ""
                        }`}
                      >
                        <div
                          className={`rounded-[7px] px-3 py-2 max-w-[950%]`}
                          style={{ backgroundColor: message.bgColor }}
                        >
                          <p className="font-normal text-black text-sm break-words whitespace-pre-wrap">
                            {!message.deletedAt
                              ? message.message
                              : "삭제된 메시지 입니다."}
                          </p>
                        </div>
                        <div
                          className={`flex flex-row gap-1 mx-1 ${
                            message.userId === userData.user.id
                              ? "flex-row-reverse"
                              : ""
                          }`}
                        >
                          <span
                            className={`font-normal text-[#adadad] text-xs self-center`}
                          >
                            {message.createdAt.toLocaleString().split(" ")[1]}
                          </span>
                          {message.userId === userData.user.id &&
                            !message.deletedAt && (
                              <X
                                className="font-normal text-[#8a8a8a] text-xs self-center text-red-500 hover:text-red-700 cursor-pointer"
                                size={14}
                                onClick={() =>
                                  message.messageId
                                    ? deleteMessage(message.messageId)
                                    : null
                                }
                              />
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Message Input Area */}
        <div className="w-full h-[120px] bottom-0 left-0 flex pt-[4px] px-[4px] pb-[20px] border-t border-solid border-[#e2e2e2]">
          <div className="relative w-full mx-auto bg-white border border-solid border-[#e2e2e2] flex ">
            <textarea
              ref={textareaRef}
              className="h-full w-full border-none focus-visible:ring-0 font-normal text-[#000000] placeholder:text-[#8b8b8b] text-sm pl-[13px] pt-2.5 focus:outline-none"
              placeholder="여기에 텍스트를 입력합니다..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              onKeyUp={handleEnter}
            />
            <div className="absolute bottom-1 right-[110px] font-normal text-[#8a8a8a] text-[10px]">
              {messageLength}/500
            </div>
            <Button
              className="w-20 h-full absolute right-0 bg-[#6d60bc] hover:bg-[#5d51a9] font-bold rounded-none"
              onClick={() => send(message)}
            >
              Enter
            </Button>
          </div>

          <span
            className="text-xs text-[#8a8a8a] absolute bottom-1 left-2"
            style={{ fontSize: "10px" }}
          >
            - Last updated: 2025.05.30
          </span>
        </div>
      </div>
    </div>
  );
};
