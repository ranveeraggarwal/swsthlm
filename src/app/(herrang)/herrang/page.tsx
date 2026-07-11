// /herrang — A Day in Herräng. Fully static: the week schedule and every
// committed daily program ship in the initial payload; all time logic and
// personalization (track picker) run client-side against localStorage.

import { loadHerrangData } from '@/lib/herrang/data';
import { HerrangApp } from '@/components/herrang/HerrangApp';

export const dynamic = 'force-static';

export default function HerrangPage() {
  const data = loadHerrangData();
  return <HerrangApp data={data} />;
}
