import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api, ApiNapaka } from '../src/api';

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => vi.unstubAllGlobals());

describe('Odjemalec REST API', () => {
  it('prebere odgovor JSON in pošlje piškotek seje istemu izvoru', async () => {
    const ekipe = [{ id: 1, naziv: 'Člani' }];
    fetchMock.mockResolvedValueOnce(Response.json(ekipe));

    await expect(api.get('/ekipe')).resolves.toEqual(ekipe);
    expect(fetchMock).toHaveBeenCalledWith('/api/ekipe', expect.objectContaining({
      method: 'GET',
      credentials: 'same-origin',
      body: undefined,
    }));
  });

  it.each(['post', 'put', 'patch'] as const)('za %s pošlje JSON in glavo za zaščito pred CSRF', async (metoda) => {
    fetchMock.mockResolvedValueOnce(Response.json({}));
    const podatki = { naziv: 'Člani' };

    await api[metoda]('/ekipe', podatki);

    expect(fetchMock).toHaveBeenCalledWith('/api/ekipe', expect.objectContaining({
      method: metoda.toUpperCase(),
      headers: expect.objectContaining({
        'Content-Type': 'application/json',
        'X-Requested-With': 'ClubManager',
      }),
      body: JSON.stringify(podatki),
    }));
  });

  it('ob uspešnem brisanju brez vsebine vrne undefined', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

    await expect(api.delete('/povabila/1')).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith('/api/povabila/1', expect.objectContaining({ method: 'DELETE' }));
  });

  it('ohrani sporočilo in napake obrazca pri neuspešni validaciji', async () => {
    const polja = { naziv: 'Polje je obvezno' };
    fetchMock.mockResolvedValueOnce(Response.json({ napaka: 'Neveljavni podatki', polja }, { status: 400 }));

    await expect(api.post('/ekipe', {})).rejects.toMatchObject({ status: 400, message: 'Neveljavni podatki', polja });
  });

  it('ob odgovoru 401 obvesti uporabniški vmesnik o neprijavljeni seji', async () => {
    const okno = new EventTarget();
    const obNeprijavi = vi.fn();
    okno.addEventListener('clubmanager:neprijavljen', obNeprijavi);
    vi.stubGlobal('window', okno);
    fetchMock.mockResolvedValueOnce(Response.json({}, { status: 401 }));

    await expect(api.get('/ekipe')).rejects.toMatchObject({ status: 401 });
    expect(obNeprijavi).toHaveBeenCalledTimes(1);
  });

  it('ob napaki brez odgovora JSON uporabi privzeto sporočilo', async () => {
    fetchMock.mockResolvedValueOnce(new Response('Bad Gateway', { status: 502 }));

    await expect(api.get('/ekipe')).rejects.toMatchObject({ status: 502, message: 'Prišlo je do napake' });
  });

  it('nedosegljiv strežnik sporoči kot napako API s statusom 0', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const zahteva = api.get('/ekipe');
    await expect(zahteva).rejects.toBeInstanceOf(ApiNapaka);
    await expect(zahteva).rejects.toMatchObject({ status: 0 });
  });
});
