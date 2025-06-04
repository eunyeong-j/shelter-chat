import { Image, Laugh, Smile } from "lucide-react";
import { useState } from "react";
import { EMOJI_LIST } from "@data/default";

type ChatTextareaBarProps = {
  onEmojiClick: (emoji: string) => void;
  onImageUpload: () => void;
};

export default function ChatTextareaBar(props: ChatTextareaBarProps) {
  const { onEmojiClick, onImageUpload } = props;
  const [isEmojiListOpen, setIsEmojiListOpen] = useState(false);

  return (
    <div className="absolute left-2 bottom-[126px] w-full h-[20px] flex gap-2">
      {/* Image Upload */}
      <div className="w-auto h-full flex items-center justify-center">
        <Image
          className="w-[20px] h-[20px] cursor-pointer"
          onClick={onImageUpload}
        />
      </div>

      {/* Emoji List */}
      {!isEmojiListOpen ? (
        <Smile
          className="w-[20px] h-[20px] cursor-pointer"
          onClick={() => setIsEmojiListOpen(true)}
        />
      ) : (
        <>
          <Laugh
            className="w-[20px] h-[20px] cursor-pointer"
            onClick={() => setIsEmojiListOpen(false)}
          />
          {EMOJI_LIST.map((emoji, index) => (
            <img
              key={`${emoji}-${index}`}
              src={emoji}
              className="w-[22px] h-[22px] cursor-pointer select-none"
              onClick={() => onEmojiClick(emoji)}
              draggable={false}
            />
          ))}
        </>
      )}
    </div>
  );
}
