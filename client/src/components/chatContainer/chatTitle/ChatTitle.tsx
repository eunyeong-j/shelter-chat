interface ChatTitleProps {
  title: string;
}

export default function ChatTitle(props: ChatTitleProps) {
  const { title } = props;
  return <h1 className="ml-[45px] font-bold text-white text-lg ">{title}</h1>;
}
