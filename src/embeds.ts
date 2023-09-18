import { Channels, Roles, Rules } from './constants';

export const generalRolesEmbed = {
  title: 'General Roles',
  description: `We have some general roles you can self-assign for notifiations, site updates, ect, click the reaction below to get the role, remove it to take it away.\n\n${Roles.SeshAlerts.emoji} - **Sesh Alerts** **(<@&${Roles.SeshAlerts.role}>)**\n*You can notify people with this role using the \`/sesh\` command in one of the public chats.*\n\n${Roles.SiteUpdates.emoji} - **Site Updates** **(<@&${Roles.SiteUpdates.role}>)**\n*Notified whenever we make changes to the site*\n\n${Roles.ServerAnnouncements.emoji} - **Server Announcements** **(<@&${Roles.ServerAnnouncements.role}>)**\n*Sent when we make changes to the discord that are impactful enough to announce.*\n\n${Roles.Giveaways.emoji} - **Giveaways** **(<@&${Roles.ServerAnnouncements.role}>)**\n*Mentioned whenever a giveaway is started in <#${Channels.Giveaways}>*`,
  color: 0x129392,
  footer: {
    text: 'puff.social - roles',
  },
};

export const devicesRolesEmbed = {
  title: 'Show off your device',
  url: 'https://puff.social',
  description:
    "If you've got a Puffco device and would like a role to show that off, head over to puff.social, join a group and connect your device, after a few minutes you'll have your devices corresponding role :)",
  color: 0x129392,
  footer: {
    text: 'puff.social - roles',
  },
};

export const displayDeviceEmbed = {
  title: 'Display device roles',
  url: 'https://puff.social',
  description:
    "If you want to display your device icon next to your name in chat you can pick one with the buttons below\n\n*You must have the corosponding device role from connecting your device first*\n\n*This will overwrite your existing icons (for example if you're a supporter)*",
  color: 0xff00b3,
  footer: {
    text: 'puff.social - display roles',
  },
};

export const colorRoleEmbed = {
  title: 'Choose a Color',
  description: 'Wanna stylize your chat a bit with a name color? Click a button below.\n\n*This will overwrite the color from your subscription*',
  color: 0xbb1ca3,
  footer: {
    text: 'puff.social - display colors',
  },
};

export const welcomeEmbed = {
  title: 'Welcome to puff.social',
  description: `Hey there, welcome to the official community for [puff.social](https://puff.social)\n\n**Server Rules:**\n${Rules.join(
    '\n\n',
  )}\n\nView the puff.social Leaderboards in <#1091638184120684694>\nSubmit feedback in <#1090801829715128361>\nView our changelog posts in <#1090801875743408258>`,
  color: 0x00ffff,
  image: {
    url: 'https://puff.social/meta.png',
  },
  footer: {
    text: 'puff.social community rules',
  },
};
