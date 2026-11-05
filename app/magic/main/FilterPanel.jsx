'use client';

import { useMemo } from 'react';
import { useExperimentStore } from './states';
import { MIN_COEFFICIENT_THRESHOLD } from './globals';

export default function FilterPanel({
    events,
    onCoefficientSelect,
    onVariantSelect,
    coefficientFilterLabel = 'Фильтр по значению:',
    variantFilterLabel = 'Для теста:',
    allVariantsLabel = 'Любой тест',
    variantALabel = 'Тест A',
    variantBLabel = 'Тест B'
}) {
    const { coefficientStats, totalEvents, selectedCoefficient, selectedVariant } = useExperimentStore();
    // Уникальные значения для выпадающего списка
    const uniqueCoefficients = useMemo(() => {
        const coefficients = coefficientStats.map((stat) => stat.coefficient);
        const validCoefficients = coefficients.reduce((acc, value) => {
            if (!isNaN(value) && value >= MIN_COEFFICIENT_THRESHOLD) {
                acc.push(parseFloat(Number(value).toFixed(2)));
            }
            return acc;
        }, []);
        return [...new Set(validCoefficients)].sort((a, b) => a - b);
    }, [coefficientStats]);

    // Map для быстрого доступа к сводным данным по значению
    const coefficientStatsByValue = useMemo(
        () => new Map(coefficientStats.map((stat) => [stat.coefficient.toFixed(2), stat])),
        [coefficientStats]
    );

    // Есть ли активный фильтр (для подсветки)
    const hasActiveFilter = !!(selectedCoefficient || selectedVariant);

    return (
        <div className="p-0">
            <div className="grid grid-cols-2 gap-4">
                <StatBox label="Всего записей" value={totalEvents} />
                <StatBox
                    label="Показано"
                    value={events.length}
                    highlight={hasActiveFilter && events.length < totalEvents}
                />
            </div>

            <div className="mt-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
                    {/* Фильтр по значению */}
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">{coefficientFilterLabel}</label>
                        <select
                            value={selectedCoefficient || ''}
                            onChange={(e) => onCoefficientSelect(e.target.value || null)}
                            className="w-full p-2 border rounded-lg"
                        >
                            <option value="">Пустой набор значений</option>
                            {uniqueCoefficients.map((coefficientValue) => {
                                const stat = coefficientStatsByValue.get(coefficientValue.toFixed(2));
                                return (
                                    <option key={coefficientValue} value={coefficientValue}>
                                        {coefficientValue.toFixed(2)}
                                        {stat && ` (${stat.successCount}/${stat.sampleSize})`}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    {/* Фильтр по варианту */}
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">{variantFilterLabel}</label>
                        <select
                            value={selectedVariant || ''}
                            onChange={(e) => onVariantSelect(e.target.value || null)}
                            className="w-full p-2 border rounded-lg"
                        >
                            <option value="">{allVariantsLabel}</option>
                            <option value="home">{variantALabel}</option>
                            <option value="away">{variantBLabel}</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatBox({ label, value, highlight = false }) {
    return (
        <div className="text-center">
            <div className="text-sm text-gray-600">{label}</div>
            <div className={`text-2xl font-bold ${highlight ? 'text-blue-600' : ''}`}>{value}</div>
        </div>
    );
}
