import { X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import ChatTextareaBar from "./ChatTextareaBar";

const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1MB

type ChatTextareaProps = {
  onEnter: (message: string) => void;
  image: string | null;
  setImage: (image: string | null) => void;
  imageFile: Blob | null;
  setImageFile: (image: Blob | null) => void;
  onEmojiClick: (emoji: string) => void;
};

export default function ChatTextarea(props: ChatTextareaProps) {
  const { onEnter, image, setImage, imageFile, setImageFile, onEmojiClick } =
    props;
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [messageLength, setMessageLength] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setMessageLength(message.length);
  }, [message]);

  useEffect(() => {
    setMessageLength(message.length);
  }, [message]);

  const submitMessage = (text: string) => {
    onEnter(text);

    // Init message
    setMessage("");
    (textareaRef.current as HTMLTextAreaElement).value = "";
    setImage(null);
    setImageFile(null);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.indexOf("image") === 0) {
        const file = item.getAsFile();
        if (file) {
          uploadImage(file);
        }
        break;
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  const uploadImage = (file: Blob) => {
    const imageUrl = URL.createObjectURL(file);
    const imageBlob = new Blob([file], { type: file.type });

    // Check if image size exceeds 5MB (5 * 1024 * 1024 bytes)
    if (file.size > MAX_IMAGE_SIZE) {
      console.error("이미지 크기는 1MB를 초과할 수 없습니다.");
      return;
    }

    setImage(imageUrl);
    setImageFile(imageBlob);
  };

  return (
    <>
      <ChatTextareaBar
        onImageUpload={() => imageInputRef.current?.click()}
        onEmojiClick={onEmojiClick}
      />
      <div id="chat-textarea-container" className="relative w-full h-full">
        {image && (
          <div className="absolute top-[-6.5rem] left-1 font-normal text-[#8a8a8a] text-[10px] p-1 bg-white border border-solid border-[#e2e2e2] rounded-md shadow-sm">
            <div className="relative">
              <X
                className="absolute top-[3px] right-[3px] font-normal text-xs self-center text-red-500 hover:text-red-700 cursor-pointer hover:opacity-100 bg-white rounded-full"
                size={14}
                onClick={() => {
                  setImage(null);
                  setImageFile(null);
                  textareaRef.current?.focus();
                }}
              />
              <img
                src={image}
                alt="pasted"
                className="w-[60px] h-[60px] object-contain rounded-md select-none"
                draggable={false}
              />
            </div>
          </div>
        )}

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="absolute bottom-0 left-0 w-full h-full opacity-100"
          onChange={handleImageUpload}
        />

        <div className="relative w-full h-full mx-auto bg-white border border-solid border-[#e2e2e2] flex ">
          <textarea
            ref={textareaRef}
            id="chat-textarea"
            className="h-full w-full border-none focus-visible:ring-0 font-normal text-[#000000] placeholder:text-[#8b8b8b] text-sm pl-[13px] pt-2.5 focus:outline-none"
            value={message}
            maxLength={500}
            onChange={(e) => setMessage(e.target.value)}
            onPaste={handlePaste}
            onKeyUp={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
              const text = (e.target as HTMLTextAreaElement).value.trim();
              if (
                (e.key === "Enter" && !e.shiftKey && text !== "") ||
                (e.key === "Enter" && !e.shiftKey && imageFile)
              ) {
                e.preventDefault();
                e.stopPropagation();

                submitMessage(text);
              }
              // TODO 중간에 엔터 치면 적용 되는 버그 픽스 필요
            }}
          />

          <div className="absolute bottom-1 right-[110px] font-normal text-[#8a8a8a] text-[10px]">
            {messageLength}/500
          </div>
          <button
            className="w-20 h-full absolute right-0 bg-[#6d60bc] hover:bg-[#5d51a9] font-bold rounded-none text-white"
            onClick={() => {
              if (message.length === 0 && !imageFile) {
                return;
              }
              submitMessage(message);
            }}
          >
            Enter
          </button>
        </div>
      </div>
    </>
  );
}
