"use client";

import { useState, useMemo, useCallback } from "react";
import { calculateRate, calculateReverse } from "@/lib/calculate";
import { useExchangeRate } from "@/hooks/use-exchange-rate";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Preloader } from "@/components/ui/preloader";

type Mode = "time-to-cost" | "cost-to-time";
type Currency = "USD" | "PHP";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function parseNonNegative(val: string): number {
  const n = Number(val);
  if (isNaN(n) || n < 0) return 0;
  return n;
}

export default function RateCalculator() {
  const [mode, setMode] = useState<Mode>("time-to-cost");

  // Time-to-Cost inputs
  const [rate, setRate] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");

  // Cost-to-Time inputs
  const [targetAmount, setTargetAmount] = useState("");
  const [targetCurrency, setTargetCurrency] = useState<Currency>("PHP");
  const [reverseRate, setReverseRate] = useState("");

  const { rate: phpRate, loading: rateLoading, error: rateError } = useExchangeRate();

  const handleReset = useCallback(() => {
    setRate("");
    setHours("");
    setMinutes("");
    setSeconds("");
    setTargetAmount("");
    setReverseRate("");
  }, []);

  const handleModeSwitch = useCallback(
    (newMode: Mode) => {
      if (newMode !== mode) {
        handleReset();
        setMode(newMode);
      }
    },
    [mode, handleReset]
  );

  const result = useMemo(() => {
    const r = parseNonNegative(rate);
    const h = parseNonNegative(hours);
    const m = clamp(parseNonNegative(minutes), 0, 59);
    const s = clamp(parseNonNegative(seconds), 0, 59);
    return calculateRate(r, h, m, s, phpRate);
  }, [rate, hours, minutes, seconds, phpRate]);

  const reverseResult = useMemo(() => {
    const t = parseNonNegative(targetAmount);
    const r = parseNonNegative(reverseRate);
    return calculateReverse(t, r, phpRate, targetCurrency === "USD");
  }, [targetAmount, reverseRate, phpRate, targetCurrency]);

  return (
    <>
      <Preloader />
      <div className="flex min-h-screen items-center justify-center p-4 transition-all duration-700 delay-[1600ms]">
      <div className="w-full max-w-md space-y-4">
        {/* Header */}
        <div className="space-y-1 text-center py-6">
          <div className="relative w-fit mx-auto">
            {/* Base Layer (Muted) */}
            <h1 className="text-4xl font-bold tracking-tighter lowercase text-foreground/10 italic pr-2">
              equis
            </h1>
            {/* Fill Layer (Solid) */}
            <h1 
              className="absolute inset-0 text-4xl font-bold tracking-tighter lowercase text-foreground italic pr-2"
              style={{
                clipPath: 'inset(0 0 0 0)', // Solid by default in the main header
              }}
            >
              equis
            </h1>
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-medium opacity-60">
            Precision Time Exchange
          </p>
        </div>

        {/* Mode Switch */}
        <div className="flex rounded-none border border-border overflow-hidden bg-muted/20">
          <button
            type="button"
            onClick={() => handleModeSwitch("time-to-cost")}
            className={`flex-1 px-3 py-2 text-[10px] uppercase font-bold tracking-widest transition-colors cursor-pointer ${
              mode === "time-to-cost"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Time → Cost
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch("cost-to-time")}
            className={`flex-1 px-3 py-2 text-[10px] uppercase font-bold tracking-widest transition-colors cursor-pointer border-l border-border ${
              mode === "cost-to-time"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Cost → Time
          </button>
        </div>

        {mode === "time-to-cost" ? (
          <>
            {/* Time-to-Cost Input Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                <div className="space-y-0.5">
                  <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Inputs</CardTitle>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Reset
                </button>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="rate" className="text-[10px] uppercase font-bold text-muted-foreground">Rate per hour (USD)</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                      $
                    </span>
                    <Input
                      id="rate"
                      type="number"
                      min={0}
                      step="0.01"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      className="pl-6 font-mono"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <Separator className="opacity-50" />

                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Time worked</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label
                        htmlFor="hours"
                        className="text-[10px] uppercase tracking-wider text-muted-foreground opacity-60"
                      >
                        Hours
                      </Label>
                      <Input
                        id="hours"
                        type="number"
                        min={0}
                        value={hours}
                        onChange={(e) => setHours(e.target.value)}
                        placeholder="0"
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="minutes"
                        className="text-[10px] uppercase tracking-wider text-muted-foreground opacity-60"
                      >
                        Minutes
                      </Label>
                      <Input
                        id="minutes"
                        type="number"
                        min={0}
                        max={59}
                        value={minutes}
                        onChange={(e) => {
                          const val = clamp(parseNonNegative(e.target.value), 0, 59);
                          setMinutes(String(val));
                        }}
                        placeholder="0"
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="seconds"
                        className="text-[10px] uppercase tracking-wider text-muted-foreground opacity-60"
                      >
                        Seconds
                      </Label>
                      <Input
                        id="seconds"
                        type="number"
                        min={0}
                        max={59}
                        value={seconds}
                        onChange={(e) => {
                          const val = clamp(parseNonNegative(e.target.value), 0, 59);
                          setSeconds(String(val));
                        }}
                        placeholder="0"
                        className="font-mono"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Time-to-Cost Results */}
            <Card>
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Total hours</span>
                  <span className="font-mono text-sm font-semibold tabular-nums">
                    {result.totalHours.toFixed(4)}
                  </span>
                </div>

                <Separator className="opacity-50" />

                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Total cost</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-bold tabular-nums">
                      ${result.totalUSD.toFixed(2)}
                    </span>
                    <Badge variant="outline" className="text-[8px] h-4 rounded-none border-foreground/20">USD</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground opacity-60">Converted</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-semibold tabular-nums text-muted-foreground">
                      ₱{result.totalPHP.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <Badge variant="secondary" className="text-[8px] h-4 rounded-none bg-muted text-muted-foreground">PHP</Badge>
                  </div>
                </div>

                <Separator className="opacity-50" />

                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground opacity-40">
                    Breakdown
                  </span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-0.5">
                      <span className="block text-[10px] uppercase font-bold text-muted-foreground opacity-60">Per minute</span>
                      <span className="font-mono text-xs font-medium tabular-nums">
                        ${result.costPerMinute.toFixed(4)}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="block text-[10px] uppercase font-bold text-muted-foreground opacity-60">Per second</span>
                      <span className="font-mono text-xs font-medium tabular-nums">
                        ${result.costPerSecond.toFixed(6)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t bg-muted/20">
                <span className="text-[9px] uppercase tracking-tight font-medium text-muted-foreground flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${rateLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                  {rateLoading
                    ? "Updating exchange rate…"
                    : rateError
                      ? `1 USD = ${phpRate} PHP (fallback)`
                      : `1 USD = ${phpRate} PHP (live)`}
                </span>
              </CardFooter>
            </Card>
          </>
        ) : (
          <>
            {/* Cost-to-Time Input Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                <div className="space-y-0.5">
                  <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Inputs</CardTitle>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Reset
                </button>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="target-amount" className="text-[10px] uppercase font-bold text-muted-foreground">Target amount</Label>
                    <div className="flex rounded-none border border-border overflow-hidden h-6">
                      <button
                        type="button"
                        onClick={() => setTargetCurrency("PHP")}
                        className={`px-2 text-[9px] font-bold transition-colors cursor-pointer ${
                          targetCurrency === "PHP"
                            ? "bg-foreground text-background"
                            : "bg-transparent text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        PHP
                      </button>
                      <button
                        type="button"
                        onClick={() => setTargetCurrency("USD")}
                        className={`px-2 text-[9px] font-bold transition-colors cursor-pointer border-l border-border ${
                          targetCurrency === "USD"
                            ? "bg-foreground text-background"
                            : "bg-transparent text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        USD
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                      {targetCurrency === "USD" ? "$" : "₱"}
                    </span>
                    <Input
                      id="target-amount"
                      type="number"
                      min={0}
                      step="0.01"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      className="pl-6 font-mono"
                      placeholder={targetCurrency === "USD" ? "400.00" : "20000.00"}
                    />
                  </div>
                </div>

                <Separator className="opacity-50" />

                <div className="space-y-1.5">
                  <Label htmlFor="reverse-rate" className="text-[10px] uppercase font-bold text-muted-foreground">Rate per hour (USD)</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                      $
                    </span>
                    <Input
                      id="reverse-rate"
                      type="number"
                      min={0}
                      step="0.01"
                      value={reverseRate}
                      onChange={(e) => setReverseRate(e.target.value)}
                      className="pl-6 font-mono"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cost-to-Time Results */}
            <Card>
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Total hours needed</span>
                  <span className="font-mono text-sm font-semibold tabular-nums">
                    {reverseResult.totalHours.toFixed(4)}
                  </span>
                </div>

                <Separator className="opacity-50" />

                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground opacity-40">
                    Time breakdown
                  </span>
                  <div className="flex items-center gap-6 justify-center py-2 bg-muted/10 border border-border/50">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="font-mono text-xl font-bold tabular-nums">
                        {reverseResult.hoursComponent}
                      </span>
                      <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Hrs</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="font-mono text-xl font-bold tabular-nums">
                        {reverseResult.minutesComponent}
                      </span>
                      <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Min</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="font-mono text-xl font-bold tabular-nums">
                        {reverseResult.secondsComponent}
                      </span>
                      <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Sec</span>
                    </div>
                  </div>
                </div>

                <Separator className="opacity-50" />

                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground opacity-40">Equivalent Amount</span>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">USD</span>
                    <span className="font-mono text-sm font-semibold tabular-nums">
                      ${reverseResult.totalUSD.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground opacity-60">PHP</span>
                    <span className="font-mono text-sm font-semibold tabular-nums text-muted-foreground">
                      ₱{reverseResult.totalPHP.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t bg-muted/20">
                <span className="text-[9px] uppercase tracking-tight font-medium text-muted-foreground flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${rateLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                  {rateLoading
                    ? "Updating exchange rate…"
                    : rateError
                      ? `1 USD = ${phpRate} PHP (fallback)`
                      : `1 USD = ${phpRate} PHP (live)`}
                </span>
              </CardFooter>
            </Card>
          </>
        )}
      </div>
    </div>
  </>
);
}
