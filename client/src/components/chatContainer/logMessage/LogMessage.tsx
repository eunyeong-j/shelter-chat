import { Message } from "global-types";

export default function LogMessage(props: { message: Message; index: number }) {
  const { message, index } = props;
  return (
    <div key={`log-${message.id}-${index}`} className="relative">
      <p className="w-full font-normal text-[#8a8a8a] text-xs text-center font-sans tracking-[0] leading-[normal] my-[20px] flex items-center justify-center select-none">
        ({message.createdAt.toLocaleString()}) {message.message}
      </p>
    </div>
  );
}
