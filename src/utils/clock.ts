import { countries } from '../utils/timezones';
import { getCurrent, getNext } from '../utils/time';
import moment from 'moment-timezone';

export function useNext(hours: number[], minutes: number[]) {
  const currentZones = (function () {
    const times = [];

    hours.forEach((hour, index) => {
      countries.forEach(({ timezone, cities }) => {
        const current = getCurrent(timezone, hour, minutes[index]);
        if (current) {
          times.push({
            next: moment().tz(timezone),
            timezone,
            cities,
          });
        }
      });
    });

    return times;
  })();

  const nextZone = (function () {
    const times = [];

    hours.forEach((hour, index) => {
      countries.forEach(({ timezone, cities }) => {
        const next = getNext(timezone, hour, minutes[index]);
        times.push({
          next,
          timezone,
          cities,
        });
      });
    });

    times.sort((a, b) => a.next.unix() - b.next.unix());

    return times;
  })();

  return {
    next: nextZone,
    current: currentZones,
  };
}
