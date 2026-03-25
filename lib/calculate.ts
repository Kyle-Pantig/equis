export interface RateResult {
  totalHours: number;
  totalUSD: number;
  totalPHP: number;
  costPerMinute: number;
  costPerSecond: number;
}

export interface ReverseResult {
  totalHours: number;
  hoursComponent: number;
  minutesComponent: number;
  secondsComponent: number;
  totalUSD: number;
  totalPHP: number;
}

export function calculateRate(
  ratePerHour: number,
  hours: number,
  minutes: number,
  seconds: number,
  phpRate: number
): RateResult {
  const totalHours = hours + minutes / 60 + seconds / 3600;
  const totalUSD = totalHours * ratePerHour;
  const totalPHP = totalUSD * phpRate;
  const costPerMinute = ratePerHour / 60;
  const costPerSecond = ratePerHour / 3600;

  return { totalHours, totalUSD, totalPHP, costPerMinute, costPerSecond };
}

export function calculateReverse(
  targetAmount: number,
  ratePerHour: number,
  phpRate: number,
  isTargetUSD: boolean
): ReverseResult {
  if (ratePerHour <= 0 || phpRate <= 0) {
    return { 
      totalHours: 0, 
      hoursComponent: 0, 
      minutesComponent: 0, 
      secondsComponent: 0, 
      totalUSD: 0,
      totalPHP: 0 
    };
  }

  const totalUSD = isTargetUSD ? targetAmount : targetAmount / phpRate;
  const totalPHP = isTargetUSD ? targetAmount * phpRate : targetAmount;
  const totalHours = totalUSD / ratePerHour;

  const h = Math.floor(totalHours);
  const remainingMinutes = (totalHours - h) * 60;
  const m = Math.floor(remainingMinutes);
  const s = Math.round((remainingMinutes - m) * 60);

  return {
    totalHours,
    hoursComponent: h,
    minutesComponent: m,
    secondsComponent: s,
    totalUSD,
    totalPHP,
  };
}
