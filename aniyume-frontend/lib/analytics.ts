export class PerformanceAnalytics {
    private static instance: PerformanceAnalytics;
    private metrics: Map<string, number> = new Map();

    static getInstance() {
        if (!this.instance) {
            this.instance = new PerformanceAnalytics();
        }
        return this.instance;
    }

    // Замер времени загрузки
    startTimer(key: string) {
        this.metrics.set(key, performance.now());
    }

    endTimer(key: string): number {
        const startTime = this.metrics.get(key);
        if (!startTime) return 0;

        const duration = performance.now() - startTime;
        console.log(`⏱️ [${key}]: ${duration.toFixed(2)}ms`);

        this.metrics.delete(key);
        return duration;
    }

    // Отправка метрик (в будущем - в аналитику)
    sendMetric(name: string, value: number, tags?: Record<string, string>) {
        console.log(`📊 Metric: ${name} = ${value}`, tags);

        // TODO: Отправка в Google Analytics / Amplitude
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', name, {
                value: Math.round(value),
                ...tags
            });
        }
    }

    // Мониторинг Web Vitals
    reportWebVitals() {
        if (typeof window === 'undefined') return;

        // First Contentful Paint
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                console.log(`📈 ${entry.name}: ${entry.startTime.toFixed(2)}ms`);
            });
        });

        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
    }
}

export const analytics = PerformanceAnalytics.getInstance();
