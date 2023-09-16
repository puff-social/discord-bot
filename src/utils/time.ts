import moment from 'moment-timezone';

export function automaticRelativeDifference(d: Date): { duration: number; unit: Intl.RelativeTimeFormatUnit } {
  const diff = -((new Date().getTime() - d.getTime()) / 1000) | 0;
  const absDiff = Math.abs(diff);

  if (absDiff > 86400 * 30 * 10) return { duration: Math.round(diff / (86400 * 365)), unit: 'years' };
  if (absDiff > 86400 * 25) return { duration: Math.round(diff / (86400 * 30)), unit: 'months' };
  if (absDiff > 3600 * 21) return { duration: Math.round(diff / 86400), unit: 'days' };
  if (absDiff > 60 * 44) return { duration: Math.round(diff / 3600), unit: 'hours' };
  if (absDiff > 30) return { duration: Math.round(diff / 60), unit: 'minutes' };

  return { duration: diff, unit: 'seconds' };
}

export function secToMinutesAndSeconds(seconds: number) {
  const computed = Math.floor(seconds / 60);
  const res = computed % 60;
  return computed.toString().padStart(2, '0') + ':' + res.toString().padStart(2, '0');
}

export function getCurrent(timezone: string, hour: number, minute: number) {
  const now = moment.tz(timezone);
  return (now.hour() == hour || now.hour() == hour + 12) && now.minute() == minute;
}

export function getNext(timezone: string, hour: number, minute: number) {
  const now = moment.tz(timezone);

  const nextAM = now.clone().set({ hour, minute, second: 0, millisecond: 0 });
  const nextPM = now.clone().set({ hour: hour + 12, minute, second: 0, millisecond: 0 });

  const next = nextAM.isAfter(now) ? nextAM : nextPM;
  if (next.isBefore(now)) next.add(1, 'day');

  return next;
}

export function formatDuration(milliseconds: number, full = false) {
  const duration = moment.duration(milliseconds);
  const hours = duration.hours();
  const minutes = duration.minutes();
  const seconds = minutes >= 10 ? 0 : duration.seconds();

  let formattedDuration = '';
  if (hours > 0) formattedDuration += hours + 'h ';
  if (minutes > 0) formattedDuration += minutes + 'm ';
  if (seconds > 0 && hours === 0 && minutes === 0) formattedDuration += '<1m';
  if (full && minutes > 0 && hours === 0 && seconds === 0) formattedDuration = formattedDuration.replace('m', ' minutes');

  return formattedDuration.trim();
}

export function parseTimeToFutureDate(input: string) {
  const regex = /(\d+)\s*(?:([yMwdhms])|((?:\d+\s*)+[yMwdhms]))/g;
  let match: RegExpExecArray;
  const timeComponents = {
    y: 0,
    M: 0,
    w: 0,
    d: 0,
    h: 0,
    m: 0,
    s: 0,
  };

  while ((match = regex.exec(input)) !== null) {
    const [, value, unit, extendedUnits] = match;
    const numericValue = parseInt(value, 10);
    if (isNaN(numericValue)) return null;

    if (unit) {
      timeComponents[unit] += numericValue;
    } else if (extendedUnits) {
      const extendedRegex = /(\d+)\s*([yMwdhms])/g;

      let extendedMatch: RegExpExecArray;
      while ((extendedMatch = extendedRegex.exec(extendedUnits)) !== null) {
        const [, extValue, extUnit] = extendedMatch;
        const extNumericValue = parseInt(extValue, 10);
        if (!isNaN(extNumericValue)) {
          timeComponents[extUnit] += extNumericValue;
        }
      }
    }
  }

  const currentDate = new Date();
  currentDate.setFullYear(currentDate.getFullYear() + timeComponents['y']);
  currentDate.setMonth(currentDate.getMonth() + timeComponents['M']);
  currentDate.setDate(currentDate.getDate() + timeComponents['w'] * 7 + timeComponents['d']);
  currentDate.setHours(currentDate.getHours() + timeComponents['h']);
  currentDate.setMinutes(currentDate.getMinutes() + timeComponents['m']);
  currentDate.setSeconds(currentDate.getSeconds() + timeComponents['s']);

  return isNaN(currentDate.getTime()) ? null : currentDate;
}
