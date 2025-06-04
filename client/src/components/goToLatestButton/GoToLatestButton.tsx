type GoToLatestButtonProps = {
  showLatestButton: boolean;
  goToLatestMessage: (behavior: "smooth" | "instant") => void;
};

export default function GoToLatestButton(props: GoToLatestButtonProps) {
  const { showLatestButton, goToLatestMessage } = props;
  return (
    <div
      className={`absolute left-0 bottom-[160px] w-full text-white text-xs font-bold rounded-md text-center ${
        showLatestButton ? "" : "pointer-events-none"
      }`}
    >
      {showLatestButton && (
        <div
          className={`w-auto h-full mx-auto text-[#6d5fbb] text-xs font-bold py-[5px] px-3 bg-white border border-solid border-[#6d5fbb] inline-flex items-center justify-center rounded-[50px] cursor-pointer z-10`}
          onClick={() => goToLatestMessage("smooth")}
        >
          최신 메세지로 가기
        </div>
      )}
    </div>
  );
}
