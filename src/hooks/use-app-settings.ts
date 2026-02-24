'use client';

import { useState, useEffect } from 'react';

const STALE_DAYS_KEY = 'stock_manager_stale_days';
const DEFAULT_STALE_DAYS = 30;

export function useAppSettings() {
    const [staleDays, setStaleDaysState] = useState<number>(DEFAULT_STALE_DAYS);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(STALE_DAYS_KEY);
        if (stored !== null) {
            const parsed = parseInt(stored, 10);
            if (!isNaN(parsed) && parsed > 0) {
                setStaleDaysState(parsed);
            }
        }
        setIsLoaded(true);
    }, []);

    const setStaleDays = (days: number) => {
        const clamped = Math.max(1, Math.min(365, days));
        setStaleDaysState(clamped);
        localStorage.setItem(STALE_DAYS_KEY, String(clamped));
    };

    return { staleDays, setStaleDays, isLoaded };
}
