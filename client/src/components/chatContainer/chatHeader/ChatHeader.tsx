import { User } from "global-types";
import Setting from "@components/setting/Setting";
import ChatTitle from "../chatTitle/ChatTitle";
import Users from "@components/users/Users";

type ChatHeaderProps = {
  users: User[];
  isUsersLoading: boolean;
  newName: string;
  setNewName: (name: string) => void;
  onUpdateName: (newName: string) => void;
  onUpdateImage: (newImage: string) => void;
};

export default function ChatHeader(props: ChatHeaderProps) {
  const {
    users,
    isUsersLoading,
    newName,
    setNewName,
    onUpdateName,
    onUpdateImage,
  } = props;

  return (
    <header className="absolute w-full h-[45px] top-0 left-0 bg-[#6d5fbb] shadow-[0px_4px_4px_#a3a3a340] flex items-center z-10">
      <ChatTitle title="직딩 임시 대피소" />
      <Setting
        users={users}
        newName={newName}
        setNewName={setNewName}
        onUpdateName={onUpdateName}
        onUpdateImage={onUpdateImage}
      />
      <Users users={users} isUsersLoading={isUsersLoading} />
    </header>
  );
}
