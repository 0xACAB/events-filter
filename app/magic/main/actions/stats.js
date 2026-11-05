'use server';
import { connectToDatabase } from '@/lib/mongodb';

export async function fetchExperimentStats() {
    const { db } = await connectToDatabase();
    const rawEvents = await db
        .collection('nba')
        .aggregate([
            {
                $match: {
                    //eventId: 'MH3FeAUP',
                    /*flashScoreCoefficients: {
                        $exists: true,
                        $ne: null
                    },*/
                    realCoefficients: {
                        $exists: true,
                        $ne: null
                    }
                }
            },
            {
                $match: {
                    realCoefficients: {
                        $elemMatch: {
                            $type: 'string',
                            $regex: /^.{4,5}$/ // проверка длины через regex
                        }
                    }
                }
            }
        ])
        .sort({ createdAt: -1 })
        .toArray();

    const events = rawEvents.map((event) => ({
        ...event,
        _id: event._id.toString(),
        createdAt: event.createdAt ? event.createdAt.toISOString() : null
    }));

    const coefficientStats = events.reduce((stats, event) => {
        event.realCoefficients.forEach((coefficient, index) => {
            const numericCoefficient = Number(coefficient);

            const key = numericCoefficient.toFixed(2);
            if (!stats[key]) {
                stats[key] = { coefficient: numericCoefficient, sampleSize: 0, successCount: 0 };
            }
            stats[key].sampleSize++;

            if ((event.winner === 'home' && index === 0) || (event.winner === 'away' && index === 1)) {
                stats[key].successCount++;
            }
        });
        return stats;
    }, {});

    const variantCoefficientStats = events.reduce((stats, event) => {
        event.realCoefficients.forEach((coefficient, index) => {
            const numericCoefficient = Number(coefficient);

            const variant = index === 0 ? 'home' : 'away';
            const variantKey = `${numericCoefficient.toFixed(2)}_${variant}`;

            if (!stats[variantKey]) {
                stats[variantKey] = {
                    coefficient: numericCoefficient,
                    variant,
                    sampleSize: 0,
                    successCount: 0
                };
            }
            stats[variantKey].sampleSize++;

            if ((event.winner === 'home' && index === 0) || (event.winner === 'away' && index === 1)) {
                stats[variantKey].successCount++;
            }
        });
        return stats;
    }, {});
    return [Object.values(coefficientStats), variantCoefficientStats, events.length];
}

export async function fetchFilteredEvents(props) {
    const { coefficient, team: variant } = (await props.searchParams) || {};
    let coefficientFieldPath;
    if (variant) {
        coefficientFieldPath = `realCoefficients.${variant === 'home' ? 0 : 1}`;
    } else {
        coefficientFieldPath = 'realCoefficients';
    }
    const { db } = await connectToDatabase();
    //В realCoefficients всегда строки длины 4 или 5 "x.xx" или "xx.xx"
    const matchingCoefficients = coefficient ? [coefficient] : [];
    const events = await db
        .collection('nba')
        .aggregate([
            {
                $match: {
                    //eventId: 'MH3FeAUP',
                    flashScoreCoefficients: {
                        $exists: true,
                        $ne: null
                    },
                    [coefficientFieldPath]: {
                        $exists: true,
                        $ne: null,
                        $in: matchingCoefficients
                    }
                }
            },
            {
                $match: {
                    realCoefficients: {
                        $elemMatch: {
                            $type: 'string',
                            $regex: /^.{4,5}$/ // проверка длины через regex
                        }
                    }
                }
            }
        ])
        .sort({ createdAt: -1 })
        .toArray();

    return events.map((event) => ({
        ...event,
        _id: event._id.toString(),
        createdAt: event.createdAt ? event.createdAt.toISOString() : null
    }));
}
