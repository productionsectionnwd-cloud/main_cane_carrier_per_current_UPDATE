import { RAW_CSV_DATA } from '../data';

export interface DataPoint {
  date: string;
  tcd: number;
  fiber: number;
  carrierCurrent: number;
  levellerCurrent: number;
  cutter1Current: number;
  cutter2Current: number;
  kickerCurrent: number;
}

export interface BucketData {
  range: string;
  tcdPerCarrier: number;
  tcdPerLeveller: number;
  tcdPerCutter1: number;
  tcdPerCutter2: number;
  tcdPerKicker: number;
  count: number;
}

export function parseData(): DataPoint[] {
  const lines = RAW_CSV_DATA.split('\n');
  const result: DataPoint[] = [];

  // Skip header (first 8 lines are part of the complex header or just skip the first few)
  // Actually, the header is: Date,"Cane Crushed (TCD)","Fiber % Cane (%)",...
  // Let's find the first line that starts with a date pattern
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('Total')) continue;

    const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Split by comma not inside quotes
    if (parts.length < 8) continue;

    const date = parts[0].trim();
    const tcdStr = parts[1].replace(/[",\s]/g, '');
    const fiberStr = parts[2].replace(/[",\s]/g, '');
    const carrierStr = parts[3].replace(/[",\s]/g, '');
    const levellerStr = parts[4].replace(/[",\s]/g, '');
    const cutter1Str = parts[5].replace(/[",\s]/g, '');
    const cutter2Str = parts[6].replace(/[",\s]/g, '');
    const kickerStr = parts[7].replace(/[",\s]/g, '');

    if (tcdStr === '-' || carrierStr === '-' || !tcdStr) continue;

    const tcd = parseFloat(tcdStr);
    const fiber = parseFloat(fiberStr);
    const carrier = parseFloat(carrierStr);
    const leveller = parseFloat(levellerStr);
    const cutter1 = parseFloat(cutter1Str);
    const cutter2 = parseFloat(cutter2Str);
    const kicker = parseFloat(kickerStr);

    if (isNaN(tcd) || isNaN(carrier)) continue;

    result.push({
      date,
      tcd,
      fiber,
      carrierCurrent: carrier,
      levellerCurrent: leveller,
      cutter1Current: cutter1,
      cutter2Current: cutter2,
      kickerCurrent: kicker
    });
  }

  return result;
}

export function bucketData(data: DataPoint[]): BucketData[] {
  const start = 900;
  const duration = 500;
  const buckets: Record<number, { sum: Record<string, number>, count: number }> = {};

  data.forEach(d => {
    if (d.tcd < start) return;
    const bucketIndex = Math.floor((d.tcd - start) / duration);
    const bucketStart = start + bucketIndex * duration;

    if (!buckets[bucketStart]) {
      buckets[bucketStart] = {
        sum: {
          carrier: 0,
          leveller: 0,
          cutter1: 0,
          cutter2: 0,
          kicker: 0
        },
        count: 0
      };
    }

    // Calculate TCD Per Current (Efficiency)
    // We avoid division by zero
    buckets[bucketStart].sum.carrier += d.tcd / (d.carrierCurrent || 1);
    buckets[bucketStart].sum.leveller += d.tcd / (d.levellerCurrent || 1);
    buckets[bucketStart].sum.cutter1 += d.tcd / (d.cutter1Current || 1);
    buckets[bucketStart].sum.cutter2 += d.tcd / (d.cutter2Current || 1);
    buckets[bucketStart].sum.kicker += d.tcd / (d.kickerCurrent || 1);
    buckets[bucketStart].count++;
  });

  return Object.keys(buckets)
    .map(Number)
    .sort((a, b) => a - b)
    .map(bucketStart => {
      const b = buckets[bucketStart];
      return {
        range: `${bucketStart}-${bucketStart + duration}`,
        tcdPerCarrier: b.sum.carrier / b.count,
        tcdPerLeveller: b.sum.leveller / b.count,
        tcdPerCutter1: b.sum.cutter1 / b.count,
        tcdPerCutter2: b.sum.cutter2 / b.count,
        tcdPerKicker: b.sum.kicker / b.count,
        count: b.count
      };
    });
}
