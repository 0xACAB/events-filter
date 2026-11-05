'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useExperimentStore } from './states';
import TopCoefficients from './TopCoefficients';
import ResultsSection from './ResultsSection';
import FilterPanel from './FilterPanel';
import { fetchExperimentStats } from './actions/stats';

const subscribeToClient = () => () => {};
const getClientStatus = () => true;
const getServerClientStatus = () => false;

export default function FilterClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isClient = useSyncExternalStore(subscribeToClient, getClientStatus, getServerClientStatus);
    const [eventCardConfig, setEventCardConfig] = useState(null);
    const [selectedCardProfileId, setSelectedCardProfileId] = useState(null);
    const [eventCardConfigError, setEventCardConfigError] = useState(null);

    const {
        events,
        loading,
        selectedCoefficient,
        selectedVariant,
        initializeExperimentStats,
        setSelectedCoefficient,
        setSelectedVariant,
        loadEvents
    } = useExperimentStore();
    const selectedCardProfile = eventCardConfig?.profiles.find((profile) => profile.id === selectedCardProfileId);

    useEffect(() => {
        let isMounted = true;

        async function fetchEventCardConfig() {
            try {
                const response = await fetch('/api/event-card-config', { cache: 'no-store' });
                const config = await response.json();

                if (!response.ok) {
                    throw new Error(config.error || 'Не удалось загрузить конфигурацию карточки.');
                }

                if (
                    !Array.isArray(config.profiles) ||
                    !config.profiles.length ||
                    !config.profiles.some((profile) => profile.id === config.defaultProfileId)
                ) {
                    throw new Error('В конфигурации карточки не найден профиль по умолчанию.');
                }

                if (isMounted) {
                    setEventCardConfig(config);
                    setSelectedCardProfileId(config.defaultProfileId);
                }
            } catch (error) {
                console.error('Failed to fetch EventCard config:', error);
                if (isMounted) {
                    setEventCardConfigError(error instanceof Error ? error.message : 'Не удалось загрузить конфигурацию карточки.');
                }
            }
        }

        fetchEventCardConfig();
        return () => {
            isMounted = false;
        };
    }, []);

    // Инициализация статики (один раз)
    useEffect(() => {
        let isMounted = true;

        async function loadExperimentStats() {
            try {
                const experimentStats = await fetchExperimentStats();
                if (isMounted) initializeExperimentStats(...experimentStats);
            } catch (error) {
                if (isMounted) console.error('Failed to fetch stats:', error);
            }
        }

        loadExperimentStats();
        return () => {
            isMounted = false;
        };
    }, [initializeExperimentStats]);

    // Синхронизация стора с URL (только на клиенте)
    useEffect(() => {
        if (!isClient) return;

        const coefficientFromUrl = searchParams.get('coefficient');
        const variantFromUrl = searchParams.get('team');
        if (coefficientFromUrl && coefficientFromUrl !== selectedCoefficient) {
            setSelectedCoefficient(Number(coefficientFromUrl).toFixed(2));
        }
        if (variantFromUrl && variantFromUrl !== selectedVariant) setSelectedVariant(variantFromUrl);
        if (!coefficientFromUrl && selectedCoefficient) setSelectedCoefficient(null);
        if (!variantFromUrl && selectedVariant) setSelectedVariant(null);
    }, [searchParams, selectedCoefficient, selectedVariant, setSelectedCoefficient, setSelectedVariant, isClient]);

    // Загрузка матчей при изменении фильтров
    useEffect(() => {
        if (selectedCoefficient !== undefined) {
            // если стор уже инициализирован (хотя бы null)
            loadEvents();
        }
    }, [selectedCoefficient, selectedVariant, loadEvents]);

    const handleCoefficientSelect = (value) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set('coefficient', value);
        } else {
            params.delete('coefficient');
        }
        router.push(`/magic/main?${params.toString()}`);
    };

    const handleVariantSelect = (value) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set('team', value);
        } else {
            params.delete('team');
        }
        router.push(`/magic/main?${params.toString()}`);
    };

    // На сервере показываем заглушку, на клиенте - полный компонент
    if (!isClient) {
        return (
            <div className="scrollbar-aware-container">
                <div className="p-4 max-w-6xl mx-auto">
                    <h1 className="text-2xl font-bold mb-6 text-center">
                        {selectedCardProfile?.pageTitle || 'Фильтр событий'}
                    </h1>
                    <div>Загрузка...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="scrollbar-aware-container">
            <div className="p-4 max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold mb-6 text-center">
                    {selectedCardProfile?.pageTitle || 'Фильтр событий'}
                </h1>

                <FilterPanel
                    router={router}
                    events={events}
                    onCoefficientSelect={handleCoefficientSelect}
                    onVariantSelect={handleVariantSelect}
                    coefficientFilterLabel={selectedCardProfile?.filterLabel}
                    variantFilterLabel={selectedCardProfile?.teamFilterLabel}
                    allVariantsLabel={selectedCardProfile?.allTeamsLabel}
                    variantALabel={selectedCardProfile?.homeTeamLabel}
                    variantBLabel={selectedCardProfile?.awayTeamLabel}
                />

                <TopCoefficients onCoefficientSelect={handleCoefficientSelect} />

                {selectedCardProfile ? (
                    <ResultsSection events={events} loading={loading} cardProfile={selectedCardProfile} />
                ) : eventCardConfigError ? (
                    <div className="text-center py-8 text-red-600">{eventCardConfigError}</div>
                ) : null}
            </div>
        </div>
    );
}
