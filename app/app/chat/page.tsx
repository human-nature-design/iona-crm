import { getUser, getTeamForUser } from '@/lib/db/supabase-queries';
import { getUserChats, getChatWithMessages } from './actions';
import { ChatInterface } from './chat-interface';
import { redirect } from 'next/navigation';

interface ChatPageProps {
  searchParams: Promise<{ id?: string; new?: string }>;
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const params = await searchParams;
  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }

  const team = await getTeamForUser();
  if (!team) {
    redirect('/sign-in');
  }

  // Get all user's chats for the dropdown
  const chats = await getUserChats();

  // Get current chat ID from URL
  const chatId = params.id ? parseInt(params.id, 10) : undefined;
  const isNewChat = params.new === 'true';

  // Fetch messages for current chat (unless explicitly starting new chat)
  let initialMessages: Array<{
    id: number;
    chat_id: number;
    role: string;
    content: string;
    created_at: string;
  }> = [];

  if (chatId && !isNewChat) {
    const chatData = await getChatWithMessages(chatId);
    if (chatData) {
      initialMessages = chatData.messages;
    }
  }

  // Use a key to force re-mount when switching chats
  const chatKey = isNewChat ? `new-${Date.now()}` : chatId?.toString() || 'empty';

  return (
    <ChatInterface
      key={chatKey}
      chats={chats}
      currentChatId={isNewChat ? undefined : chatId}
      initialMessages={initialMessages}
    />
  );
}
