import { isWeb, warnIfNotWeb } from './platform';

export const confirmAction = (message: string): boolean => {
  if (isWeb && typeof window !== 'undefined' && typeof window.confirm === 'function') {
    return window.confirm(message);
  }

  warnIfNotWeb('Confirmation dialog');
  return false;
};
