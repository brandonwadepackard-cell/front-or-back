import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { useEffect, useState } from 'react';

export const usePushNotifications = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (!isNative) return;

    // Request permission and register
    const initPushNotifications = async () => {
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        console.log('Push notification permission denied');
        return;
      }

      await PushNotifications.register();
    };

    // Listen for registration success
    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success, token: ' + token.value);
      setToken(token.value);
      setIsRegistered(true);
    });

    // Listen for registration errors
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    // Listen for push notifications received
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received: ', notification);
    });

    // Listen for notification actions
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push notification action performed', notification.actionId, notification.inputValue);
    });

    initPushNotifications();

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, [isNative]);

  const sendTestNotification = async () => {
    if (!isNative) {
      console.log('Push notifications only available on native platforms');
      return;
    }

    // Note: This would typically be sent from your backend
    console.log('To send push notifications, use your backend with this token:', token);
  };

  return { isRegistered, token, sendTestNotification, isNative };
};
