import { readHomeData } from '@/lib/dataService';
import HolaMundo from '@/components/HolaMundo';
import type { HomeData } from '@/lib/types';

export default function HomePage() {
  // Lectura y validación automática desde /data/home.json
  const homeData: HomeData = readHomeData();

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <HolaMundo
        title={homeData.hero.title}
        subtitle={homeData.hero.subtitle}
        description={homeData.hero.description}
        animationStyle={homeData.hero.animationStyle}
      />
    </main>
  );
}
