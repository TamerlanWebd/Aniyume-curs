import { AnalyticsData, HealthStatus, Webhook } from './api';

export const MOCK_ANALYTICS: AnalyticsData = {
    total_requests: 12543,
    average_response_time: 145,
    methods: {
        GET: 8500,
        POST: 3200,
        PUT: 500,
        DELETE: 343,
    },
    status_codes: {
        '200': 11000,
        '201': 1000,
        '400': 400,
        '404': 100,
        '500': 43,
    },
    daily_requests: {
        '2023-11-17': 1200,
        '2023-11-18': 1350,
        '2023-11-19': 1100,
        '2023-11-20': 1500,
        '2023-11-21': 1800,
        '2023-11-22': 2000,
        '2023-11-23': 1600,
    },
    recent_requests: [
        { timestamp: '2023-11-23 10:30:00', method: 'GET', endpoint: '/api/anime', status: 200, duration: 120, ip: '192.168.1.1' },
        { timestamp: '2023-11-23 10:29:45', method: 'POST', endpoint: '/api/auth/login', status: 200, duration: 250, ip: '192.168.1.5' },
        { timestamp: '2023-11-23 10:28:12', method: 'GET', endpoint: '/api/anime/search', status: 200, duration: 180, ip: '192.168.1.1' },
        { timestamp: '2023-11-23 10:25:00', method: 'GET', endpoint: '/api/health', status: 200, duration: 50, ip: '127.0.0.1' },
        { timestamp: '2023-11-23 10:20:00', method: 'POST', endpoint: '/api/webhooks', status: 201, duration: 300, ip: '192.168.1.10' },
    ],
};

export const MOCK_HEALTH: HealthStatus = {
    status: 'ok',
    checks: {
        database: 'ok',
        cache: 'ok',
        firestore: 'ok',
    },
    memory_usage: {
        used: '128 MB',
        peak: '256 MB',
    },
    uptime: '12d 4h 32m',
    server_time: new Date().toISOString(),
};

export const MOCK_WEBHOOKS: Webhook[] = [
    { id: '1', url: 'https://discord.com/api/webhooks/123', events: ['anime.created'], is_active: true, created_at: '2023-11-01' },
    { id: '2', url: 'https://my-app.com/callback', events: ['anime.updated', 'anime.deleted'], is_active: false, created_at: '2023-11-05' },
];
