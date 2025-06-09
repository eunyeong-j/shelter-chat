import { Message } from "global-types";

type DateMessageProps = {
  message: Message;
};

export default function DateMessage(props: DateMessageProps) {
  const { message } = props;
  return (
    <div className="relative w-full mx-auto flex flex-col items-center justify-center h-[50px]">
      <div className="bg-white px-3 rounded-[12.5px] border border-solid border-[#d9d9d9] z-[1]">
        <span className="font-normal text-[#8a8a8a] text-xs text-center">
          {message.message}
        </span>
      </div>
      <div className="w-full h-px absolute top-6 shrink-0 bg-border" />
    </div>
  );
}
