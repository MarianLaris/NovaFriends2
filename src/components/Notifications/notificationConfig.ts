import {
  PushNotifications, ActionPerformed,
  PushNotificationSchema,
  Token,
} from '@capacitor/push-notifications';
import axios from 'axios';
import React from 'react';
import { Notification, User } from '../../Types/entitinities';
const API_KEY = "NjQ3MmY0YjctMjgwZS00NWY4LTgxMmYtMzY3ZjczM2Q0NmRj";
const ONESIGNAL_APP_ID = "6499b61f-b5ce-42e5-83aa-3def17d444b0";


const optionsBuilder = (method: string, path: string, body: any) => {

  const BASE_URL = "https://onesignal.com/api/v1";

  return {
    method,
    'url': `${BASE_URL}/${path}`,
    'headers': {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": `Basic ${API_KEY}`
    },
    body: body ? JSON.stringify(body) : null
  };
}


const sendNotification: (notification: Notification, message: string, receiver: User) => Promise<any> = async (notification, message, receiver) => {

  const body = {
    // app_id: ONESIGNAL_APP_ID,
    "app_id": "6499b61f-b5ce-42e5-83aa-3def17d444b0",
    "include_external_user_ids": [receiver.email],
    "data": {
      notification
    },
    "contents": {
      "en": message
    }

  };
  const options = optionsBuilder("post", "notifications", body);
  return await axios.post(options.url, options.body, { headers: options.headers })

}










export { sendNotification };