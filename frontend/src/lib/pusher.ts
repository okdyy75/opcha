import Pusher from 'pusher-js';

let pusher: Pusher | null = null;

export function getPusher(): Pusher {
  if (!pusher) {
    pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || 'your-pusher-key', {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap3',
      encrypted: true,
      forceTLS: true,
    });

    pusher.connection.bind('connected', () => {
      console.log('Pusher connected');
    });

    pusher.connection.bind('error', (err: any) => {
      console.error('Pusher connection error:', err);
    });
  }

  return pusher;
}

export function disconnectPusher(): void {
  if (pusher) {
    pusher.disconnect();
    pusher = null;
  }
}