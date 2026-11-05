import isMobileDevice from '@/lib/responsive';
import Main from './Main';

export default async function Page() {
    const mobile = await isMobileDevice();
    return <Main mobile={mobile} />;
}
