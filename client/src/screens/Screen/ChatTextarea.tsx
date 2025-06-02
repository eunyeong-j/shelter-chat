import { useState, useEffect, useRef } from "react";

type ChatTextareaProps = {
  onEnter: (message: string) => void;
};

export default function ChatTextarea(props: ChatTextareaProps) {
  const { onEnter } = props;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [messageLength, setMessageLength] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setMessageLength(message.length);
  }, [message]);

  useEffect(() => {
    setMessageLength(message.length);
  }, [message]);

  const enter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const text = (e.target as HTMLTextAreaElement).value.trim();

    if (text === "") return;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();

      // Send the message
      onEnter(text);

      // Reset the message and textarea value
      initMessage();
    }
  };

  const initMessage = () => {
    setMessage("");
    (textareaRef.current as HTMLTextAreaElement).value = "";
  };

  return (
    <div className="relative w-full mx-auto bg-white border border-solid border-[#e2e2e2] flex ">
      <textarea
        ref={textareaRef}
        className="h-full w-full border-none focus-visible:ring-0 font-normal text-[#000000] placeholder:text-[#8b8b8b] text-sm pl-[13px] pt-2.5 focus:outline-none"
        placeholder="여기에 텍스트를 입력합니다..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={500}
        onKeyUp={enter}
      />
      <div className="absolute bottom-1 right-[110px] font-normal text-[#8a8a8a] text-[10px]">
        {messageLength}/500
      </div>
      <button
        className="w-20 h-full absolute right-0 bg-[#6d60bc] hover:bg-[#5d51a9] font-bold rounded-none text-white"
        onClick={() => {
          if (message.length === 0) {
            return;
          }
          onEnter(message);
          initMessage();
        }}
      >
        Enter
      </button>
    </div>
  );
}
