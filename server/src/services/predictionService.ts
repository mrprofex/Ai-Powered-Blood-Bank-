import { GoogleGenAI } from '@google/genai';
import type {
  ShortageForecastItem,
  ShortagePredictionResponse,
} from '../../../shared/types/network.ts';
import { DEMO_BLOOD_INVENTORY, DEMO_NETWORK_SUMMARY } from '../data/demoNetworkData.ts';
import { env } from '../config/env.ts';
import {
  getAvailabilityRecords,
  getExpiryAlerts,
} from './inventoryService.ts';

function riskFromScore(score: number): ShortageForecastItem['riskLevel'] {
  if (score >= 70) return 'CRITICAL';
  if (score >= 40) return 'MODERATE';
  return 'LOW';
}

export function calculateShortageForecasts(): ShortageForecastItem[] {
  const currentRecords = getAvailabilityRecords();
  const expiryAlerts = getExpiryAlerts();
  const componentKeys = new Set(
    currentRecords.map((record) => `${record.bloodGroup}|${record.component}`),
  );
  const forecasts: ShortageForecastItem[] = [];

  for (const key of componentKeys) {
    const [bloodGroup, component] = key.split('|') as [
      ShortageForecastItem['bloodGroup'],
      ShortageForecastItem['component'],
    ];
    const baseline = DEMO_NETWORK_SUMMARY.bloodGroupOverview.find(
      (item) => item.bloodGroup === bloodGroup,
    );
    if (!baseline) continue;

    const baselineComponentUnits = DEMO_BLOOD_INVENTORY
      .filter((record) => record.bloodGroup === bloodGroup && record.component === component)
      .reduce((sum, record) => sum + record.unitsAvailable, 0);
    const currentComponentUnits = currentRecords
      .filter((record) => record.bloodGroup === bloodGroup && record.component === component)
      .reduce((sum, record) => sum + record.unitsAvailable, 0);
    const baselineGroupUnits = DEMO_BLOOD_INVENTORY
      .filter((record) => record.bloodGroup === bloodGroup)
      .reduce((sum, record) => sum + record.unitsAvailable, 0);
    const currentGroupUnits = currentRecords
      .filter((record) => record.bloodGroup === bloodGroup)
      .reduce((sum, record) => sum + record.unitsAvailable, 0);
    const groupNetworkUnits = Math.max(
      0,
      baseline.availableUnits + currentGroupUnits - baselineGroupUnits,
    );
    const componentShare =
      baselineGroupUnits > 0 ? baselineComponentUnits / baselineGroupUnits : 0;
    const componentCurrentUnits =
      baselineComponentUnits > 0
        ? Math.max(0, groupNetworkUnits * componentShare)
        : currentComponentUnits;
    const dailyConsumptionEstimate =
      componentShare > 0
        ? (baseline.availableUnits / Math.max(0.1, baseline.daysOfCover)) * componentShare
        : Math.max(1, componentCurrentUnits / 5);
    const daysOfCover =
      dailyConsumptionEstimate > 0 ? componentCurrentUnits / dailyConsumptionEstimate : 0;
    const expiringWithin72h = expiryAlerts
      .filter((alert) => alert.bloodGroup === bloodGroup && alert.component === component)
      .reduce((sum, alert) => sum + alert.unitsAvailable, 0);
    const projected7DayDemand = Math.ceil(dailyConsumptionEstimate * 7);
    const projected30DayDemand = Math.ceil(dailyConsumptionEstimate * 30);
    const projected7DayDeficit = Math.max(
      0,
      projected7DayDemand + expiringWithin72h - componentCurrentUnits,
    );
    const projected30DayDeficit = Math.max(
      0,
      projected30DayDemand + expiringWithin72h - componentCurrentUnits,
    );
    const coverScore = Math.max(0, 100 - Math.round(daysOfCover * 10));
    const expiryScore =
      componentCurrentUnits > 0
        ? Math.round((expiringWithin72h / componentCurrentUnits) * 25)
        : 25;
    const riskScore = Math.min(100, Math.max(0, coverScore + expiryScore));

    forecasts.push({
      bloodGroup,
      component,
      currentUnits: Math.round(componentCurrentUnits),
      dailyConsumptionEstimate: Math.round(dailyConsumptionEstimate * 10) / 10,
      daysOfCover: Math.round(daysOfCover * 10) / 10,
      expiringWithin72h,
      projected7DayDemand,
      projected30DayDemand,
      projected7DayDeficit,
      projected30DayDeficit,
      riskScore,
      riskLevel: riskFromScore(riskScore),
      explanation:
        `Rules-based demo estimate: ${Math.round(daysOfCover * 10) / 10} days of cover at an estimated ` +
        `${Math.round(dailyConsumptionEstimate * 10) / 10} units/day; ` +
        `${expiringWithin72h} units in the 72-hour expiry window.`,
      region: 'India network',
      isDemoData: true,
    });
  }

  return forecasts.sort(
    (left, right) =>
      right.riskScore - left.riskScore ||
      left.bloodGroup.localeCompare(right.bloodGroup) ||
      left.component.localeCompare(right.component),
  );
}

export async function getShortagePredictionResponse(): Promise<ShortagePredictionResponse> {
  const data = calculateShortageForecasts();
  const computedAt = new Date().toISOString();
  const disclaimer =
    'DEMO DATA ONLY. Forecasts are transparent heuristic estimates, not clinically validated and not a substitute for facility confirmation.';

  if (!env.GEMINI_API_KEY) {
    return {
      predictionMode: 'RULES_BASED_DEMO',
      isDemoData: true,
      disclaimer,
      aiSummary: 'Gemini is not configured. Numeric forecasts use the documented deterministic demo rules.',
      computedAt,
      data,
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    const facts = data.map((item) => ({
      bloodGroup: item.bloodGroup,
      component: item.component,
      units: item.currentUnits,
      daysOfCover: item.daysOfCover,
      expiringWithin72h: item.expiringWithin72h,
      risk: item.riskLevel,
    }));
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents:
        'Summarize these synthetic demo blood-inventory risk facts in at most 3 sentences. ' +
        'Do not invent or alter quantities, do not give clinical or transfusion advice, and state that data is simulated. ' +
        JSON.stringify(facts),
    });
    const aiSummary = response.text?.trim();
    if (!aiSummary) {
      throw new Error('Gemini returned an empty summary.');
    }
    return {
      predictionMode: 'GEMINI_ASSISTED_DEMO',
      isDemoData: true,
      disclaimer,
      aiSummary,
      computedAt,
      data,
    };
  } catch (error) {
    console.error(
      JSON.stringify({
        level: 'warning',
        event: 'gemini_prediction_summary_failed',
        detail: error instanceof Error ? error.message : 'Unknown Gemini error',
        timestamp: new Date().toISOString(),
      }),
    );
    return {
      predictionMode: 'GEMINI_ERROR_RULES_FALLBACK',
      isDemoData: true,
      disclaimer,
      aiSummary: 'Gemini summary unavailable. Numeric forecasts remain deterministic demo estimates.',
      computedAt,
      data,
    };
  }
}
