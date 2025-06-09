import { useApproveAccessRequest } from "@lib/api";
import { AccessRequest } from "global-types";
import { XIcon } from "lucide-react";
import { useState } from "react";

type AdminScreenProps = {
  accessRequests: AccessRequest[];
  closeAdminScreen: () => void;
};

export default function AdminScreen(props: AdminScreenProps) {
  const { accessRequests, closeAdminScreen } = props;
  const [selectedRequests, setSelectedRequests] = useState<number[]>([]);
  const { mutate: approveAccessRequest } = useApproveAccessRequest();

  const handleUpdateAccessRequest = () => {
    selectedRequests.forEach((id) => {
      approveAccessRequest(id);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-black/50 rounded-md absolute top-0 left-0 z-50">
      <div className="flex flex-col gap-2 items-center justify-start bg-white rounded-md p-4 h-[400px] w-[50vw] max-w-[400px] relative">
        <button
          onClick={closeAdminScreen}
          className="flex flex-row gap-2 items-center justify-center bg-blue-500 text-white px-4 py-2 rounded-md absolute top-5 right-5"
        >
          <XIcon className="w-4 h-4" />
        </button>

        <h1 className="text-2xl font-bold">Access Requests</h1>

        <div className="flex flex-col items-center justify-between h-full w-[80%]">
          <div className="flex flex-col gap-2 mt-10 h-full">
            {accessRequests.map((accessRequest: AccessRequest) => (
              <div
                key={accessRequest.id}
                className="flex flex-row gap-4 items-start cursor-pointer overflow-y-auto h-full"
                onClick={() => {
                  setSelectedRequests((prev) => {
                    if (prev.includes(accessRequest.id)) {
                      return prev.filter((id) => id !== accessRequest.id);
                    }
                    return [...prev, accessRequest.id];
                  });
                }}
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 cursor-pointer"
                  checked={selectedRequests.includes(accessRequest.id)}
                />
                <div className="text-sm w-full cursor-pointer">
                  <div>Name: {accessRequest.name}</div>
                  <div>Status: {accessRequest.status}</div>
                  <div>
                    Created At: {accessRequest.createdAt.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}

            <div className="flex flex-row gap-2 items-center justify-center">
              <button
                onClick={handleUpdateAccessRequest}
                className="flex flex-row gap-2 items-center justify-center bg-green-500 text-white px-4 py-2 rounded-md w-full disabled:bg-green-300"
                disabled={selectedRequests.length === 0}
              >
                Approve
              </button>
              <button
                onClick={handleUpdateAccessRequest}
                className="flex flex-row gap-2 items-center justify-center bg-red-500 text-white px-4 py-2 rounded-md w-full disabled:bg-red-300"
                disabled={selectedRequests.length === 0}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
