import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";

// Cheap model (Haiku) and a low token limit so experimenting costs almost nothing.
const MODEL = "claude-haiku-5-5";
const MAX_TOKENS = 1024;

// Load .env from the project root no matter which folder the script is run from
// (dotenv would otherwise look in the current working directory only).
config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

// ---------------------------------------------------------------------------
// Data types
// ---------------------------------------------------------------------------

/** Current weather for a city. */
interface CurrentWeather {
  city: string;
  temperatureC: number;
  condition: string;
  humidityPct: number;
}

/** Forecast for a single day. */
interface ForecastDay {
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
class WeatherService {
  /** Sample current-weather data, keyed by lowercase city name. */
  private readonly current: Record<string, Omit<CurrentWeather, "city">> = {
    bogota: { temperatureC: 14, condition: "cloudy", humidityPct: 78 },
    madrid: { temperatureC: 22, condition: "sunny", humidityPct: 40 },
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
function toToolResult(result: unknown, city: string): string {
  return result === undefined
    ? `No data available for the city "${city}".`
    : JSON.stringify(result);
}

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

const weather = new WeatherService();

/** Tool: current weather. The Zod schema is converted to the JSON schema Claude receives. */
const weatherTool = betaZodTool({
  name: "get_weather",
  description: "Get today's current weather for a city.",
  inputSchema: z.object({
    city: z.string().describe("The city to check"),
  }),
  run: async ({ city }) => toToolResult(weather.getWeather(city), city),
});

/** Tool: multi-day forecast. */
const forecastTool = betaZodTool({
  name: "get_forecast",
  description: "Get the weather forecast for the next few days for a city.",
  inputSchema: z.object({
    city: z.string().describe("The city to check"),
  }),
  run: async ({ city }) => toToolResult(weather.getForecast(city), city),
});

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

/**
 * Sends the prompt through the SDK tool runner, which handles the whole loop:
 * it executes the requested tools, returns their results to Claude and repeats
 * until Claude produces a final answer.
 */
async function main(): Promise<void> {
  // Fail early if no API key is configured.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("Missing ANTHROPIC_API_KEY. Set it in .env or in your shell.");
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });

  const runner = client.beta.messages.toolRunner({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [
      {
        role: "user",
        content:
          "What is the weather like in Bogota today, and what will it be like over the next few days?",
      },
    ],
    tools: [weatherTool, forecastTool],
  });

  // Awaiting the runner yields the final message once all tool calls have settled.
  const finalMessage = await runner;

  for (const block of finalMessage.content) {
    if (block.type === "text") console.log(block.text);
  }
}

main().catch((error) => {
  if (error instanceof Anthropic.APIError) {
    console.error(`API error (${error.status}): ${error.message}`);
  } else {
    console.error(error);
  }
  process.exit(1);
});
