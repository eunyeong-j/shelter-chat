const EMOJI_LIST = [
  "/emoji/nice.png",
  "/emoji/ho.png",
  "/emoji/sleeping.png",
  "/emoji/no.png",
];

type ChatTextareaBarProps = {
  onEmojiClick: (emoji: string) => void;
};

export default function ChatTextareaBar(props: ChatTextareaBarProps) {
  const { onEmojiClick } = props;

  return (
    <div className="absolute left-2 bottom-[126px] w-full h-[20px] flex gap-2">
      {EMOJI_LIST.map((emoji, index) => (
        <img
          key={`${emoji}-${index}`}
          src={emoji}
          className="w-[22px] h-[22px] cursor-pointer"
          onClick={() => onEmojiClick(emoji)}
        />
      ))}
    </div>
  );
}
