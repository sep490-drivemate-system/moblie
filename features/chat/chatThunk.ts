import { IChatSession } from "@/models/chat/chat";
import { createThunk } from "../genericCreateThunk";
import { HttpMethod } from "@/models/enum/HttpMethods";

export const CHAT_PATH = "chats";

export const getChatSessions = createThunk<IChatSession[], void>(
    HttpMethod.GET,
    "getChatSessions",
    `/${CHAT_PATH}/sessions`
);

export const getChatSessionById = createThunk<
    IChatSession,
    { sessionId: string }
>(
    HttpMethod.GET,
    "getChatSessionById",
    `/${CHAT_PATH}/sessions`,
    {
        buildUrl: (payload) => {
            return `${CHAT_PATH}/sessions/${payload.sessionId}`;
        }
    }
);














