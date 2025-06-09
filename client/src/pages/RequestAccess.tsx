import { UserType } from "global-types";
import { useRef, useState } from "react";

type RequestAccessProps = {
  userData: UserType;
  requestAccess: (name: string) => void;
};

export default function RequestAccess(props: RequestAccessProps) {
  const { requestAccess, userData } = props;
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");

  return (
    <div className="flex items-center justify-center h-[100vh] flex-row md:flex-row flex-col ">
      <div className="text-2xl font-bold bg-black w-full h-full flex items-center justify-center text-white">
        접근이 허용된 사용자가 아닙니다!
      </div>

      <div className="flex flex-col gap-2 p-4 w-full h-full bg-white flex items-center justify-center text-black">
        <div className="flex flex-col gap-2 p-4 max-w-[300px] w-full">
          {userData?.accessRequest?.status === "PENDING" ? (
            <>
              <h4 className="text-lg font-bold">접근을 요청한 상태입니다.</h4>
              <div className="text-sm font-bold">
                관리자가 허용 여부를 확인할 예정입니다.
              </div>
            </>
          ) : (
            <>
              <h4 className="text-lg font-bold">접근 신청 페이지</h4>
              <div className="text-sm font-bold">이름을 입력해주세요.</div>
              <input
                ref={nameInputRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                className="w-full h-[30px] bg-[#ffffff] rounded-sm text-xs font-bold border border-solid border-[#e2e2e2] pl-2 focus:outline-none text-black"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    requestAccess(name);
                  }
                }}
              />
              <button
                className="w-full h-[32px] bg-[#6d60bc] hover:bg-[#5d51a9] rounded-sm text-xs font-bold text-white"
                onClick={() => {
                  requestAccess(name);
                }}
              >
                접근 요청
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
