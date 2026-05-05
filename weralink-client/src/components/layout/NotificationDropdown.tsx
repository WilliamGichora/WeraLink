import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Clock, 
  CheckCheck,
  ChevronRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGetNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/features/execution/api/execution.api';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/context/AuthContext';

export const NotificationDropdown: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: notifications, isLoading } = useGetNotifications();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();

  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markRead(notification.id);
    }
    if (notification.linkUrl) {
      // Ensure the link includes the role prefix if it doesn't have it
      const rolePrefix = `/${user?.role.toLowerCase()}`;
      const url = notification.linkUrl.startsWith('/') ? notification.linkUrl : `${rolePrefix}/${notification.linkUrl}`;
      navigate(url);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'REVISION_REQUESTED':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'SUBMITTED':
        return <FileText className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-gray-300 hover:text-white hover:bg-white/10">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-wera opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-wera"></span>
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-80 md:w-96 bg-accent-dark/95 backdrop-blur-xl border border-white/10 text-white shadow-2xl relative z-50 p-0" 
        align="end"
      >
        <div className="flex items-center justify-between p-4 pb-2">
          <DropdownMenuLabel className="p-0 font-bold text-lg tracking-tight">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => markAllRead()}
              className="h-8 text-xs text-primary-wera hover:text-primary-wera hover:bg-primary-wera/10 font-semibold"
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Mark all as read
            </Button>
          )}
        </div>
        
        <DropdownMenuSeparator className="bg-white/10 mx-0" />
        
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-primary-wera border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Bell className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification: any) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "flex items-start gap-4 p-4 text-left hover:bg-white/5 transition-colors group relative border-b border-white/5 last:border-0",
                    !notification.isRead && "bg-white/[0.02]"
                  )}
                >
                  {!notification.isRead && (
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-wera rounded-full" />
                  )}
                  <div className="mt-1 flex-shrink-0 p-2 rounded-full bg-black/20 group-hover:bg-black/40 transition-colors">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className={cn(
                        "text-sm font-bold truncate leading-none pr-4",
                        !notification.isRead ? "text-white" : "text-gray-300"
                      )}>
                        {notification.title}
                      </p>
                      <span className="text-[10px] text-gray-500 whitespace-nowrap">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {notification.message}
                    </p>
                    {notification.linkUrl && (
                      <div className="flex items-center mt-2 text-[10px] font-bold text-primary-wera opacity-0 group-hover:opacity-100 transition-opacity">
                        View details
                        <ChevronRight className="ml-1 h-3 w-3" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <DropdownMenuSeparator className="bg-white/10 mx-0" />
        <div className="p-2">
          <Button 
            variant="ghost" 
            className="w-full h-8 text-xs text-gray-400 hover:text-white hover:bg-white/5"
            onClick={() => navigate(`/${user?.role.toLowerCase()}/notifications`)}
          >
            View all activity
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
