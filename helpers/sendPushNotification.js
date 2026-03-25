const { getFirebaseMessaging } = require('../firebase/firebaseAdmin');

const sendPushNotification = async ({
  token,
  title,
  body,
  data = {},
}) => {
  const messaging = getFirebaseMessaging();

  const message = {
    token,
    notification: {
      title,
      body,
    },
    data: Object.entries(data).reduce((acc, [key, value]) => {
      acc[key] = value == null ? '' : String(value);
      return acc;
    }, {}),
    android: {
      priority: 'high',
      notification: {
        channelId: 'orders_channel',
      },
    },
  };

  const response = await messaging.send(message);
  return response;
};

module.exports = sendPushNotification;