import type { CSSProperties } from 'react';
import { Link } from 'wouter';
import { ArrowUpRight, Plus, Volume2 } from 'lucide-react';
import type { Beat } from '@workspace/api-client-react';

type BeatCardProps = { beat: Beat };

const paletteByGenre: Record<string, string> = {
  trap: 'linear-gradient(135deg, #4a374e, #211c2b 52%, #14141a)',
  'r&b': 'linear-gradient(135deg, #38485a, #202633 52%, #17171d)',
  drill: 'linear-gradient(135deg, #55403c, #282027 55%, #151419)',
  'lo-fi': 'linear-gradient(135deg, #645140, #332b29 50%, #19181c)',
};

export function CoverArt({ beat, className = '', large = false }: { beat: Beat; className?: string; large?: boolean }) {
  const style = beat.coverUrl
    ? { backgroundImage: `linear-gradient(180deg, rgba(12, 11, 15, .06), rgba(12, 11, 15, .3)), url("${beat.coverUrl}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { '--cover': paletteByGenre[beat.genre.toLowerCase()] ?? 'linear-gradient(135deg, #49405b, #1b1922 65%, #121114)' } as CSSProperties;
  return <div className={`cover-art ${className}`} style={style as CSSProperties}><span className="cover-label">VEXEN / EXAMPLE</span><span className="cover-mark">{large ? 'VEXEN · ' : ''}{beat.bpm} / {beat.key}</span></div>;
}

export function BeatCard({ beat }: BeatCardProps) {
  return <article className="beat-card" data-testid={`card-beat-${beat.slug}`}>
    <Link href={`/beat/${beat.slug}`} aria-label={`Подробнее о бите ${beat.title}`}><CoverArt beat={beat} /></Link>
    <div className="beat-info"><div className="beat-title-line"><div><Link href={`/beat/${beat.slug}`} className="beat-title">{beat.title}</Link><p className="beat-producer">Продюсер · VEXEN</p></div><button className="square-action" type="button" disabled title="Аудиопревью ещё не загружено" aria-label="Аудиопревью ещё не загружено"><Volume2 size={14} /></button></div>
      <div className="beat-meta"><span>{beat.genre}</span><span>{beat.bpm} BPM</span><span>{beat.key}</span></div>
      <div className="beat-bottom"><span className="sample-price">Пример<strong>{beat.startingPriceMinor == null ? 'Цена уточняется' : new Intl.NumberFormat('ru-RU', { style: 'currency', currency: beat.currency || 'USD' }).format(beat.startingPriceMinor / 100)}</strong></span><div className="beat-actions"><Link href={`/beat/${beat.slug}`} className="square-action" aria-label={`Подробнее: ${beat.title}`}><ArrowUpRight size={14} /></Link><Link href={`/beat/${beat.slug}`} className="square-action" aria-label={`Выбрать лицензию для ${beat.title}`} title="Открыть бит и выбрать лицензию"><Plus size={15} /></Link></div></div>
    </div>
  </article>;
}
