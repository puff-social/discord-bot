import { keydb } from '@puff-social/commons/dist/connectivity/keydb';
import { prisma } from './connectivity/prisma';

(async () => {
  const latestFirmware = await keydb.get(`puff/fw/latest`);
  const watchedSerials = await prisma.firmware_watches.findMany();

  for await (const watched of watchedSerials) {
    // const ota = await get
  }
})();

export default '';
