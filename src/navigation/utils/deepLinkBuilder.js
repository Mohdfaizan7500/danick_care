// src/navigation/utils/deepLinkBuilder.js
const NAVIGATION_IDS = ['home', 'spare', 'orders', 'complaints', 'amc', 'bucket', 'notifications', 'assign'];

export function buildDeepLinkFromNotificationData(title) {
  if (!title) return null;

  const navigationId = title.toLowerCase();

  if (!NAVIGATION_IDS.includes(navigationId)) {
    return null;
  }

  switch (navigationId) {
    case 'home':
      return 'partner://app/home';
    case 'spare':
      return 'partner://app/spare';
    case 'orders':
      return 'partner://app/orders';
    case 'complaints':
      return 'partner://app/complaints?tab=all';
    case 'assign':
      return 'partner://app/complaints?tab=assign';
    case 'amc':
      return 'partner://app/amc';
    case 'bucket':
      return 'partner://app/bucket';
    case 'notifications':
      return 'partner://app/notifications';
    default:
      return null;
  }
}
