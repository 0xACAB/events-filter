import './styles.css'; // ← импортируем локальный CSS

// app/magic/main/page.js
import FilterClient from './FilterClient';
import { Suspense } from 'react';

export default async function Page() {
    return (
        <Suspense fallback={<div>Загрузка...</div>}>
            <FilterClient />
        </Suspense>
    );
}
