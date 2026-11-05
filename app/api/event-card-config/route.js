import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const dynamic = 'force-dynamic';

const requiredStringFields = [
    'id',
    'name',
    'eventPrefix',
    'winnerHome',
    'winnerAway',
    'winnerUnknown',
    'sectionTitle',
    'primaryTitle',
    'homeLabel',
    'awayLabel',
    'footerHome',
    'footerAway',
    'footerUnknown',
    'successLabel',
    'failureLabel'
];

export async function GET() {
    try {
        const configDirectory = join(process.cwd(), 'config');
        const trackedConfig = JSON.parse(await readFile(join(configDirectory, 'event-card.json'), 'utf8'));
        let localProfiles = [];

        try {
            const localConfig = JSON.parse(await readFile(join(configDirectory, 'event-card.local.json'), 'utf8'));
            localProfiles = localConfig.profiles;
        } catch (error) {
            if (error.code !== 'ENOENT') throw error;
        }

        const profiles = [...trackedConfig.profiles, ...localProfiles];
        const hasValidProfiles =
            Array.isArray(trackedConfig.profiles) &&
            trackedConfig.profiles.length > 0 &&
            Array.isArray(localProfiles) &&
            profiles.every(
                (profile) =>
                    profile &&
                    requiredStringFields.every((field) => typeof profile[field] === 'string') &&
                    typeof profile.showOutcomeLabels === 'boolean'
            );
        const profileIds = new Set(profiles.map((profile) => profile.id));

        if (
            !hasValidProfiles ||
            profileIds.size !== profiles.length ||
            typeof trackedConfig.defaultProfileId !== 'string' ||
            !profileIds.has(trackedConfig.defaultProfileId)
        ) {
            throw new Error('Invalid EventCard config structure');
        }

        return Response.json(
            { defaultProfileId: trackedConfig.defaultProfileId, profiles },
            { headers: { 'Cache-Control': 'no-store' } }
        );
    } catch (error) {
        console.error('Failed to load EventCard config:', error);
        return Response.json(
            {
                error: 'Не удалось загрузить конфигурацию карточки. Проверьте config/event-card.json и config/event-card.local.json.'
            },
            { status: 500 }
        );
    }
}
