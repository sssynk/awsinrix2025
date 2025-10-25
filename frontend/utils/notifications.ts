export function showNotification(message: string, type: 'success' | 'error' | 'info' = 'info') {
  // TODO: replace alert with toast/notification library
  if (type === 'success') alert('✅ ' + message);
  else if (type === 'error') alert('❌ ' + message);
  else alert(message);
}
