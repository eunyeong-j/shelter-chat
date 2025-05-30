import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Loader2, UsersRound } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { User } from "../../@types/global";

export const Users = () => {
  const [isOpen, setIsOpen] = useState(false);
  const usersListRef = useRef<HTMLDivElement>(null);
  const usersButtonRef = useRef<HTMLDivElement>(null);

  const {
    data: users = [],
    isLoading: isUsersLoading,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axios.get("http://192.168.0.126:5050/users");
      return res.data;
    },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      refetchUsers();
      return () => clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        usersListRef.current &&
        !usersListRef.current.contains(event.target as Node) &&
        usersButtonRef.current &&
        !usersButtonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div
        ref={usersButtonRef}
        className="absolute right-[20px] top-[10px] text-white font-bold text-2xl cursor-pointer z-10"
        onClick={() => setIsOpen(!isOpen)}
      >
        <UsersRound className="w-6 h-6" />
      </div>

      {isOpen && (
        <div
          ref={usersListRef}
          id="users-list"
          className="absolute right-[20px] top-[50px] flex flex-col gap-1 bg-white rounded-md py-2 px-2 min-w-[200px] max-w-[60vw] border border-solid border-[#e2e2e2]"
        >
          {isUsersLoading && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-10 h-10 animate-spin" />
            </div>
          )}
          {!isUsersLoading &&
            users.length > 0 &&
            users.map((user: User, index: number) => (
              <div
                key={`${user.id}-${index}`}
                className="flex items-center mb-1 gap-3"
              >
                <Avatar className="w-[45px] h-[45px] select-none">
                  <AvatarImage src={user.image} alt={user.name} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <span
                  className={` font-normal text-black text-sm w-max cursor-default`}
                >
                  {user.name}
                </span>
              </div>
            ))}
        </div>
      )}
    </>
  );
};
