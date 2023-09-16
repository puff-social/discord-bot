export interface APIResponse<T> {
  success: boolean;
  data: T;
}

export interface User {
  name: string;
  image: string;
  flags: number;
  platform_id: string;
}

export interface LeaderboardEntry {
  id: string;
  position: number;
  devices: {
    name: string;
    dabs: number;
    avg_dabs: number;
    model: string;
    firmware: string;
    hardware: string;
    last_active: string;
    dob: string;
    user_id?: string;
    users?: User;
  };
}

export interface DeviceEntry {
  id: string;
  devices: {
    name: string;
    dabs: number;
    avg_dabs: number;
    mac: string;
    model: string;
    firmware: string;
    hardware: string;
    git_hash: string;
    last_active: string;
    last_ip: string;
    dob: string;
    serial_number?: string;
    user_id?: string;
    users?: User;
  };
}
