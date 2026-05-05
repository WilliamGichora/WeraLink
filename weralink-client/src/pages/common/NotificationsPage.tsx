import { useGetNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/features/execution/api/execution.api';
import { formatDistanceToNow } from 'date-fns';
import { 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Clock, 
  CheckCheck,
  ChevronRight,
  Inbox} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { data: notifications, isLoading, refetch } = useGetNotifications();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markRead(notification.id);
    }
    if (notification.linkUrl) {
      navigate(notification.linkUrl);
    }
  };

  const handleMarkAllRead = () => {
    markAllRead(undefined, {
      onSuccess: () => {
        toast.success('All notifications marked as read');
        refetch();
      }
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'APPROVED':
        return <CheckCircle className="h-6 w-6 text-emerald-500" />;
      case 'REVISION_REQUESTED':
        return <AlertCircle className="h-6 w-6 text-amber-500" />;
      case 'SUBMITTED':
        return <FileText className="h-6 w-6 text-blue-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-10 h-10 border-4 border-primary-wera border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-accent-dark tracking-tight">Notifications</h1>
          <p className="text-text-main/60 mt-1">Stay updated with your latest activity and job status.</p>
        </div>
        {unreadCount > 0 && (
          <Button 
            onClick={handleMarkAllRead}
            variant="outline" 
            className="border-primary-wera/20 text-primary-wera hover:bg-primary-wera/5 rounded-xl font-bold"
          >
            <CheckCheck className="w-4 h-4 mr-2" /> Mark all as read
          </Button>
        )}
      </div>

      {!notifications || notifications.length === 0 ? (
        <Card className="bg-slate-50 border-dashed border-2 border-slate-200 py-20">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm">
              <Inbox className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-bold text-accent-dark mb-2">All caught up!</h3>
            <p className="text-text-main/60 max-w-xs">
              You don't have any notifications at the moment. We'll let you know when something important happens.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification: any) => (
            <Card 
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={cn(
                "group cursor-pointer transition-all border-2",
                !notification.isRead 
                  ? "bg-white border-primary-wera/10 shadow-md shadow-primary-wera/5" 
                  : "bg-slate-50/50 border-slate-100 opacity-80 hover:opacity-100"
              )}
            >
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="mt-1 flex-shrink-0 p-3 rounded-2xl bg-white shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className={cn(
                          "font-bold text-lg",
                          !notification.isRead ? "text-accent-dark" : "text-slate-600"
                        )}>
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <Badge className="bg-primary-wera text-white text-[10px] uppercase h-5">New</Badge>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-slate-500 leading-relaxed">
                      {notification.message}
                    </p>
                    {notification.linkUrl && (
                      <div className="mt-4 flex items-center text-sm font-bold text-primary-wera opacity-0 group-hover:opacity-100 transition-opacity">
                        View Assignment <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
