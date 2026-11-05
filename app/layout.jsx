import './globals.css';
//import { Suspense } from 'react';
//import { YandexMetrika } from '@/components/YandexMetrika';

export const metadata = {
    title: '@xTranscendence',
    description: 'Magic'
};

export default async function RootLayout({ children }) {
    //suppressHydrationWarning for fix hydratation error in iOS chrome
    return (
        <html lang="en" suppressHydrationWarning>
            <body>{children}</body>
        </html>
    );
}
