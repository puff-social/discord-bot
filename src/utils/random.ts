import { getRandomValues } from 'crypto';

function randomDouble() {
  const buf = new Uint32Array(1);
  getRandomValues(buf);

  return buf[0] / 0x100000000;
}

export function randomEntries<T = any>(entries: T[], count = 1): T[] {
  const winlist: typeof entries = [];
  const entrs = [...entries];
  for (let i = 0; i < count && entrs.length > 0; i++) {
    const randomIndex = Math.floor(randomDouble() * entrs.length);
    winlist.push(entrs.splice(randomIndex, 1)[0]);
  }
  return winlist;
}
