// Source unique : data/teams.json (partagée avec le cron scripts/update.mjs)
import raw from "../data/teams.json";

export type Team = { fr: string; flag: string; elo: number; host?: boolean };
export const TEAMS = raw as Record<string, Team>;

export const isRealTeam = (name: string) => name in TEAMS;
export const frName = (name: string) => TEAMS[name]?.fr ?? name;
export const flagUrl = (name: string, w: 40 | 80 | 160 = 80) =>
  TEAMS[name] ? `https://flagcdn.com/w${w}/${TEAMS[name].flag}.png` : null;
