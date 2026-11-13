// Shared mock weather data and lookup helpers, reused by the weather examples.

// ---------------------------------------------------------------------------
// Data types
// ---------------------------------------------------------------------------

/** Current weather for a city. */
export interface CurrentWeather {
  city: string;
  temperatureC: number;
  condition: string;
  humidityPct: number;
}

/** Forecast for a single day. */
export interface ForecastDay {
  day: string;
  minC: number;
  maxC: number;
  condition: string;
}

// ---------------------------------------------------------------------------
// Classes
// ---------------------------------------------------------------------------

/**
 * Simulated (mock) weather service.
 * A real project would call an external weather API here;
 * fixed data is used so the example works without extra dependencies.
 */
export class WeatherService {
  /** Sample current-weather data, keyed by lowercase city name. */
  private readonly current: Record<string, Omit<CurrentWeather, "city">> = {
    bogota: { temperatureC: 14, condition: "cloudy", humidityPct: 78 },
    madrid: { temperatureC: 22, condition: "sunny", humidityPct: 40 },
    "san francisco": { temperatureC: 16, condition: "foggy", humidityPct: 82 },
    monterey: { temperatureC: 17, condition: "partly cloudy", humidityPct: 70 },
    napa: { temperatureC: 24, condition: "sunny", humidityPct: 45 },
    "lake tahoe": { temperatureC: 9, condition: "snow showers", humidityPct: 60 },
    "mexico city": { temperatureC: 19, condition: "partly cloudy", humidityPct: 55 },
  };

  /** Sample forecast data, keyed by lowercase city name. */
  private readonly forecast: Record<string, ForecastDay[]> = {
    bogota: [
      { day: "tomorrow", minC: 9, maxC: 16, condition: "light rain" },
      { day: "day after tomorrow", minC: 10, maxC: 17, condition: "cloudy" },
      { day: "in 3 days", minC: 9, maxC: 18, condition: "partly cloudy" },
    ],
    madrid: [
      { day: "tomorrow", minC: 12, maxC: 24, condition: "sunny" },
      { day: "day after tomorrow", minC: 13, maxC: 25, condition: "sunny" },
      { day: "in 3 days", minC: 11, maxC: 21, condition: "thunderstorms" },
    ],
    "mexico city": [
      { day: "tomorrow", minC: 11, maxC: 23, condition: "sunny" },
      { day: "day after tomorrow", minC: 12, maxC: 22, condition: "afternoon rain" },
      { day: "in 3 days", minC: 11, maxC: 21, condition: "cloudy" },
    ],
  };

  /** Normalizes a city name for lookup (lowercase, trimmed, accents removed). */
  private normalize(city: string): string {
    return city
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
  }

  /** Returns the current weather for a city, or undefined if the city is unknown. */
  getWeather(city: string): CurrentWeather | undefined {
    const data = this.current[this.normalize(city)];
    return data ? { city, ...data } : undefined;
  }

  /** Returns the forecast for the next few days, or undefined if the city is unknown. */
  getForecast(city: string): ForecastDay[] | undefined {
    return this.forecast[this.normalize(city)];
  }
}

/** Serializes a lookup result as JSON, or as an error message when there is no data. */
export function toToolResult(result: unknown, city: string): string {
  return result === undefined
    ? `No data available for the city "${city}".`
    : JSON.stringify(result);
}
