import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { ustvariAplikacijo } from '../src/app.js';

describe('ogrodje API', () => {
  const app = ustvariAplikacijo();

  it('GET /api/health vrne stanje ok', async () => {
    const odgovor = await request(app).get('/api/health');
    expect(odgovor.status).toBe(200);
    expect(odgovor.body.status).toBe('ok');
  });

  it('neznana pot vrne 404 v obliki JSON', async () => {
    const odgovor = await request(app).get('/ne-obstaja');
    expect(odgovor.status).toBe(404);
    expect(odgovor.body.napaka).toContain('ne obstaja');
    // Neznane poti API-ja neprijavljenemu ne razkrijejo, ali obstajajo.
    expect((await request(app).get('/api/ne-obstaja')).status).toBe(401);
  });

  it('neveljaven JSON vrne 400', async () => {
    const odgovor = await request(app)
      .post('/api/health')
      .set('Content-Type', 'application/json')
      .send('{neveljavno');
    expect(odgovor.status).toBe(400);
  });

  it('streže frontend in ohrani odzive API-ja na istem izvoru', async () => {
    const mapa = await mkdtemp(join(tmpdir(), 'clubmanager-'));
    try {
      await writeFile(join(mapa, 'index.html'), '<!doctype html><div id="root"></div>');
      await writeFile(join(mapa, 'aplikacija.js'), 'console.log("ClubManager");');
      const produkcijskaApp = ustvariAplikacijo(mapa);

      await request(produkcijskaApp).get('/').expect(200, /id="root"/);
      await request(produkcijskaApp).get('/povabilo/zeton').expect(200, /id="root"/);
      await request(produkcijskaApp).get('/aplikacija.js').expect(200, /ClubManager/);
      await request(produkcijskaApp).get('/manjka.js').expect(404);
      await request(produkcijskaApp).get('/api/health').expect(200).expect('Content-Type', /json/);
      await request(produkcijskaApp).get('/api/ne-obstaja').expect(401).expect('Content-Type', /json/);
    } finally {
      await rm(mapa, { recursive: true, force: true });
    }
  });
});
