import { UserMessage, User } from "global-types";
import { DEFAULT_REACTION_LIST } from "@data/default";
import { X } from "lucide-react";
import LogMessage from "./logMessage/LogMessage";
import DateMessage from "./dateMessage/DateMessage";
import NoHistory from "./noHistory/NoHistory";
import ChatReaction from "./chatReaction/ChatReaction";
import { useState } from "react";
import ChatHeader from "./chatHeader/ChatHeader";

import "./ChatContainer.scss";

type ChatContainerProps = {
  chatContainerRef: React.RefObject<HTMLDivElement>;
  onScroll: () => void;
  newName: string;
  setNewName: (name: string) => void;
  onUpdateName: (newName: string) => void;
  onUpdateImage: (newImage: string) => void;
  onReaction: (messageId: number, type: string) => void;
  messages: Array<UserMessage>;
  isMessagesLoading: boolean;
  users: Array<User>;
  isUsersLoading: boolean;
  setPreviewImageUrl: (image: string) => void;
  setShowPreview: (preview: boolean) => void;
  deleteMessage: (messageId: number) => void;
};
export default function ChatContainer(props: ChatContainerProps) {
  const {
    chatContainerRef,
    onScroll,
    newName,
    setNewName,
    onUpdateName,
    onUpdateImage,
    onReaction,
    messages,
    isMessagesLoading,
    users,
    isUsersLoading,
    setPreviewImageUrl,
    setShowPreview,
    deleteMessage,
  } = props;

  const [isReactionOpen, setIsReactionOpen] = useState<boolean>(false);
  const [reactionTargetId, setReactionTargetId] = useState<number | null>(null);

  const handleReactionClick = (type: string) => {
    if (reactionTargetId) {
      onReaction(reactionTargetId, type);
    }
  };

  const handleScroll = () => {
    setIsReactionOpen(false);
    setReactionTargetId(null);
    onScroll();
  };

  return (
    <div
      ref={chatContainerRef}
      id="chat-container"
      className="w-full mx-auto h-full top-[0px] left-[190px] bg-white border border-solid border-[#f0f0f0] overflow-y-auto overflow-x-hidden pl-[10px] pr-0 py-[20px] pb-[50px] scrollbar"
      onScroll={handleScroll}
    >
      {/* Header */}
      <ChatHeader
        users={users}
        isUsersLoading={isUsersLoading}
        newName={newName}
        setNewName={setNewName}
        onUpdateName={onUpdateName}
        onUpdateImage={onUpdateImage}
      />

      <NoHistory />

      <ChatReaction
        isReactionOpen={isReactionOpen}
        setIsReactionOpen={setIsReactionOpen}
        reactionTargetId={reactionTargetId}
        onReactionClick={handleReactionClick}
      />

      {/* Chat Messages */}
      {!isMessagesLoading &&
        messages.length > 0 &&
        messages.map((message: UserMessage, index: number) => {
          if (message?.type === "DATE") {
            return <DateMessage key={`date-${index}`} message={message} />;
          }
          if (message?.type === "LOG") {
            return <LogMessage key={`log-${index}`} message={message} />;
          }

          const createdTime = message.createdAt.toLocaleString().split(" ")[1];
          const isDeleted = message.deletedAt !== null;
          const reactions = message.reactions?.split(",");
          const isReaction = reactions && reactions.length > 0;
          const isContinue = message.isContinue;

          return (
            <div
              key={`${message.id}-${index}`}
              className="message-container relative"
              data-message-id={message.messageId}
              data-is-mine={message.isMine}
              data-is-deleted={isDeleted ? "Y" : "N"}
              data-is-reaction={isReaction ? "Y" : "N"}
              data-is-continue={isContinue}
            >
              <div
                className={`message-content-container flex items-start gap-2 mt-4 px-14`}
              >
                {/* 사용자 이미지 */}
                {isContinue === "N" && (
                  <div
                    className={`message-user-image absolute top-[16px] left-[4px] flex`}
                  >
                    <img
                      src={`${message.image}`}
                      alt={message.name}
                      className={`w-[45px] h-[45px] cursor-pointer`}
                      onClick={() => {
                        setPreviewImageUrl(`${message.image}`);
                        setShowPreview(true);
                      }}
                    />
                  </div>
                )}

                {/* 메시지 내용 */}
                <div className={`message-content flex flex-col gap-1`}>
                  {isContinue === "N" && (
                    <span
                      className={`message-user-name text-xs font-bold text-[#595959] text-left`}
                    >
                      {message.name}
                    </span>
                  )}

                  <div
                    className={`message-content-text-container flex flex-row gap-1 items-end relative`}
                  >
                    <div
                      className={`message-content-text-container-inner relative rounded-[7px] px-3 py-2 max-w-[80%]`}
                      style={{ backgroundColor: message.bgColor }}
                      data-message-id={message.messageId}
                      data-is-mine={message.isMine}
                    >
                      {/* 사용자 반응 */}
                      {message.reactions && (
                        <div className="message-content-reactions absolute w-max bottom-[-22px] left-[5px] flex gap-2">
                          {reactions?.map((reaction) => {
                            const [type, count, isMine] = reaction.split(":");
                            const isMineReaction =
                              isMine === "isMine" ? "Y" : "N";
                            const reactionIcon = DEFAULT_REACTION_LIST.find(
                              (reaction) => reaction.type === type
                            );
                            if (!reactionIcon) {
                              return null;
                            }
                            return (
                              <div
                                key={`${message.id}-${index}-${reaction}`}
                                className="message-reaction-icon-container relative cursor-pointer hover:scale-110 transition-all duration-300"
                                onClick={() => handleReactionClick(type)}
                                data-reaction-is-mine={isMineReaction}
                              >
                                <div className="message-reaction-icon">
                                  <img
                                    src={reactionIcon?.src}
                                    alt={reactionIcon?.alt}
                                    className="w-4 h-4"
                                  />
                                </div>
                                <div className="message-reaction-count absolute top-[-3px] right-[-3px] bg-red-400 text-white text-[9px] rounded-full w-3 h-3 flex items-center justify-center">
                                  {count}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div
                        className={`message-content-text font-normal text-black text-sm break-words whitespace-pre-wrap`}
                        onMouseEnter={() => {
                          setIsReactionOpen(true);
                          setReactionTargetId(message?.messageId ?? null);
                        }}
                      >
                        {!isDeleted ? (
                          <>
                            {message.imageFile && (
                              <div
                                className={`message-content-image w-full flex mb-2 justify-start`}
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

                    {/* 메시지 시간 및 삭제 버튼 */}
                    <div
                      className={`message-details flex flex-row gap-1 mx-1 `}
                    >
                      <span
                        className={`font-normal text-[#adadad] text-xs self-center pb-1 select-none`}
                      >
                        {createdTime}
                      </span>
                      {message.isMine === "Y" && !isDeleted && (
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
