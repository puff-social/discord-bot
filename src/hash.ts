import { users, accounts, connections, devices } from '../generated/puff';

import { env } from './env';
import { APIResponse, LeaderboardEntry } from './types/Hash';
import { stringify } from 'querystring';

export async function getLeaderboards(limit = 10) {
  try {
    const req = await fetch(`${env.HASH_API}/v1/leaderboard?limit=${limit}`).then((r) => r.json());
    return req as APIResponse<{ leaderboards: LeaderboardEntry[] }>;
  } catch (error) {}
}

export async function getUsers(opts?: { limit?: number; all?: boolean }) {
  const options = stringify(opts);
  try {
    const req = await fetch(`${env.INTERNAL_HASH_API}/users${options ? `?${options}` : ''}`).then((r) => r.json());
    return req as APIResponse<{
      users: (users & {
        devices: devices[];
        accounts: accounts[];
        connections: connections[];
      })[];
    }>;
  } catch (error) {}
}
