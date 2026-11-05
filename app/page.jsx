import DesktopPage from './desktopPage';
import MobilePage from './mobilePage';
import isMobileDevice from '@/lib/responsive';

export default async function Page() {
    const mobile = await isMobileDevice();
    return <>{mobile ? <MobilePage mobile={mobile} /> : <DesktopPage mobile={mobile} />}</>;
}
