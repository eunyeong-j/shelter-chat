import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, X } from "lucide-react";
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
} from "../../lib/api";
import ChatTextarea from "./ChatTextarea";
import ImagePreview from "./ImagePreview";
import ChatTextareaBar from "./ChatTextareaBar";

export const Screen = (): JSX.Element => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [newName, setNewName] = useState("");

  // 스크롤 최적화를 위해 임시로 사용, 추후 isRead 적용 후 삭제 예정
  const [messagesLength, setMessagesLength] = useState(0);
  const [showLatestButton, setShowLatestButton] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<Blob | null>(null);

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
  const { mutate: deleteMessage } = useDeleteMessage();

  const isServerError = useMemo(() => {
    return isUsersError || isMessagesError || isIpError;
  }, [isUsersError, isMessagesError, isIpError]);

  const goToLatestMessage = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const currentScreenHeight = chatContainerRef.current?.clientHeight;
      const isScrollAtBottom =
        chatContainerRef.current.scrollHeight -
          chatContainerRef.current.scrollTop -
          currentScreenHeight <
        currentScreenHeight;
      setShowLatestButton(!isScrollAtBottom);
    }
  };

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
    if (messages.length > 0) {
      setMessagesLength(messages.length);

      if (messagesLength < messages.length) {
        goToLatestMessage();
      }
    }
  }, [messages]);

  const handleEnter = (text: string) => {
    const formData = new FormData();

    formData.append("userId", userData.user.id);
    formData.append("message", text);
    formData.append("createdAt", new Date().toISOString());
    if (imageFile) {
      formData.append("file", imageFile);
    }
    sendMessage(formData);
  };

  const handleEmojiClick = (emojiUrl: string) => {
    fetch(emojiUrl).then((res) => {
      res.blob().then((blob) => {
        if (blob) {
          setImage(emojiUrl);
          setImageFile(blob);
        }
      });
    });
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
    <div className="relative max-w-[720px] w-full mx-auto bg-[#f8f8f8] flex flex-row justify-center w-full overflow-hidden">
      <BackgroundVideo />

      <ImagePreview
        showPreview={showPreview}
        setShowPreview={setShowPreview}
        previewImageUrl={previewImageUrl}
      />

      <div className="w-full h-[100vh] pt-[46px] pb-[150px] relative">
        {/* Main Chat Container */}
        <div
          ref={chatContainerRef}
          id="chat-container"
          className="w-full mx-auto h-full top-[0px] left-[190px] bg-white border border-solid border-[#f0f0f0] overflow-y-auto overflow-x-hidden py-[20px] scrollbar px-0"
          onScroll={handleScroll}
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
              onNameChange={setNewName}
              onUpdateName={() => {
                updateUserName({
                  userId: userData.user.id,
                  oldName: userData.user.name,
                  newName: newName,
                });
                setNewName("");
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
                    <div className="w-full h-px absolute top-6 shrink-0 bg-border" />
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
                    className={`flex items-start gap-2 mx-4 ${
                      isContinueMessage ? "mt-2" : "mt-4"
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
                        <div
                          className={`w-[45px] h-[45px]  ${
                            isContinueMessage ? "my-0" : "mt-[14px]"
                          }`}
                        >
                          <img src={message.image} alt={message.name} />
                        </div>
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
                        className={`flex flex-row gap-1 items-end ${
                          message.userId === userData.user.id
                            ? "flex-row-reverse"
                            : ""
                        }`}
                      >
                        <div
                          className={`rounded-[7px] px-3 py-2 max-w-[950%]`}
                          style={{ backgroundColor: message.bgColor }}
                        >
                          <div
                            className={`font-normal text-black text-sm break-words whitespace-pre-wrap ${
                              message.deletedAt ? "opacity-40" : ""
                            }`}
                          >
                            {!message.deletedAt ? (
                              <>
                                {message.imageFile && (
                                  <div
                                    className={`w-full flex mb-2 ${
                                      message.userId === userData.user.id
                                        ? "justify-end"
                                        : "justify-start"
                                    }`}
                                  >
                                    <img
                                      src={`data:image/jpeg;base64,${message.imageFile}`}
                                      alt="message"
                                      className={`w-[80px] h-[80px] cursor-pointer`}
                                      onClick={() => {
                                        setPreviewImageUrl(
                                          `data:image/jpeg;base64,${message.imageFile}`
                                        );
                                        setShowPreview(true);
                                      }}
                                    />
                                  </div>
                                )}
                                {message.message}
                              </>
                            ) : (
                              "삭제된 메시지 입니다."
                            )}
                          </div>
                        </div>
                        <div
                          className={`flex flex-row gap-1 mx-1 ${
                            message.userId === userData.user.id
                              ? "flex-row-reverse"
                              : ""
                          }`}
                        >
                          <span
                            className={`font-normal text-[#adadad] text-xs self-center pb-1 select-none`}
                          >
                            {message.createdAt.toLocaleString().split(" ")[1]}
                          </span>
                          {message.userId === userData.user.id &&
                            !message.deletedAt && (
                              <X
                                className="font-normal text-xs self-center text-red-500 hover:text-red-700 cursor-pointer opacity-30 hover:opacity-100 transition-all duration-300"
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
        <div className="w-full h-[120px] left-0 flex px-[4px] pt-[30px] border-t border-solid border-[#e2e2e2] ">
          <ChatTextareaBar onEmojiClick={handleEmojiClick} />

          <div
            className={`absolute left-0 bottom-[160px] w-full text-white text-xs font-bold rounded-md text-center ${
              showLatestButton ? "" : "pointer-events-none"
            }`}
          >
            {showLatestButton && (
              <div
                className={`w-auto h-full mx-auto text-[#6d5fbb] text-xs font-bold py-[5px] px-3 bg-white border border-solid border-[#6d5fbb] inline-flex items-center justify-center rounded-[50px] cursor-pointer`}
                onClick={goToLatestMessage}
              >
                최신 메세지로 가기
              </div>
            )}
          </div>

          <ChatTextarea
            onEnter={handleEnter}
            image={image}
            setImage={setImage}
            imageFile={imageFile}
            setImageFile={setImageFile}
          />

          <span
            className="text-xs text-[#8a8a8a] absolute bottom-1 left-2"
            style={{ fontSize: "10px" }}
          >
            Last updated: {process.env.VITE_LAST_UPDATED} / version{" "}
            {process.env.VITE_VERSION}
          </span>
        </div>
      </div>
    </div>
  );
};
