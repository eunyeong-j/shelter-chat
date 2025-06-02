import axios from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Message } from "../@types/global";

const API_URL = `http://${process.env.VITE_HOST_IP}:${process.env.VITE_HOST_SERVER_PORT}`;

// Queries
export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/users`);
      return res.data;
    },
    staleTime: 60000,
  });
};

export const useMessages = () => {
  return useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/messages`);
      return res.data;
    },
    staleTime: 60000,
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
      userId,
      oldName,
      newName,
    }: {
      userId: number;
      oldName: string;
      newName: string;
    }) => {
      const res = await axios.put(`${API_URL}/user/${userId}/name`, {
        oldName,
        newName,
      });
      return res.data;
    },
  });
};

export const useUpdateUserBgColor = () => {
  return useMutation({
    mutationFn: async ({
      userId,
      bgColor,
    }: {
      userId: number;
      bgColor: string;
    }) => {
      const res = await axios.put(`${API_URL}/user/${userId}/bgColor`, {
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
