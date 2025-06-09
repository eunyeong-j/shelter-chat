import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { BackgroundVideo } from "@components/backgroundVideo/BackgroundVideo";
import { websocketService } from "@lib/websocket";
import {
  useDeleteMessage,
  useCheckUser,
  useUsers,
  useMessages,
  useSendMessage,
  useUpdateUserName,
  useUpdateUserImage,
  useAddReaction,
  useRequestAccess,
  useAccessRequests,
} from "@lib/api";
import ChatTextarea from "@components/chatTextarea/ChatTextarea";
import ImagePreview from "@components/imagePreview/ImagePreview";
import GoToLatestButton from "@components/goToLatestButton/GoToLatestButton";
import LastUpdatedVersion from "@components/lastUpdatedVersion/LastUpdatedVersion";
import ChatContainer from "@components/chatContainer/ChatContainer";
import RequestAccess from "./RequestAccess";
import AdminScreen from "./AdminScreen";

export default function Screen() {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [newName, setNewName] = useState("");

  // Messages
  const [messagesLength, setMessagesLength] = useState<number>(0);
  const [showLatestButton, setShowLatestButton] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string>("");
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<Blob | null>(null);

  const [openAdminScreen, setOpenAdminScreen] = useState<boolean>(true);

  const {
    data: userData,
    isLoading: isIpLoading,
    isError: isIpError,
    refetch: refetchUser,
  } = useCheckUser();

  const isAllowed = useMemo(() => {
    return userData?.allowed ? true : false;
  }, [userData]);

  const {
    data: users = [],
    isLoading: isUsersLoading,
    isError: isUsersError,
    refetch: refetchUsers,
  } = useUsers(isAllowed);

  const {
    data: messages = [],
    isLoading: isMessagesLoading,
    isError: isMessagesError,
    refetch: refetchMessages,
  } = useMessages(isAllowed);

  const { data: accessRequests = [] } = useAccessRequests();

  const { mutate: requestAccess } = useRequestAccess();
  const { mutate: sendMessage } = useSendMessage();
  const { mutate: updateUserName } = useUpdateUserName();
  const { mutate: deleteMessage } = useDeleteMessage();
  const { mutate: updateUserImage } = useUpdateUserImage();
  const { mutate: addReaction } = useAddReaction();

  const isServerError = useMemo(() => {
    return isUsersError || isMessagesError || isIpError;
  }, [isUsersError, isMessagesError, isIpError]);

  const goToLatestMessage = (behavior: "smooth" | "instant") => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: behavior,
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
    websocketService.subscribe("ACCESS_REQUEST_UPDATE", () => {
      refetchUser();
    });

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
        goToLatestMessage("instant");
      }
    }
  }, [messages]);

  const handleEnter = (text: string) => {
    const formData = new FormData();
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
      <div className="flex items-center justify-center h-screen text-white">
        서버 오류가 발생했습니다. T.T 관리자에게 문의주세요.
      </div>
    );
  }

  if (isIpLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        허용된 사용자인지 확인중...
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (!isIpLoading && !userData?.allowed) {
    return <RequestAccess userData={userData} requestAccess={requestAccess} />;
  }

  return (
    <>
      {userData?.user?.isAdmin === "Y" && (
        <>
          {openAdminScreen ? (
            <AdminScreen
              accessRequests={accessRequests}
              closeAdminScreen={() => setOpenAdminScreen(false)}
            />
          ) : (
            <div className="absolute right-5 bottom-5 z-10">
              <button
                type="button"
                onClick={() => setOpenAdminScreen(true)}
                className="py-2 px-4 bg-blue-500 text-white rounded-md"
              >
                Open Admin Page
              </button>
            </div>
          )}
        </>
      )}
      <div className="relative max-w-[600px] w-full mx-auto h-full bg-[#f8f8f8] flex flex-row justify-center w-full overflow-hidden">
        <BackgroundVideo />

        <ImagePreview
          showPreview={showPreview}
          setShowPreview={setShowPreview}
          previewImageUrl={previewImageUrl}
        />

        <div className="w-full h-[100vh] pt-[46px] pb-[150px] relative">
          {/* Main Chat Container */}
          <ChatContainer
            messages={messages}
            isMessagesLoading={isMessagesLoading}
            users={users}
            isUsersLoading={isUsersLoading}
            setPreviewImageUrl={setPreviewImageUrl}
            setShowPreview={setShowPreview}
            deleteMessage={deleteMessage}
            chatContainerRef={chatContainerRef}
            onScroll={handleScroll}
            newName={newName}
            setNewName={setNewName}
            onUpdateName={(newName) => {
              updateUserName({
                oldName: userData.user.name,
                newName: newName,
              });
              setNewName("");
            }}
            onUpdateImage={(newImage) => {
              updateUserImage({
                image: newImage,
              });
            }}
            onReaction={(messageId, type) => {
              addReaction({
                messageId: messageId,
                type: type,
              });
            }}
          />

          {/* Message Input Area */}
          <GoToLatestButton
            showLatestButton={showLatestButton}
            goToLatestMessage={() => goToLatestMessage("smooth")}
          />
          <div className="w-full h-[120px] left-0 flex px-[4px] pt-[30px] border-t border-solid border-[#e2e2e2] ">
            <ChatTextarea
              onEnter={handleEnter}
              image={image}
              setImage={setImage}
              imageFile={imageFile}
              setImageFile={setImageFile}
              onEmojiClick={handleEmojiClick}
            />
            <LastUpdatedVersion />
          </div>
        </div>
      </div>
    </>
  );
}
