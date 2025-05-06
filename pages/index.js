// File: pages/index.js
import Head from 'next/head';
import DustCollectionCalculator from '../components/DustCollectionCalculator';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Dust Collection Calculator</title>
        <meta name="description" content="Calculate static pressure and CFM for your dust collection system" />
      </Head>
      <main>
        <DustCollectionCalculator />
      </main>
    </div>
  );
}
