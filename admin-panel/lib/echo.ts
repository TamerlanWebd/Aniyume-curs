import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: any;
        Echo: any;
    }
}

if (typeof window !== 'undefined') {
    window.Pusher = Pusher;

    window.Echo = new Echo({
        broadcaster: 'pusher',
        key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY || 'local',
        cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || 'mt1',
        wsHost: process.env.NEXT_PUBLIC_WEBSOCKET_HOST || window.location.hostname,
        wsPort: parseInt(process.env.NEXT_PUBLIC_WEBSOCKET_PORT || '6001'),
        forceTLS: false,
        disableStats: true,
        enabledTransports: ['ws', 'wss'],
    });
}

export const echo = typeof window !== 'undefined' ? window.Echo : null;
