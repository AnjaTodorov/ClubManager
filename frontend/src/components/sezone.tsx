import { useState } from 'react';
import { api } from '../api';
import type { Sezona } from '../tipi';
import { useNalozi } from './ui';

/** Naloži sezone in privzeto izbere aktivno (če je ni, najnovejšo). */
export function useSezone() {
  const { podatki, nalaganje, napaka } = useNalozi(() => api.get<Sezona[]>('/sezone'));
  const sezone = podatki ?? [];
  const [izbranaSezonaId, setSezonaId] = useState<number | null>(null);
  const sezona = sezone.find((s) => s.id === izbranaSezonaId) ?? sezone.find((s) => s.status === 'AKTIVNA') ?? sezone[0];

  return { sezone, sezonaId: sezona?.id ?? null, setSezonaId, sezona: sezona ?? null, nalaganje, napaka };
}

export function IzbiraSezone({ sezone, vrednost, obSpremembi }: { sezone: Sezona[]; vrednost: number | null; obSpremembi: (id: number) => void }) {
  return (
    <select value={vrednost ?? ''} onChange={(e) => obSpremembi(Number(e.target.value))} aria-label="Sezona" style={{ width: 'auto' }}>
      {sezone.map((s) => (
        <option key={s.id} value={s.id}>
          Sezona {s.naziv}
          {s.status === 'AKTIVNA' ? ' (trenutna)' : ''}
        </option>
      ))}
    </select>
  );
}
