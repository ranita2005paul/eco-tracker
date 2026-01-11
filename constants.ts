
import { TransportMode } from './types';

export const EMISSION_FACTORS = {
  TRAVEL: {
    [TransportMode.CAR]: 0.192,   // kg CO2 per km
    [TransportMode.BIKE]: 0.103,  // kg CO2 per km
    [TransportMode.BUS]: 0.027,   // kg CO2 per km
    [TransportMode.TRAIN]: 0.041, // kg CO2 per km
    [TransportMode.FLIGHT]: 0.250 // kg CO2 per km (approx)
  },
  ELECTRICITY: 0.82,             // kg CO2 per kWh (India avg)
  LPG: 42.0                      // kg CO2 per cylinder
};

export const SUSTAINABILITY_FACTS = [
  "The average global carbon footprint is about 4 tons per person.",
  "Using public transport can reduce your travel emissions by up to 75%.",
  "Switching to LED bulbs can save 50-80% on lighting energy.",
  "Reducing meat consumption can lower your food-related carbon footprint significantly.",
  "Planting one tree can absorb about 22kg of CO2 per year."
];

export const REDUCTION_TIPS = [
  { title: "Carpool or Public Transit", description: "Sharing rides drastically reduces the emission per head." },
  { title: "Switch to LEDs", description: "Modern LED bulbs are far more efficient than incandescent ones." },
  { title: "Energy Star Appliances", description: "Use devices that are rated for high energy efficiency." },
  { title: "Solar Power", description: "Consider rooftop solar panels to offset grid electricity." },
  { title: "Eat Local", description: "Reduce 'food miles' by buying locally produced goods." }
];
