import { resolve } from 'node:path';
import { ustvariAplikacijo } from './app.js';
import { config, jeProdukcija } from './config.js';
import { pripraviPrvegaAdministratorja } from './modules/auth/zacetniAdministrator.js';

if (jeProdukcija && config.INITIAL_ADMIN_EMAIL && config.INITIAL_ADMIN_PASSWORD) {
  await pripraviPrvegaAdministratorja(config.INITIAL_ADMIN_EMAIL, config.INITIAL_ADMIN_PASSWORD);
}

const app = ustvariAplikacijo(config.FRONTEND_DIST && resolve(config.FRONTEND_DIST));

app.listen(config.PORT, '0.0.0.0', () => {
  console.log(`ClubManager posluša na vratih ${config.PORT}`);
});
