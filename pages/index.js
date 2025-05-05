import dynamic from 'next/dynamic';
const DustCollectionCalculator = dynamic(() => import('../components/DustCollectionCalculator'), { ssr: false });

export default function Home() {
  return <DustCollectionCalculator />;
}
