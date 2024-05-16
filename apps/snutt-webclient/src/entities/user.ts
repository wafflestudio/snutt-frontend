export interface User {
  email?: string;
  fb_name: string | null;
  isAdmin: boolean;
  local_id: string | null;
  notificationCheckedAt: string;
  regDate: string;
}
