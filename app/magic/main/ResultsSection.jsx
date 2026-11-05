'use client';
import { useExperimentStore } from './states';

const getOutcomeColor = (winningVariant) =>
    winningVariant === 'home' ? 'text-blue-600' : winningVariant === 'away' ? 'text-orange-600' : 'text-gray-600';

export default function ResultsSection({ events, loading, cardProfile }) {
    const { selectedCoefficient, setSelectedCoefficient } = useExperimentStore();

    if (loading) {
        return <div className="text-center py-12">Загрузка...</div>;
    }

    if (events.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="text-gray-500 text-lg mb-2">
                    {selectedCoefficient
                        ? `Нет записей со значением ${selectedCoefficient}`
                        : 'Нет данных для отображения'}
                </div>
                {selectedCoefficient && (
                    <button
                        onClick={() => {
                            // Сбросить выбранное значение в сторе и URL
                            const url = new URL(window.location.href);
                            url.searchParams.delete('coefficient');
                            window.history.pushState({}, '', url.toString());
                            setSelectedCoefficient(null);
                        }}
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Показать пустой набор значений
                    </button>
                )}
            </div>
        );
    }
    return (
        <div className="mb-6 p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                    {selectedCoefficient
                        ? `Записи со значением ${selectedCoefficient} (${events.length})`
                        : `Все записи (${events.length})`}
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((event) => (
                    <EventCard
                        key={event.eventId}
                        event={event}
                        selectedCoefficient={selectedCoefficient}
                        cardProfile={cardProfile}
                        getOutcomeColor={getOutcomeColor}
                    />
                ))}
            </div>
        </div>
    );
}

function EventCard({ event, selectedCoefficient, cardProfile, getOutcomeColor }) {
    const hasMatchingCoefficient =
        selectedCoefficient &&
        event.realCoefficients?.some(
            (coefficientValue) =>
                coefficientValue !== null &&
                parseFloat(coefficientValue).toFixed(2) === parseFloat(selectedCoefficient).toFixed(2)
        );
    const getCardColor = () => {
        if (!hasMatchingCoefficient) return 'bg-white';

        const matchingCoefficientIndex = event.realCoefficients?.findIndex((value) => {
            if (value == null) return false;
            const numericCoefficient = Number(value);
            const numericSelectedCoefficient = Number(selectedCoefficient);
            return !isNaN(numericCoefficient) && numericCoefficient.toFixed(2) === numericSelectedCoefficient.toFixed(2);
        });

        const isSuccessfulVariant =
            matchingCoefficientIndex !== -1 &&
            ((event.winner === 'home' && matchingCoefficientIndex === 0) ||
                (event.winner === 'away' && matchingCoefficientIndex === 1));

        return isSuccessfulVariant ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
    };

    return (
        <div className={`p-4 border rounded-xl shadow-sm hover:shadow-md transition-shadow ${getCardColor()}`}>
            <div className="flex justify-between items-start mb-3">
                <div>
                    <div className="text-sm text-gray-600 font-mono">
                        {cardProfile.eventPrefix}
                        {event.eventId}
                    </div>
                    <div className={`text-lg font-medium mt-1 ${getOutcomeColor(event.winner)}`}>
                        {event.winner === 'home'
                            ? cardProfile.winnerHome
                            : event.winner === 'away'
                              ? cardProfile.winnerAway
                              : cardProfile.winnerUnknown}
                    </div>
                </div>
                {hasMatchingCoefficient && <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">✓</span>}
            </div>

            <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">{cardProfile.sectionTitle}</div>
                {/* Основные значения */}
                <div className="mb-3">
                    <div className="text-xs font-medium text-gray-500 mb-1">{cardProfile.primaryTitle}</div>
                    <div className="flex gap-2">
                        {event.realCoefficients?.map((coefficientValue, index) => {
                            const isVariantA = index === 0;
                            const isWinner =
                                (event.winner === 'home' && index === 0) || (event.winner === 'away' && index === 1);
                            const hasResult = event.winner === 'home' || event.winner === 'away';
                            const isSelected =
                                selectedCoefficient &&
                                coefficientValue !== null &&
                                selectedCoefficient !== null &&
                                (Number(coefficientValue) || 0).toFixed(2) ===
                                    (Number(selectedCoefficient) || 0).toFixed(2);

                            return (
                                <div
                                    key={index}
                                    className={`flex-1 p-2 rounded-lg text-center ${
                                        isSelected
                                            ? 'bg-yellow-100 border-2 border-yellow-300'
                                            : isVariantA
                                              ? 'bg-blue-50 border'
                                              : 'bg-orange-50 border'
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="text-xs text-gray-500">
                                            {isVariantA ? cardProfile.homeLabel : cardProfile.awayLabel}
                                        </div>
                                        {isWinner && <span className="text-xs text-green-600 font-medium">✓</span>}
                                    </div>
                                    <div
                                        className={`text-lg font-bold ${
                                            isSelected ? 'text-yellow-700' : 'text-gray-800'
                                        }`}
                                    >
                                        {(Number(coefficientValue) || 0).toFixed(2)}
                                        {isSelected && ' ✓'}
                                    </div>
                                    {cardProfile.showOutcomeLabels && hasResult && (
                                        <div
                                            className={`text-xs mt-1 font-medium ${isWinner ? 'text-green-700' : 'text-red-600'}`}
                                        >
                                            {isWinner ? cardProfile.successLabel : cardProfile.failureLabel}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Дополнительные источники */}
                {event.flashScoreCoefficients && (
                    <div>
                        <div className="text-xs font-medium text-gray-400 mb-1">Дополнительные источники:</div>
                        <div>
                            {Object.entries(event.flashScoreCoefficients).map(([bookmaker, coefficients], index) => {
                                return (
                                    <div key={bookmaker + index}>
                                        {`${cardProfile.sourceLabels?.[bookmaker] || `Источник ${index + 1}`}:`}
                                        <div className="flex gap-1">
                                            {coefficients.map((coefficientValue, index) => {
                                                const isVariantA = index === 0;
                                                const isWinner =
                                                    (event.winner === 'home' && index === 0) ||
                                                    (event.winner === 'away' && index === 1);
                                                const isSelected =
                                                    selectedCoefficient &&
                                                    coefficientValue !== null &&
                                                    selectedCoefficient !== null &&
                                                    (Number(coefficientValue) || 0).toFixed(2) ===
                                                        (Number(selectedCoefficient) || 0).toFixed(2);

                                                return (
                                                    <div
                                                        key={index}
                                                        className={`flex-1 p-1 rounded text-center text-sm ${
                                                            isSelected
                                                                ? 'bg-yellow-100 border border-yellow-300'
                                                                : 'bg-gray-100 border border-gray-200'
                                                        }`}
                                                        title={`${isVariantA ? cardProfile.homeLabel : cardProfile.awayLabel}: ${(
                                                            Number(coefficientValue) || 0
                                                        ).toFixed(2)}`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="text-xs text-gray-500">
                                                                {isVariantA
                                                                    ? cardProfile.homeLabel
                                                                    : cardProfile.awayLabel}
                                                            </div>
                                                            {isWinner && (
                                                                <span className="text-xs text-green-600">✓</span>
                                                            )}
                                                        </div>
                                                        <div
                                                            className={`font-medium ${
                                                                isSelected ? 'text-yellow-700' : 'text-gray-700'
                                                            }`}
                                                        >
                                                            {(Number(coefficientValue) || 0).toFixed(2)}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {event.scheme && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">{cardProfile.result}</div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <div className="text-xs font-medium text-blue-600">{cardProfile.homeLabel}</div>
                            <div className="flex gap-1 mt-1">
                                {event.scheme.home
                                    ?.filter(Boolean)
                                    .slice(0, -1)
                                    .map((score, idx) => (
                                        <div key={idx} className="flex-1 text-center p-1 bg-white rounded text-sm">
                                            {score}
                                        </div>
                                    ))}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 text-center">
                                Итого: {event.scheme.home?.filter(Boolean).at(-1) || 0}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs font-medium text-orange-600">{cardProfile.awayLabel}</div>
                            <div className="flex gap-1 mt-1">
                                {event.scheme.away
                                    ?.filter(Boolean)
                                    .slice(0, -1)
                                    .map((score, idx) => (
                                        <div key={idx} className="flex-1 text-center p-1 bg-white rounded text-sm">
                                            {score}
                                        </div>
                                    ))}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 text-center">
                                Итого: {event.scheme.away?.filter(Boolean).at(-1) || 0}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {event.comment && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">{event.comment}</div>
                </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t">
                <div className="text-xs text-gray-500">
                    {event.createdAt && new Date(event.createdAt).toLocaleDateString('ru-RU')}
                </div>
                <div className="text-xs">
                    {event.winner === 'home' ? (
                        <span className="text-green-600">{cardProfile.footerHome}</span>
                    ) : event.winner === 'away' ? (
                        <span className="text-red-600">{cardProfile.footerAway}</span>
                    ) : (
                        <span className="text-gray-500">{cardProfile.footerUnknown}</span>
                    )}
                </div>
            </div>
        </div>
    );
}
