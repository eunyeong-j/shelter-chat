import { DEFAULT_REACTION_LIST } from "@data/default";
import { useEffect, useState, useRef } from "react";

type ChatReactionProps = {
  isReactionOpen: boolean;
  setIsReactionOpen: (isReactionOpen: boolean) => void;
  reactionTargetId: number | null;
  onReactionClick: (type: string) => void;
};

export default function ChatReaction(props: ChatReactionProps) {
  const {
    isReactionOpen,
    setIsReactionOpen,
    reactionTargetId,
    onReactionClick,
  } = props;
  const reactionRef = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState<number>(0);
  const [left, setLeft] = useState<number>(0);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        reactionRef.current &&
        !reactionRef.current.contains(event.target as Node)
      ) {
        setIsReactionOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (reactionTargetId) {
      const targetElement = document.querySelector(
        `.message-content-text-container-inner[data-message-id="${reactionTargetId}"]`
      );
      if (targetElement) {
        const { top, left, height } = targetElement.getBoundingClientRect();
        setTop(top + height);
        setLeft(left);
      }
    }
  }, [reactionTargetId]);

  return (
    <div
      ref={reactionRef}
      className={`chat-reaction absolute top-0 left-0 transition-opacity duration-300 z-20 shadow-md ${
        isReactionOpen ? "opacity-100" : "opacity-0"
      }`}
      style={{ top: `${top}px`, left: `${left}px` }}
      onMouseLeave={() => setIsReactionOpen(false)}
    >
      <div className="chat-reaction-icon flex flex-row gap-2 bg-gray-50 rounded-md py-1 px-2">
        {DEFAULT_REACTION_LIST.map((reaction, index) => (
          <img
            key={index}
            src={reaction.src}
            alt={reaction.alt}
            width={18}
            height={18}
            className="cursor-pointer hover:scale-110 transition-all duration-300"
            onClick={() => onReactionClick(reaction.type)}
          />
        ))}
      </div>
    </div>
  );
}
