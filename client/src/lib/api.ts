import axios from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";

const API_URL = `http://${process.env.VITE_HOST_IP}:${process.env.VITE_HOST_SERVER_PORT}`;

axios.defaults.withCredentials = true;

// Queries
export const useUsers = (enabled: boolean) => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/users`);
      return res.data;
    },
    staleTime: 60000,
    enabled,
  });
};

export const useMessages = (enabled: boolean) => {
  return useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/messages`);
      return res.data;
    },
    staleTime: 60000,
    enabled,
  });
};

export const useCheckUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/check-user`);
      return res.data;
    },
    staleTime: 60000,
  });
};

// Mutations
export const useSendMessage = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await axios.post(`${API_URL}/message`, formData);
      return res.data;
    },
  });
};

export const useUpdateUserName = () => {
  return useMutation({
    mutationFn: async ({
      oldName,
      newName,
    }: {
      oldName: string;
      newName: string;
    }) => {
      const res = await axios.put(`${API_URL}/user/name`, {
        oldName,
        newName,
      });
      return res.data;
    },
  });
};

export const useUpdateUserImage = () => {
  return useMutation({
    mutationFn: async ({ image }: { image: string }) => {
      const res = await axios.put(`${API_URL}/user/image`, {
        image,
      });
      return res.data;
    },
  });
};

export const useAddReaction = () => {
  return useMutation({
    mutationFn: async ({
      messageId,
      type,
    }: {
      messageId: number;
      type: string;
    }) => {
      const res = await axios.post(`${API_URL}/message/${messageId}/reaction`, {
        type,
      });
      return res.data;
    },
  });
};

export const useUpdateUserBgColor = () => {
  return useMutation({
    mutationFn: async ({ bgColor }: { bgColor: string }) => {
      const res = await axios.put(`${API_URL}/user/bgColor`, {
        bgColor,
      });
      return res.data;
    },
  });
};

export const useDeleteMessage = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await axios.delete(`${API_URL}/message/${id}`);
      return res.data;
    },
  });
};

export const useAccessRequests = () => {
  return useQuery({
    queryKey: ["access-requests"],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/access-requests`);
      return res.data;
    },
    staleTime: 60000,
  });
};

export const useApproveAccessRequest = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await axios.put(`${API_URL}/access-request/${id}`);
      return res.data;
    },
  });
};

export const useRequestAccess = () => {
  return useMutation({
    mutationFn: async (name: string) => {
      const res = await axios.post(`${API_URL}/access-request`, { name });
      return res.data;
    },
  });
};
