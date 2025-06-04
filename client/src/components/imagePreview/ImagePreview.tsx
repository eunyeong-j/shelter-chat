import { X } from "lucide-react";

export default function ImagePreview(props: {
  showPreview: boolean;
  setShowPreview: (showPreview: boolean) => void;
  previewImageUrl: string;
}) {
  const { showPreview, setShowPreview, previewImageUrl } = props;

  if (!showPreview) return null;
  return (
    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black/50 z-20">
      <X
        className="absolute top-[40px] right-[40px] font-normal text-xs self-center text-red-500 hover:text-red-700 cursor-pointer hover:opacity-100  bg-white rounded-full"
        size={70}
        onClick={() => {
          setShowPreview(false);
        }}
      />
      <img
        src={previewImageUrl}
        alt="message"
        className={`h-auto max-w-[60vw] max-h-[70vh] object-contain cursor-default border border-solid border-[#d9d9d9] p-0 select-none`}
        draggable={false}
      />
    </div>
  );
}
