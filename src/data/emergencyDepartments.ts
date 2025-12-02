// Emergency departments data with coordinates for navigation
export const HOSPITALS = [
  {
    id: 1,
    name: "City Health Office",
    address: "City Governance Building, Apolinario Mabini Ext, Barangay 5A, San Pablo City, 4000 Laguna",
    phones: ["(049) 562 8116", "(049) 562 7874"],
    latitude: 14.0745024,
    longitude: 121.3229584,
  },
  {
    id: 2,
    name: "SPC Medical Center",
    address: "1, San Pablo City, Laguna",
    phones: ["(049) 310 1100"],
    latitude: 14.0695986,
    longitude: 121.3031756,
  },
  {
    id: 3,
    name: "Community General Hospital",
    address: "38F7+652, Colago Ave, San Pablo City, Laguna",
    phones: ["(049) 573 8014"],
    latitude: 14.0727392,
    longitude: 121.3095099,
  },
];

export const FIRE_DEPARTMENTS = [
  {
    id: 1,
    name: "San Pablo City Bureau of Fire Protection",
    address: "38CG+5C2, Inocencio Barleta St, San Pablo City, Laguna",
    phones: ["0999 578 4943", "(049) 562 7654", "(049) 572 3868"],
    latitude: 14.0705158,
    longitude: 121.3234186,
  },
];

export const POLICE_STATIONS = [
  {
    id: 1,
    name: "San Pablo City Police Station (PNP)",
    address: "Capitol Compound, National Highway, San Pablo, 4000 Laguna",
    phones: ["0908 193 0818", "0927 837 7454", "(049) 562 6474"],
    latitude: null,
    longitude: null,
  },
  {
    id: 2,
    name: "City Traffic Management Office (CTMO)",
    address: "Window 10, One Stop Processing Center, City Hall Compound, San Pablo City, Laguna",
    phones: ["(049) 503 2200"],
    latitude: 14.0747263,
    longitude: 121.2866592,
  },
];

export const POWER = [
  {
    id: 1,
    name: "Meralco Business Center - San Pablo Branch",
    address: "28XR+JW, 1, San Pablo City, 4000 Laguna",
    phones: ["0917 551 6211", "(0920) 971 6211", "(02) 16211"],
    latitude: 14.0493789,
    longitude: 121.3388775,
  },
];

export const DISASTER_RESPONSE = [
  {
    id: 1,
    name: "CDRRMO Operations Center",
    address: "Brgy, City Government Center, PAGCOR Multi-Purpose Evacuation Center, San Pablo City, Laguna",
    phones: ["0998 540 7171", "(049) 800 0405", "(049) 549 0500"],
    latitude: 14.041568,
    longitude: 121.314278,
  },
  {
    id: 2,
    name: "Barangay Radio Control",
    address: "",
    phones: ["(049) 562 3086"],
    latitude: null,
    longitude: null,
  },
  {
    id: 3,
    name: "Department of Social Welfare and Development (DSWD)",
    address: "387W+PRJ, San Pablo City, Laguna",
    phones: ["(049) 562 1575"],
    latitude: 14.0643369,
    longitude: 121.3446315,
  },
];

// Combined export for easy access
export const EMERGENCY_DEPARTMENTS = {
  hospitals: HOSPITALS,
  fire: FIRE_DEPARTMENTS,
  police: POLICE_STATIONS,
  power: POWER,
  disaster: DISASTER_RESPONSE,
};

// Type definitions
export interface Department {
  id: number;
  name: string;
  address: string;
  phones: string[];
  latitude: number | null;
  longitude: number | null;
}

export type DepartmentCategory = 'hospitals' | 'fire' | 'police' | 'power' | 'disaster';