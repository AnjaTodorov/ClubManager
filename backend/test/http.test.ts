import { describe, expect, it } from 'vitest';
import { zDatum, zId } from '../src/common/http.js';

describe('Validacija podatkov HTTP', () => {
  it('pretvori niz s pozitivnim celim številom v ID', () => {
    expect(zId.parse('42')).toBe(42);
  });

  it.each([0, -1, 2.5])('zavrne neveljaven ID %s', (id) => {
    expect(zId.safeParse(id).success).toBe(false);
  });

  it('pretvori koledarski datum v polnoč UTC', () => {
    expect(zDatum.parse('2028-02-29').toISOString()).toBe('2028-02-29T00:00:00.000Z');
  });

  it('zavrne datum z neveljavnim mesecem', () => {
    expect(zDatum.safeParse('2026-13-01').success).toBe(false);
  });
});
