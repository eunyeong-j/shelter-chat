import { Message } from "global-types";

type LogMessageProps = {
  message: Message;
};

export default function LogMessage(props: LogMessageProps) {
  const { message } = props;
  return (
    <div className="relative">
      <p className="w-full font-normal text-[#8a8a8a] text-xs text-center font-sans tracking-[0] leading-[normal] my-[20px] flex items-center justify-center select-none">
        ({message.createdAt.toLocaleString()}) {message.message}
      </p>
    </div>
  );
}
