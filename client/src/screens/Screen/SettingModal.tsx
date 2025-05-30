import { Settings } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useState } from "react";

interface SettingModalProps {
  newName: string;
  newBgColor: string;
  hiddenUserName: boolean;
  onNameChange: (name: string) => void;
  onBgColorChange: (color: string) => void;
  onUpdateName: (name: string) => void;
  onUpdateBgColor: (color: string) => void;
  onToggleNameVisibility: () => void;
}

export const SettingModal = ({
  newName,
  newBgColor,
  hiddenUserName,
  onNameChange,
  onBgColorChange,
  onUpdateName,
  onUpdateBgColor,
  onToggleNameVisibility,
}: SettingModalProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        className="absolute right-[35px] top-[10px] bg-white text-black hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Settings className="w-4 h-4" />
        {/* Hide Names Button */}
      </Button>
      {isOpen && (
        <div className="absolute top-20 left-20 w-[127px] bottom-[80px] right-[25px] flex flex-col gap-2">
          <input
            value={newBgColor}
            onChange={(e) => onBgColorChange(e.target.value)}
            type="text"
            className="w-full h-[30px] bg-[#ffffff] rounded-sm text-xs font-bold border border-solid border-[#e2e2e2] pl-2 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onUpdateBgColor(newBgColor);
              }
            }}
          />
          <Button
            className="w-full h-[42px] bg-[#6d60bc] hover:bg-[#5d51a9] rounded-sm text-xs font-bold"
            onClick={() => {
              if (newBgColor.trim() === "") return;
              onUpdateBgColor(newBgColor);
            }}
          >
            배경색 바꾸기
            <br />
            (only hex)
          </Button>
          <input
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
          <Button
            className="w-full h-[22px] bg-[#6d60bc] hover:bg-[#5d51a9] rounded-sm text-xs font-bold"
            onClick={() => {
              if (newName.trim() === "") return;
              onUpdateName(newName);
            }}
          >
            이름 바꾸기
          </Button>
          <Button
            className="bg-[#6d60bc] hover:bg-[#5d51a9] rounded-sm text-xs font-bold"
            onClick={onToggleNameVisibility}
          >
            {hiddenUserName ? "이름 보이기" : "이름 숨기기"}
          </Button>
        </div>
      )}
    </>
  );
};
