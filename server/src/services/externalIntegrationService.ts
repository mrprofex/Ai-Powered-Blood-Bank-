import type { IntegrationReadiness } from '../../../shared/types/network.ts';
import { env } from '../config/env.ts';

export type ExternalInventoryProvider =
  | 'HOSPITAL_SYSTEM'
  | 'BLOOD_BANK_SYSTEM'
  | 'ERAKTKOSH';

export interface ExternalInventoryRecord {
  externalId: string;
  batchCode: string;
  bloodGroup: string;
  component: string;
  unitsAvailable: number;
  expiryDate: string;
  city: string;
  state: string;
}

export interface ExternalInventorySyncResult {
  records: ExternalInventoryRecord[];
  sourceSystem: string;
  synchronizedAt: string;
}

export interface ExternalInventoryAdapter {
  provider: ExternalInventoryProvider;
  syncInventory(): Promise<ExternalInventorySyncResult>;
}

function providerReadiness(
  provider: IntegrationReadiness['provider'],
  baseUrl: string,
  apiKey: string,
  instructions: string,
): IntegrationReadiness {
  const hasUrl = baseUrl.trim().length > 0;
  const hasKey = apiKey.trim().length > 0;
  const completeConfiguration = hasUrl && hasKey;
  return {
    provider,
    status:
      completeConfiguration || hasUrl || hasKey
        ? 'CONFIGURED_NOT_VERIFIED'
        : 'READY_FOR_AUTHORIZED_SETUP',
    configured: completeConfiguration,
    message:
      completeConfiguration
        ? `${instructions} Credentials are present, but no provider-specific adapter has been authorized or verified.`
        : hasUrl || hasKey
          ? `${instructions} Configuration is incomplete; no requests will be made.`
          : instructions,
  };
}

export function getIntegrationReadiness(): IntegrationReadiness[] {
  return [
    providerReadiness(
      'HOSPITAL_SYSTEM',
      env.HOSPITAL_SYSTEM_API_BASE_URL,
      env.HOSPITAL_SYSTEM_API_KEY,
      'Requires the hospital system owner to provide an approved API contract and credentials.',
    ),
    providerReadiness(
      'BLOOD_BANK_SYSTEM',
      env.BLOOD_BANK_SYSTEM_API_BASE_URL,
      env.BLOOD_BANK_SYSTEM_API_KEY,
      'Requires the blood-bank system owner to provide an approved API contract and credentials.',
    ),
    providerReadiness(
      'ERAKTKOSH',
      env.ERAKTKOSH_API_BASE_URL,
      env.ERAKTKOSH_API_KEY,
      'Requires official e-RaktKosh onboarding, permission, and documented API specifications; no endpoints are assumed.',
    ),
    {
      provider: 'GEMINI',
      status: env.GEMINI_API_KEY ? 'CONFIGURED_NOT_VERIFIED' : 'READY_FOR_AUTHORIZED_SETUP',
      configured: Boolean(env.GEMINI_API_KEY),
      message: env.GEMINI_API_KEY
        ? 'Gemini can provide a clearly labeled narrative summary; numeric forecasts remain deterministic demo estimates.'
        : 'Optional Gemini API key not configured; deterministic demo forecasts remain available.',
    },
  ];
}
