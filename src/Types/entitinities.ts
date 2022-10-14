



export interface User {
  username: string;
  email: string;
  photo: string;
  followers?: number,
  following?: number,
  lastSeen: number,
  posts?: number;
  bio?: string,
  displayName?: string,

}

export interface PostInfo {
  id: string;
  title: string;
  description: string;
  image?: string;
  username: string;
  user?: User;
  profile_pic?: string;
  likes: number;
  comments: number;
  createdAt: number;
  video?: string

}

export interface Comment {
  id: string;
  description: string;
  user: User;
  attachment: string;
  timestamp: number;

}

export interface PostLike {
  email: string;
  user: User;
  timestamp: number;

}

export interface Notification {
  id: string;
  description: string;
  from: User;
  title: string;
  timestamp: number;
  type: "like" | "comment" | "follow" | "post" | "message" | "mention";
  postId: string,
  seen: boolean;

}


export interface OTPCode {
  id: string;
  user: User;
  timestamp: number;
  invites: User[]

}