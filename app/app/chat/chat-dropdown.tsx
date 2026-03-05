'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Trash2, SquarePen, History } from 'lucide-react';
import { deleteChat } from './actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Chat {
  id: number;
  title: string | null;
  created_at: string;
  updated_at: string;
}

interface ChatDropdownProps {
  chats: Chat[];
  currentChatId?: number;
}

export function ChatDropdown({ chats, currentChatId }: ChatDropdownProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<number | null>(null);

  const handleSelectChat = (chatId: number) => {
    router.push(`/app/chat?id=${chatId}`);
  };

  const handleNewChat = () => {
    // Use replace + refresh to ensure clean state
    router.push('/app/chat?new=true');
    router.refresh();
  };

  const handleDeleteChat = async () => {
    if (chatToDelete === null) return;

    try {
      await deleteChat(chatToDelete);
      // If we deleted the current chat, redirect to new chat
      if (chatToDelete === currentChatId) {
        router.push('/app/chat?new=true');
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }

    setDeleteDialogOpen(false);
    setChatToDelete(null);
  };

  const confirmDelete = (chatId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setChatToDelete(chatId);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <div className="flex items-center gap-1.5">
        {/* History dropdown - only show if there are chats */}
        {chats.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                title="Chat history"
              >
                <History className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Recent chats
              </div>
              <DropdownMenuSeparator />
              <div className="max-h-64 overflow-y-auto">
                {chats.map((chat) => (
                  <DropdownMenuItem
                    key={chat.id}
                    className={`group flex items-center justify-between gap-2 cursor-pointer ${
                      chat.id === currentChatId ? 'bg-accent' : ''
                    }`}
                    onClick={() => handleSelectChat(chat.id)}
                  >
                    <span className="truncate flex-1 text-sm">
                      {chat.title || 'Untitled chat'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-50 hover:!opacity-100 hover:text-destructive flex-shrink-0 transition-opacity"
                      onClick={(e) => confirmDelete(chat.id, e)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* New chat button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNewChat}
          className="h-9 w-9"
          title="New chat"
        >
          <SquarePen className="h-4 w-4" />
        </Button>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this chat and all its messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteChat}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
