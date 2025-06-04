import { Settings, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import SeparatorLine from "@components/separatorLine/SeparatorLine";
import { DEFAULT_USER_IMAGES } from "@data/default";
import { User } from "global-types";

interface SettingProps {
  newName: string;
  setNewName: (name: string) => void;
  onUpdateName: (name: string) => void;
  users: Array<User>;
  onUpdateImage: (image: string) => void;
}

export default function Setting(props: SettingProps) {
  const { newName, setNewName, onUpdateName, users, onUpdateImage } = props;
  const [isOpen, setIsOpen] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const settingRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
    if (!isOpen) {
      setNewName("");
      setSelectedImage(null);
    }
  }, [isOpen]);

  return (
    <>
      <div
        className="absolute left-[10px] top-[10px] text-white font-bold text-2xl cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <Settings className="w-6 h-6" />
      </div>
      {isOpen && (
        <div className="absolute left-0 top-0 min-w-[150px] w-full h-[100vh] flex flex-col gap-10 bg-black/50 z-20">
          <div
            ref={settingRef}
            className="h-full max-w-[220px] bg-white border-r border-solid border-[#e2e2e2]"
          >
            <div className="text-md font-bold flex items-center justify-between bg-[#6d5fbb] px-4 h-[45px]">
              <h1 className="text-white text-md font-bold">설정</h1>
              <X
                className="self-center text-white hover:text-white cursor-pointer hover:opacity-100  "
                size={18}
                onClick={() => {
                  setIsOpen(false);
                }}
              />
            </div>

            <div className="flex flex-col gap-2 p-4 ">
              <input
                ref={nameInputRef}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                type="text"
                className="w-full h-[30px] bg-[#ffffff] rounded-sm text-xs font-bold border border-solid border-[#e2e2e2] pl-2 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onUpdateName(newName);
                  }
                }}
              />
              <button
                className="w-full h-[25px] bg-[#6d60bc] hover:bg-[#5d51a9] rounded-sm text-xs font-bold text-white"
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

              <SeparatorLine />

              <div className="flex flex-wrap gap-2 ">
                {DEFAULT_USER_IMAGES.map((image, index) => {
                  const isSelected = selectedImage === image;
                  const isDisabled = users.some((user) =>
                    user.image.includes(image)
                  );
                  const user = users.find((user) => user.image.includes(image));
                  return (
                    <div className="relative flex items-center justify-center">
                      {user && (
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                          <span className="text-xs font-bold text-[#6d60bc]">
                            {user.name.length > 3
                              ? user.name.slice(0, 2) + "..."
                              : user.name}
                          </span>
                        </div>
                      )}
                      <img
                        key={index}
                        src={image}
                        alt={`default-icon-${index}`}
                        className={
                          "w-[40px] h-[40px] rounded-full" +
                          (isDisabled
                            ? " opacity-20 cursor-default"
                            : " cursor-pointer") +
                          (isSelected
                            ? " border-2 border-solid border-[#6d60bc]"
                            : "")
                        }
                        onClick={() => {
                          if (isDisabled) return;
                          setSelectedImage(image);
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              <button
                className="w-full h-[25px] mt-1 bg-[#6d60bc] hover:bg-[#5d51a9] rounded-sm text-xs font-bold text-white cursor-pointer"
                disabled={!selectedImage}
                onClick={() => {
                  if (selectedImage) {
                    onUpdateImage(selectedImage);
                  }
                }}
              >
                내 프로필 이미지 바꾸기
              </button>

              <SeparatorLine />

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
        </div>
      )}
    </>
  );
}
