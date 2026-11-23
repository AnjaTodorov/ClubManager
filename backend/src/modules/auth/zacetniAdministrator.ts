import { prisma } from '../../common/prisma.js';
import { zgostiGeslo } from './gesla.js';

/** Prvi zagon prazne baze ustvari račun za prijavo v administracijo. */
export async function pripraviPrvegaAdministratorja(ePosta: string, geslo: string): Promise<void> {
  const administrator = await prisma.uporabnik.findFirst({
    where: { jeAdministrator: true },
    select: { id: true },
  });
  if (administrator) return;

  const uporabnik = await prisma.uporabnik.upsert({
    where: { ePosta },
    update: {},
    create: {
      ePosta,
      ime: 'ClubManager',
      priimek: 'Administrator',
      gesloHash: await zgostiGeslo(geslo),
      jeAdministrator: true,
    },
    select: { jeAdministrator: true },
  });
  if (!uporabnik.jeAdministrator) {
    throw new Error('INITIAL_ADMIN_EMAIL že pripada uporabniku brez administratorskih pravic.');
  }
}
