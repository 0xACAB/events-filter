import { Suspense } from 'react';
import FilterClient from './event-filter/FilterClient';
import './event-filter/styles.css';

export default function Page() {
    return (
        <Suspense fallback={<div>Загрузка...</div>}>
            <FilterClient />
        </Suspense>
    );
}
