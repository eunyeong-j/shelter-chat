import Setting from "@components/setting/Setting";
import { UserMessage, User } from "global-types";
import Users from "@components/users/Users";
import { X } from "lucide-react";

type ChatContainerProps = {
  chatContainerRef: React.RefObject<HTMLDivElement>;
  handleScroll: () => void;
  newName: string;
  setNewName: (name: string) => void;
  onUpdateName: (newName: string) => void;
  onUpdateImage: (newImage: string) => void;
  messages: Array<UserMessage>;
  isMessagesLoading: boolean;
  userId: number;
  users: Array<User>;
  isUsersLoading: boolean;
  setPreviewImageUrl: (image: string) => void;
  setShowPreview: (preview: boolean) => void;
  deleteMessage: (messageId: number) => void;
};
export default function ChatContainer(props: ChatContainerProps) {
  const {
    chatContainerRef,
    handleScroll,
    newName,
    setNewName,
    onUpdateName,
    onUpdateImage,
    messages,
    isMessagesLoading,
    userId,
    users,
    isUsersLoading,
    setPreviewImageUrl,
    setShowPreview,
    deleteMessage,
  } = props;

  return (
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

        <Users users={users} isUsersLoading={isUsersLoading} />

        <Setting
          users={users}
          newName={newName}
          setNewName={setNewName}
          onUpdateName={onUpdateName}
          onUpdateImage={onUpdateImage}
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
                <div className="bg-white px-3 rounded-[12.5px] border border-solid border-[#d9d9d9] z-[1]">
                  <span className="font-normal text-[#8a8a8a] text-xs text-center">
                    {message.message}
                  </span>
                </div>
                <div className="w-full h-px absolute top-6 shrink-0 bg-border" />
              </div>
            );
          }

          if (message?.type === "LOG") {
            return (
              <div key={`log-${message.id}-${index}`} className="relative">
                <p className="w-full font-normal text-[#8a8a8a] text-xs text-center font-sans tracking-[0] leading-[normal] my-[20px] flex items-center justify-center select-none">
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
                  message.userId === userId
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
                      className={`w-[45px] h-[45px] cursor-pointer ${
                        isContinueMessage ? "my-0" : "mt-[14px]"
                      }`}
                    >
                      <img
                        src={`${message.image}`}
                        alt={message.name}
                        onClick={() => {
                          setPreviewImageUrl(`${message.image}`);
                          setShowPreview(true);
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className={`flex flex-col gap-1`}>
                  {!isContinueMessage && (
                    <span
                      className={`text-xs font-bold text-[#595959] ${
                        message.userId === userId ? "text-right" : "text-left"
                      }`}
                    >
                      {message.name}
                    </span>
                  )}

                  <div
                    className={`flex flex-row gap-1 items-end ${
                      message.userId === userId ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`rounded-[7px] px-3 py-2 max-w-[80%]`}
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
                                  message.userId === userId
                                    ? "justify-end"
                                    : "justify-start"
                                }`}
                              >
                                <img
                                  src={`data:image/jpeg;base64,${message.imageFile}`}
                                  alt="message"
                                  className={`w-[80px] h-[80px] cursor-pointer object-contain rounded-md`}
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
                        message.userId === userId ? "flex-row-reverse" : ""
                      }`}
                    >
                      <span
                        className={`font-normal text-[#adadad] text-xs self-center pb-1 select-none`}
                      >
                        {message.createdAt.toLocaleString().split(" ")[1]}
                      </span>
                      {message.userId === userId && !message.deletedAt && (
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
  );
}
