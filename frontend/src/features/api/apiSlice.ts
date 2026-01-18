import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { IUser, IMessage } from "../../types";

const SERVER_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL = (SERVER_URL ?? "").replace(/\/+$/, "") + "/api";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers: Headers) => {
      // Add any global headers here if needed
      return headers;
    },
    credentials: "include",
  }),
  tagTypes: ["User", "Contacts", "Messages"],
  endpoints: (builder) => ({
    // --- Auth Endpoints ---
    login: builder.mutation<void, { email: string; username: string }>({
      query: (credentials) => ({
        url: "/auth/sign-up",
        method: "POST",
        body: credentials,
      }),
    }),
    signIn: builder.mutation<IUser, { identifier: string }>({
      query: (credentials) => ({
        url: "/auth/sign-in",
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response: { user: IUser; message?: string }) =>
        response.user,
      invalidatesTags: ["User"],
    }),
    verify: builder.mutation<IUser, { email: string; otp: string }>({
      query: (payload) => ({
        url: "/auth/verify",
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: { user: IUser; message?: string }) =>
        response.user,
      invalidatesTags: ["User"],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/sign-out",
        method: "POST",
      }),
      invalidatesTags: ["User", "Contacts", "Messages"],
    }),
    checkAuth: builder.query<IUser, void>({
      query: () => ({
        url: "/auth/check",
      }),
      transformResponse: (response: { user: IUser; message: string }) =>
        response.user,
      providesTags: ["User"],
    }),

    // --- User Endpoints ---
    updateProfile: builder.mutation<{ message: string }, FormData>({
      query: (formData) => ({
        url: "/user/profile",
        method: "PUT",
        body: formData,
      }),
      transformResponse: (response: { message: string }) => response,
      invalidatesTags: ["User"],
    }),
    sendOtp: builder.mutation<void, { email: string }>({
      query: (body) => ({
        url: "/user/send-otp",
        method: "POST",
        body,
      }),
    }),
    updateEmail: builder.mutation<IUser, { email: string; otp: string }>({
      query: (body) => ({
        url: "/user/email",
        method: "PUT",
        body,
      }),
      transformResponse: (response: { user: IUser; message: string }) =>
        response.user,
      invalidatesTags: ["User"],
    }),
    deleteUser: builder.mutation<void, void>({
      query: () => ({
        url: "/user/delete",
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),

    // --- Chat Endpoints ---
    getContacts: builder.query<
      Array<IUser & { lastMessage?: Partial<IMessage> | null }>,
      void
    >({
      query: () => ({
        url: "/user/contacts",
      }),
      transformResponse: (response: {
        contacts: Array<IUser & { lastMessage?: Partial<IMessage> | null }>;
      }) => response.contacts,
      providesTags: ["Contacts"],
    }),
    createContact: builder.mutation<
      IUser & { lastMessage?: null },
      { username: string }
    >({
      query: (body) => ({
        url: "/user/contact",
        method: "POST",
        body,
      }),
      transformResponse: (response: {
        contact: IUser & { lastMessage?: null };
        message: string;
      }) => response.contact,
      invalidatesTags: ["Contacts"],
    }),
    deleteContact: builder.mutation<{ deletedContactId: string }, string>({
      query: (contactId) => ({
        url: `/user/contact/${contactId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Contacts"],
    }),

    // --- Message Endpoints ---
    getMessages: builder.query<IMessage[], string>({
      query: (contactId) => ({
        url: `/user/messages/${contactId}`,
      }),
      transformResponse: (response: { messages: IMessage[] }) =>
        response.messages,
      providesTags: (result, _error, contactId) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: "Messages" as const,
                id: _id,
              })),
              { type: "Messages", id: contactId },
            ]
          : [{ type: "Messages", id: contactId }],
    }),
    createMessage: builder.mutation<{ message: IMessage }, FormData>({
      query: (formData) => ({
        url: "/user/message",
        method: "POST",
        body: formData,
      }),
      transformResponse: (response: {
        newMessage: IMessage;
        message: string;
      }) => ({
        message: response.newMessage,
      }),
      invalidatesTags: (_result, _error, arg) => [
        "Contacts",
        { type: "Messages", id: arg.get("receiver") as string },
      ],
    }),
    messageRead: builder.mutation<IMessage[], { messages: IMessage[] }>({
      query: (body) => ({
        url: "/user/message-read",
        method: "POST",
        body,
      }),
      transformResponse: (response: { messages: IMessage[] }) =>
        response.messages,
      invalidatesTags: ["Messages"],
    }),
    createReaction: builder.mutation<
      { message: IMessage },
      { reaction: string; messageId: string }
    >({
      query: (body) => ({
        url: "/user/reaction",
        method: "POST",
        body,
      }),
      transformResponse: (response: { updatedMessage: IMessage }) => ({
        message: response.updatedMessage,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Messages", id: arg.messageId },
      ],
    }),
    editMessage: builder.mutation<void, { messageId: string; text: string }>({
      query: ({ messageId, text }) => ({
        url: `/user/message/${messageId}`,
        method: "PUT",
        body: { text },
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Messages", id: arg.messageId },
        "Contacts",
      ],
    }),
    deleteMessage: builder.mutation<
      void,
      { messageId: string; deleteForBoth: boolean; receiverId: string }
    >({
      query: ({ messageId, ...body }) => ({
        url: `/user/message/${messageId}`,
        method: "DELETE",
        body,
      }),
      invalidatesTags: ["Messages", "Contacts"],
    }),
  }),
});

export const {
  useLoginMutation,
  useSignInMutation,
  useVerifyMutation,
  useLogoutMutation,
  useCheckAuthQuery,
  useUpdateProfileMutation,
  useSendOtpMutation,
  useUpdateEmailMutation,
  useDeleteUserMutation,
  useGetContactsQuery,
  useCreateContactMutation,
  useDeleteContactMutation,
  useGetMessagesQuery,
  useCreateMessageMutation,
  useMessageReadMutation,
  useCreateReactionMutation,
  useEditMessageMutation,
  useDeleteMessageMutation,
} = apiSlice;
