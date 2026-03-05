-- Enable real-time for the notifications table so the bell icon updates live
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
