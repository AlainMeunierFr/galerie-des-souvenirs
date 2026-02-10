import HomePageContent from './HomePageContent';
import {
  getSouvenirFilenames,
  defaultSouvenirRepository,
} from '@/utils';

export default async function Home() {
  const souvenirs = await getSouvenirFilenames(defaultSouvenirRepository);

  return <HomePageContent souvenirs={souvenirs} />;
}

export { HomePageContent };
