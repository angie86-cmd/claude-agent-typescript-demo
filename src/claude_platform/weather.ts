import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";

// Cheap model (Haiku) and a low token limit so experimenting costs almost nothing.
const MODEL = "claude-haiku-5-5";
const MAX_TOKENS = 1024;

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

/** Input Claude sends to the tools (both only receive the city). */
interface CityInput {
  city: string;
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

/**
 * Runs the tools that Claude requests.
 * Maps the tool name to a WeatherService call and always returns a string,
 * which is what a `tool_result` expects.
 */
class ToolRunner {
  constructor(private readonly weather: WeatherService) {}

  /** Dispatches the tool by name and serializes the result as JSON. */
  run(name: string, input: CityInput): string {
    switch (name) {
      case "get_weather":
        return this.format(this.weather.getWeather(input.city), input.city);
      case "get_forecast":
        return this.format(this.weather.getForecast(input.city), input.city);
      default:
        return `Unknown tool: ${name}`;
    }
  }

  /** Converts the result to JSON, or to an error message when there is no data. */
  private format(result: unknown, city: string): string {
    return result === undefined
      ? `No data available for the city "${city}".`
      : JSON.stringify(result);
  }
}

// ---------------------------------------------------------------------------
// Tool definitions (sent to Claude on every request)
// ---------------------------------------------------------------------------

/** Tools Claude may ask to use; each describes its name, purpose and parameters. */
const tools: Anthropic.Tool[] = [
  {
    name: "get_weather",
    description: "Get today's current weather for a city.",
    input_schema: {
      type: "object",
      properties: {
        city: { type: "string", description: "The city to check" },
      },
      required: ["city"],
    },
  },
  {
    name: "get_forecast",
    description: "Get the weather forecast for the next few days for a city.",
    input_schema: {
      type: "object",
      properties: {
        city: { type: "string", description: "The city to check" },
      },
      required: ["city"],
    },
  },
];

// ---------------------------------------------------------------------------
// Agent loop
// ---------------------------------------------------------------------------

/**
 * Agentic loop: sends the conversation to Claude; if it asks to use tools,
 * runs them, returns the results and repeats until a final answer arrives.
 */
async function main(): Promise<void> {
  // Fail early if no API key is configured.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("Missing ANTHROPIC_API_KEY. Set it in .env or in your shell.");
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });
  const runner = new ToolRunner(new WeatherService());

  // Conversation history; starts with the user's question.
  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: "What is the weather like in Bogota today, and what will it be like over the next few days?",
    },
  ];

  while (true) {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages,
      tools,
    });

    if (response.stop_reason !== "tool_use") {
      // Claude is done: this is the text of the final answer.
      for (const block of response.content) {
        if (block.type === "text") console.log(block.text);
      }
      break;
    }

    // Save the assistant's turn (including the tool_use blocks) in the history.
    messages.push({ role: "assistant", content: response.content });

    // Run each requested tool and reply with its tool_result,
    // linked by tool_use_id.
    const toolResults: Anthropic.ToolResultBlockParam[] = response.content
      .filter((block): block is Anthropic.ToolUseBlock => block.type === "tool_use")
      .map((block) => ({
        type: "tool_result",
        tool_use_id: block.id,
        content: runner.run(block.name, block.input as CityInput),
      }));

    // Results go back as a user message for the next turn.
    messages.push({ role: "user", content: toolResults });
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
