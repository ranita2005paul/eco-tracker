
export enum TransportMode {
  CAR = 'Car',
  BIKE = 'Bike',
  BUS = 'Bus',
  TRAIN = 'Train',
  FLIGHT = 'Flight'
}

export interface TravelData {
  mode: TransportMode;
  distanceKm: number;
  daysPerWeek: number;
}

export interface ElectricityData {
  monthlyKwh: number;
}

export interface LPGData {
  cylindersPerYear: number;
}

export interface UserProfile {
  name: string;
  email: string;
  isLoggedIn: boolean;
}

export interface CarbonState {
  travel: TravelData;
  electricity: ElectricityData;
  lpg: LPGData;
}

export interface EmissionSummary {
  travel: number;
  electricity: number;
  lpg: number;
  total: number;
}
