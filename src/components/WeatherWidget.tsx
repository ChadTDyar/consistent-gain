import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cloud, CloudRain, Sun, Wind, AlertTriangle } from "lucide-react";

interface WeatherData {
  temp: number;
  condition: string;
  recommendation: string;
  airQuality: "good" | "moderate" | "poor";
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeather();
  }, []);

  const loadWeather = async () => {
    try {
      // Get user's location
      if (!navigator.geolocation) {
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Open-Meteo API (free, no key required)
          const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit`;
          const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi`;

          const [weatherRes, airRes] = await Promise.all([
            fetch(weatherUrl),
            fetch(airUrl),
          ]);

          const weatherData = await weatherRes.json();
          const airData = await airRes.json();

          const temp = Math.round(weatherData.current.temperature_2m);
          const windSpeed = weatherData.current.wind_speed_10m;
          const aqi = airData.current.us_aqi;

          let condition = "Clear";
          let recommendation = "Great day for outdoor activity!";

          // Weather recommendations based on temperature
          if (temp >= 90) {
            condition = "Hot";
            recommendation = "It's very hot—consider indoor workouts or early morning exercise";
          } else if (temp >= 80) {
            condition = "Warm";
            recommendation = "Warm weather—stay hydrated during outdoor activities";
          } else if (temp <= 32) {
            condition = "Cold";
            recommendation = "It's cold—warm up properly before outdoor exercise";
          } else if (windSpeed > 20) {
            condition = "Windy";
            recommendation = "High winds—indoor activities recommended";
          }

          // Air quality recommendations
          let airQuality: "good" | "moderate" | "poor" = "good";
          if (aqi > 100) {
            airQuality = "poor";
            recommendation = "Poor air quality—indoor exercise recommended";
          } else if (aqi > 50) {
            airQuality = "moderate";
            recommendation = "Moderate air quality—limit intense outdoor activity";
          }

          setWeather({
            temp,
            condition,
            recommendation,
            airQuality,
          });
          setLoading(false);
        },
        () => {
          setLoading(false);
        }
      );
    } catch (error) {
      console.error("Weather error:", error);
      setLoading(false);
    }
  };

  if (loading) return null;
  if (!weather) return null;

  const getWeatherIcon = () => {
    if (weather.condition === "Hot" || weather.condition === "Warm") {
      return <Sun className="h-6 w-6 text-warning" />;
    }
    if (weather.condition === "Cold") {
      return <Cloud className="h-6 w-6 text-primary" />;
    }
    if (weather.condition === "Windy") {
      return <Wind className="h-6 w-6 text-muted-foreground" />;
    }
    return <Sun className="h-6 w-6 text-success" />;
  };

  const getAirQualityBadge = () => {
    if (weather.airQuality === "poor") {
      return <Badge variant="destructive">Poor Air Quality</Badge>;
    }
    if (weather.airQuality === "moderate") {
      return <Badge className="bg-warning">Moderate Air Quality</Badge>;
    }
    return <Badge className="bg-success">Good Air Quality</Badge>;
  };

  return (
    <Card className="border-none shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-display font-semibold flex items-center gap-2">
              {getWeatherIcon()}
              Weather Check
            </CardTitle>
            <CardDescription className="text-base">
              {weather.temp}°F • {weather.condition}
            </CardDescription>
          </div>
          {getAirQualityBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-2">
          {weather.airQuality !== "good" && (
            <AlertTriangle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
          )}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {weather.recommendation}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
