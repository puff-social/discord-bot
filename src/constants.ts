import { DeviceModelColors } from '@puff-social/commons/dist/puffco';
import { env } from './env';

export const AllowedRolesMap: Record<string, { role: string; name: string }> = {
  '1109581279097258065': { role: '1091533760119443536', name: 'Peak Pro' },
  '1109581295660568666': { role: '1091534067410935838', name: 'Opal' },
  '1109581287787864075': { role: '1091533939534999572', name: 'Indiglow' },
  '1109581291109748817': { role: '1091534018207551601', name: 'Guardian' },
  '1115372397361635479': { role: '1115370363778515027', name: 'Pearl' },
  '1115372382786441277': { role: '1115370368731987990', name: 'Onyx' },
  '1162214735798866001': { role: '1162214606379417730', name: 'Desert' },
  '1214788302931103764': { role: '1214787209471987723', name: 'Flourish' },
};

export const DeviceRoleColorMap: Record<string, number> = {
  '1109581279097258065': parseInt(DeviceModelColors.Peak.slice(1), 16),
  '1109581295660568666': parseInt(DeviceModelColors.Opal.slice(1), 16),
  '1109581287787864075': parseInt(DeviceModelColors.Indiglow.slice(1), 16),
  '1109581291109748817': parseInt(DeviceModelColors.Guardian.slice(1), 16),
  '1115372397361635479': parseInt(DeviceModelColors.PeachWhite.slice(1), 16),
  '1115372382786441277': parseInt(DeviceModelColors.PeachBlack.slice(1), 16),
  '1162214735798866001': parseInt(DeviceModelColors.Desert.slice(1), 16),
  '1214788302931103764': parseInt(DeviceModelColors.Flourish.slice(1), 16),
};

export const DisplayDeviceRolesMap = {
  'puffco-peak-pro': '1109581279097258065',
  'puffco-opal': '1109581295660568666',
  'puffco-indiglow': '1109581287787864075',
  'puffco-guardian': '1109581291109748817',
  'puffco-onyx': '1115372382786441277',
  'puffco-pearl': '1115372397361635479',
  'puffco-desert': '1162214735798866001',
  'puffco-flourish': '1214788302931103764'
};

export const DeviceDisplayButtons = {
  peak: { name: 'Peak Pro', emoji: { name: 'peak', id: '1090799054428065894' }, action: 'puffco-peak-pro' },
  opal: { name: 'Opal', emoji: { name: 'opal', id: '1090799053220089878' }, action: 'puffco-opal' },
  indiglow: { name: 'Indiglow', emoji: { name: 'indiglow', id: '1090799052247027792' }, action: 'puffco-indiglow' },
  guardian: { name: 'Guardian', emoji: { name: 'guardian', id: '1090799049894015050' }, action: 'puffco-guardian' },
  pearl: { name: 'Pearl', emoji: { name: 'pearl', id: '1115367284316319754' }, action: 'puffco-pearl' },
  onyx: { name: 'Onyx', emoji: { name: 'onyx', id: '1115367196781203578' }, action: 'puffco-onyx' },
  desert: { name: 'Desert', emoji: { name: 'desert', id: '1162214566831333376' }, action: 'puffco-desert' },
  flourish: { name: 'Flourish', emoji: { name: 'flourish', id: '1214787175141609522' }, action: 'puffco-flourish' },
};

export const ProductModelMap = {
  '0': { name: 'Peak', emoji: `<:peak:${DeviceDisplayButtons.peak.emoji.id}>`, role: '1091533760119443536' },
  '21': { name: 'Peak', emoji: `<:peak:${DeviceDisplayButtons.peak.emoji.id}>`, role: '1091533760119443536' },
  '4294967295': { name: 'Peak', emoji: `<:peak:${DeviceDisplayButtons.peak.emoji.id}>`, role: '1091533760119443536' },
  '1': { name: 'Opal', emoji: `<:opal:${DeviceDisplayButtons.opal.emoji.id}>`, role: '1091534067410935838' },
  '22': { name: 'Opal', emoji: `<:opal:${DeviceDisplayButtons.opal.emoji.id}>`, role: '1091534067410935838' },
  '2': { name: 'Indiglow', emoji: `<:indiglow:${DeviceDisplayButtons.indiglow.emoji.id}>`, role: '1091533939534999572' },
  '4': { name: 'Guardian', emoji: `<:guardian:${DeviceDisplayButtons.guardian.emoji.id}>`, role: '1091534018207551601' },
  '13': { name: 'Onyx', emoji: `<:onyx:${DeviceDisplayButtons.onyx.emoji.id}>`, role: '1115370368731987990' },
  '12': { name: 'Pearl', emoji: `<:pearl:${DeviceDisplayButtons.pearl.emoji.id}>`, role: '1115370363778515027' },
  '51': { name: 'Peak', emoji: `<:peak:${DeviceDisplayButtons.peak.emoji.id}>`, role: '1091533760119443536' },
  '71': { name: 'Onyx', emoji: `<:onyx:${DeviceDisplayButtons.onyx.emoji.id}>`, role: '1115370368731987990' },
  '72': { name: 'Pearl', emoji: `<:pearl:${DeviceDisplayButtons.pearl.emoji.id}>`, role: '1115370363778515027' },
  '15': { name: 'Desert', emoji: `<:desert:${DeviceDisplayButtons.desert.emoji.id}>`, role: '1162214606379417730' },
  '74': { name: 'Desert', emoji: `<:desert:${DeviceDisplayButtons.desert.emoji.id}>`, role: '1162214606379417730' },
  '17': { name: 'Flourish', emoji: `<:flourish:${DeviceDisplayButtons.flourish.emoji.id}>`, role: '1214787209471987723' },
  '75': { name: 'Flourish', emoji: `<:flourish:${DeviceDisplayButtons.flourish.emoji.id}>`, role: '1214787209471987723' },
};

export const Roles = {
  Birthday: { role: '1112497816242229430', emoji: '' },
  Booster: { role: '1103957954992021545', emoji: '' },
  Giveaways: { role: '1152733455159939254', emoji: '💝' },
  SeshAlerts: { role: env.NODE_ENV == 'production' ? '1100653810935930951' : '1199528232169513000', emoji: '🌿' },
  SiteUpdates: { role: '1100653692983717940', emoji: '📝' },
  ServerAnnouncements: { role: '1103917695864410242', emoji: '📢' },
};

export const VoiceTickers = {
  Members: env.NODE_ENV == 'production' ? '1112498736791310396' : '1174214987774959739',
};

export const RankRoles: Record<string, { id: string }> = {
  1: { id: '1110768841073631236' },
  5: { id: '1110769156606922796' },
  10: { id: '1110769616030023731' },
  20: { id: '1110770083967553627' },
  30: { id: '1110770243485315072' },
  40: { id: '1110770362519670854' },
  50: { id: '1110770576504651776' },
  60: { id: '1110770735049359391' },
};

export const Channels = {
  Giveaways: env.NODE_ENV == 'production' ? '1152479156571996210' : '1174210048004722758',
  General: env.NODE_ENV == 'production' ? '479780824464490507' : '1174210101125595178',
  Roles: env.NODE_ENV == 'production' ? '1103927473458135121' : '1174210101125595178',
  RanksNBots: env.NODE_ENV == 'production' ? '1110744300662296597' : '1174210189826740224',
  RigShowcase: env.NODE_ENV == 'production' ? '1111547333537173544' : '1174210209183440917',
  FirmwareUpdates: env.NODE_ENV == 'production' ? '1121643313209032734' : '1174210233007087636',
  VoiceLogs: env.NODE_ENV == 'production' ? '1165028178671181946' : '1174210246219141160',
  ChatLogs: env.NODE_ENV == 'production' ? '1181840125559320576' : '1181840334674743316',
};

export const VoiceTextChannels = {
  VCText: env.NODE_ENV == 'production' ? '1101008224108433428' : '1174210705197637662',
  GamingText: env.NODE_ENV == 'production' ? '1168273939903037491' : '1174210737556688968',
  PenthouseText: env.NODE_ENV == 'production' ? '1168274007322275890' : '1174210767751483443',
};

export const VoiceChannels = {
  General: env.NODE_ENV == 'production' ? '479770647254532099' : '1174210575044186122',
  SeshLive: env.NODE_ENV == 'production' ? '1133468595624612051' : '1174210541821100102',
  SeshCircle: env.NODE_ENV == 'production' ? '479770514597085204' : '1174210387890163722',
  GamingLounge: env.NODE_ENV == 'production' ? '1135327888216969276' : '1174210613237526568',
  Penthouse: env.NODE_ENV == 'production' ? '1099607402657087569' : '1174210648788439050',
};

export const VoiceToText = {
  [VoiceChannels.General]: VoiceTextChannels.VCText,
  [VoiceChannels.SeshLive]: VoiceTextChannels.VCText,
  [VoiceChannels.SeshCircle]: VoiceTextChannels.VCText,
  [VoiceChannels.GamingLounge]: VoiceTextChannels.GamingText,
  [VoiceChannels.Penthouse]: VoiceTextChannels.PenthouseText,
};

export const NumberEmojis = {
  1: '1️⃣',
  2: '2️⃣',
  3: '3️⃣',
  4: '4️⃣',
  5: '5️⃣',
  6: '6️⃣',
  7: '7️⃣',
  8: '8️⃣',
  9: '9️⃣',
  10: '🔟',
};

export const Clouds = {
  start: '<:cloudstart:1091902077191594106>',
  start2: '<:cloud2:1091902070396821506>',
  middle: '<:cloudmiddle:1091902073798402160>',
  preend: '<:cloudpreend:1091902075396423742>',
  end: '<:cloudend:1091902072552685570>',
};

export const SubscriptionRoles = {
  TopShelf: { role: '1109575111629078542', subscription: '1109575111629078538' },
  Mids: { role: '1109559288302682197', subscription: '1109559288302682193' },
  Lows: { role: '1109553143781539914', subscription: '1109553143781539910' },
};

export const ColorRoles: Record<string, { name: string; role: string; emoji: string }> = {
  purple: { name: 'Purple', role: '1110339928388292611', emoji: '🟪' },
  blue: { name: 'Blue', role: '1110341718424965150', emoji: '🟦' },
  green: { name: 'Green', role: '1110341721377746964', emoji: '🟩' },
  yellow: { name: 'Yellow', role: '1110341722250158180', emoji: '🟨' },

  orange: { name: 'Orange', role: '1110341723072237658', emoji: '🟧' },
  red: { name: 'Red', role: '1110341836565909545', emoji: '🟥' },
  brown: { name: 'Brown', role: '1110341864369946664', emoji: '🟫' },
  black: { name: 'Black', role: '1214796747474210888', emoji: '⬛' },
};

export const SeshVoiceChannels = ['479770514597085204', '1133468595624612051'];

export const Rules = [
  '1️⃣. As this server relates to cannabis consumption, you must be 21+ years old to be present in this server, if we find out otherwise you will be banned without question.',
  "2️⃣. Respect your fellow members, we're all here for the same thing, treat others as though you would want to be treated.",
  '3️⃣. Advertising is strictly prohibited, chances are if you have to advertise it here nobody wants it anyway.' +
  '\n*(This rule has some exceptions if you offer/make puffco related products or services)*',
  "4️⃣. We don't allow any type of NSFW content in this server, keep it anywhere but here.",
  '5️⃣. Spamming chats or mic spamming in voice channels is prohibited.',
  "6️⃣. Follow Discord ToS as we're required to enforce those here.",
  "7️⃣. Currently we're only able to moderate english, so only english is permitted in the chats.",
  "8️⃣. Don't ask for roles or permissions.",
  '9️⃣. Be courteous to users in the voice channels by not recording or live streaming them.\n*(Referring to external sources, not like discord live)*\n*(Certain channels may exist for this over time)*',
  "🔟. Don't be a troll, if you have to question that something might fall under this rule you need to reconsider your current thought.",
];
