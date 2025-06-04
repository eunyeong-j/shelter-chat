import { X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1MB

type ChatTextareaProps = {
  onEnter: (message: string) => void;
  image: string | null;
  setImage: (image: string | null) => void;
  imageFile: Blob | null;
  setImageFile: (image: Blob | null) => void;
};

export default function ChatTextarea(props: ChatTextareaProps) {
  const { onEnter, image, setImage, imageFile, setImageFile } = props;
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
        const blob = item.getAsFile();
        if (blob) {
          const imageUrl = URL.createObjectURL(blob);
          const imageBlob = new Blob([blob], { type: blob.type });

          // Check if image size exceeds 5MB (5 * 1024 * 1024 bytes)
          if (blob.size > MAX_IMAGE_SIZE) {
            console.error("이미지 크기는 1MB를 초과할 수 없습니다.");
            return;
          }

          setImage(imageUrl);
          setImageFile(imageBlob);
        }

        // 여기서 서버 업로드하거나 FormData로 처리 가능
        break;
      }
    }
  };

  return (
    <div id="chat-textarea-container" className="relative w-full h-full">
      {image && (
        <div className="absolute top-[-6.5rem] left-1 font-normal text-[#8a8a8a] text-[10px] p-1 bg-white border border-solid border-[#e2e2e2] rounded-md shadow-sm">
          <div className="relative">
            <X
              className="absolute top-[3px] right-[3px] font-normal text-xs self-center text-red-500 hover:text-red-700 cursor-pointer hover:opacity-100  bg-white rounded-full"
              size={14}
              onClick={() => {
                setImage(null);
                setImageFile(null);
                textareaRef.current?.focus();
              }}
            />
            <img src={image} alt="pasted" className="w-[60px] h-[60px]" />
          </div>
        </div>
      )}
      <div className="relative w-full h-full mx-auto bg-white border border-solid border-[#e2e2e2] flex ">
        <textarea
          ref={textareaRef}
          id="chat-textarea"
          className="h-full w-full border-none focus-visible:ring-0 font-normal text-[#000000] placeholder:text-[#8b8b8b] text-sm pl-[13px] pt-2.5 focus:outline-none"
          // placeholder="Input your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={500}
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
          }}
          onPaste={handlePaste}
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
  );
}
