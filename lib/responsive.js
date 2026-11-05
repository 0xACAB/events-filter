'use server';
import { headers } from 'next/headers';
import { UAParser } from 'ua-parser-js';

export default async function isMobileDevice() {
    const { get } = await headers();
    const ua = get('user-agent');

    const device = new UAParser(ua || '').getDevice();
    return device.type === 'mobile';
}
