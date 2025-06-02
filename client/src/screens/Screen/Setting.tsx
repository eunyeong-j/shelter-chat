import { Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface SettingProps {
  newName: string;
  onNameChange: (name: string) => void;
  onUpdateName: (name: string) => void;
}

export const Setting = ({
  newName,
  onNameChange,
  onUpdateName,
}: SettingProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const settingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingRef.current &&
        !settingRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      nameInputRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <>
      <div
        className="absolute left-[10px] top-[10px] text-white font-bold text-2xl cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Settings className="w-6 h-6" />
      </div>
      {isOpen && (
        <div
          ref={settingRef}
          className="absolute left-[0px] top-[45px] min-w-[130px] p-4 h-[calc(100vh-45px)] flex flex-col gap-10 bg-white border-r border-solid border-[#e2e2e2]"
        >
          <div className="flex flex-col gap-2">
            <input
              ref={nameInputRef}
              value={newName}
              onChange={(e) => onNameChange(e.target.value)}
              type="text"
              className="w-full h-[30px] bg-[#ffffff] rounded-sm text-xs font-bold border border-solid border-[#e2e2e2] pl-2 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onUpdateName(newName);
                }
              }}
            />
            <button
              className="w-full h-[22px] bg-[#6d60bc] hover:bg-[#5d51a9] rounded-sm text-xs font-bold text-white"
              onClick={() => {
                if (newName.trim() === "") {
                  nameInputRef.current?.focus();
                  return;
                }
                onUpdateName(newName);
              }}
            >
              내 이름 바꾸기
            </button>

            {/* TODO add */}
            {/* <div className="flex flex-col gap-2">
              <h4 className="text-md font-bold">채팅 제목 바꾸기</h4>
              <input
                value={newChatTitle}
                onChange={(e) => handleChatTitleChange(e.target.value)}
                type="text"
                className="w-full h-[30px] bg-[#ffffff] rounded-sm text-xs font-bold border border-solid border-[#e2e2e2] pl-2 focus:outline-none"
              />
              <Button
                className="w-full h-[42px] bg-[#6d60bc] hover:bg-[#5d51a9] rounded-sm text-xs font-bold"
                onClick={() => {
                  if (newChatTitle.trim() === "") return;
                  handleUpdateChatTitle();
                }}
              >
                채팅 제목 바꾸기
              </Button>
            </div> */}
          </div>
        </div>
      )}
    </>
  );
};
