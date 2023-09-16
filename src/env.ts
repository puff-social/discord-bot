import { InvalidEnvError, envsafe, makeValidator, port, str } from 'envsafe';

const strArray = makeValidator<string[]>((input) => {
  if (typeof input == 'object' && input.length) return input;
  else if (typeof input == 'string' && input.split(',').length != 0) return input.split(',');

  throw new InvalidEnvError(`Expected '${input}' to be comma-seperated values`);
});

export const env = envsafe({
  PORT: port({
    default: 8000,
  }),
  NODE_ENV: str(),
  DISCORD_TOKEN: str({
    desc: 'Discord Bot Token',
  }),
  GATEWAY_HOST: str({
    default: 'http://gateway:9002',
    devDefault: 'http://10.8.99.23:9002',
  }),
  HASH_API: str({
    default: 'http://api:8000',
    devDefault: 'http://10.8.99.12:8000',
  }),
  INTERNAL_HASH_API: str({
    default: 'http://api:8002',
    devDefault: 'http://10.8.99.12:8002',
  }),
  WATCH_GUILD: str({
    default: '479769841763483658',
  }),
  WATCH_CHANNELS: strArray({
    default: ['1090978448450785290'],
  }),
  WELCOME_CHANNEL: str({
    default: '479770730142236703',
  }),
  LEADERBOARD_CHANNEL: str({
    default: '1091638184120684694',
  }),
  ROLES_CHANNEL: str({
    default: '1103927473458135121',
  }),
});
