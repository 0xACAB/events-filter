'use client';

import { MIN_SAMPLE_SIZE_FOR_TOP_COEFFICIENTS, MIN_COEFFICIENT_THRESHOLD, TOP_COEFFICIENTS_LIMIT } from './globals';
import { useMemo } from 'react';
import { useExperimentStore } from './states';

function CoefficientButton({ stat, isSelected, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1 rounded-full text-sm transition-all relative ${
                isSelected ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 hover:bg-gray-200'
            }`}
            title={`${stat.coefficient.toFixed(2)} (${
                stat.variant === 'home' ? 'Тест A' : stat.variant === 'away' ? 'Тест B' : 'Все варианты'
            }): ${stat.successCount}/${stat.sampleSize} результатов (${(stat.successRate * 100).toFixed(1)}%)`}
        >
            <div className="flex items-center gap-1">
                <span>{stat.coefficient.toFixed(2)}</span>
                <span className={`text-xs ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                    ({stat.successCount}/{stat.sampleSize})
                </span>
            </div>
        </button>
    );
}
export default function TopCoefficients({ onCoefficientSelect }) {
    const { statsInitialized, coefficientStats, variantCoefficientStats, selectedCoefficient, selectedVariant } =
        useExperimentStore();

    const topCoefficients = useMemo(() => {
        if (!statsInitialized) return [];
        if (!selectedVariant) {
            return coefficientStats
                .filter(
                    (stat) =>
                        stat.sampleSize >= MIN_SAMPLE_SIZE_FOR_TOP_COEFFICIENTS &&
                        stat.coefficient >= MIN_COEFFICIENT_THRESHOLD
                )
                .map((stat) => ({ ...stat, successRate: stat.successCount / stat.sampleSize }))
                .sort((a, b) => b.successRate - a.successRate || b.coefficient - a.coefficient)
                .slice(0, TOP_COEFFICIENTS_LIMIT);
        }
        const variantStats = Object.values(variantCoefficientStats);
        return variantStats
            .filter(
                (stat) =>
                    stat.variant === selectedVariant &&
                    stat.sampleSize >= MIN_SAMPLE_SIZE_FOR_TOP_COEFFICIENTS &&
                    stat.coefficient >= MIN_COEFFICIENT_THRESHOLD
            )
            .map((stat) => ({ ...stat, successRate: stat.successCount / stat.sampleSize }))
            .sort((a, b) => b.successRate - a.successRate || b.coefficient - a.coefficient)
            .slice(0, TOP_COEFFICIENTS_LIMIT);
    }, [statsInitialized, coefficientStats, variantCoefficientStats, selectedVariant]);

    return (
        <div className="p-4">
            {/* ... */}
            <div className="flex flex-wrap gap-2">
                {topCoefficients.map((stat) => (
                    <CoefficientButton
                        key={`${stat.coefficient}_${stat.variant || 'all'}`}
                        stat={stat}
                        isSelected={
                            selectedCoefficient &&
                            stat.coefficient.toFixed(2) === selectedCoefficient &&
                            (!selectedVariant || stat.variant === selectedVariant)
                        }
                        onClick={() => onCoefficientSelect(stat.coefficient.toString())}
                    />
                ))}
            </div>
        </div>
    );
}
