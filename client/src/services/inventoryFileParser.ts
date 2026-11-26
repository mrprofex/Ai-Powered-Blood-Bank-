import readXlsxFile from 'read-excel-file/browser';
import {
  InventoryBatchImportSchema,
  type InventoryBatchImportInput,
} from '../../../shared/schemas/networkSchemas.ts';

type SheetRow = unknown[];

const HEADER_FIELDS: Record<string, keyof InventoryBatchImportInput['rows'][number]> = {
  batchcode: 'batchCode',
  bloodgroup: 'bloodGroup',
  component: 'component',
  unitsavailable: 'unitsAvailable',
  units: 'unitsAvailable',
  expirydate: 'expiryDate',
  storageunit: 'storageUnit',
  location: 'storageUnit',
  city: 'city',
  state: 'state',
  latitude: 'latitude',
  longitude: 'longitude',
};

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        value += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        value += character;
      }
    } else if (character === '"' && value.length === 0) {
      quoted = true;
    } else if (character === ',') {
      row.push(value);
      value = '';
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && text[index + 1] === '\n') index += 1;
      row.push(value);
      if (row.some((cell) => cell.trim().length > 0)) rows.push(row);
      row = [];
      value = '';
    } else {
      value += character;
    }
  }

  if (quoted) throw new Error('CSV contains an unclosed quoted field.');
  row.push(value);
  if (row.some((cell) => cell.trim().length > 0)) rows.push(row);
  return rows;
}

function normalizeHeader(value: unknown): string {
  return String(value ?? '')
    .replace(/^\uFEFF/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function normalizeExpiry(value: unknown): unknown {
  if (!(value instanceof Date)) return value;
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizeCell(field: keyof InventoryBatchImportInput['rows'][number], value: unknown) {
  if (value === null || value === undefined || String(value).trim() === '') return undefined;
  if (field === 'expiryDate') return normalizeExpiry(value);
  return typeof value === 'string' ? value.trim() : value;
}

function parseRows(sheetRows: SheetRow[]): InventoryBatchImportInput {
  const [headerRow, ...dataRows] = sheetRows;
  if (!headerRow?.length) throw new Error('The spreadsheet is empty.');

  const headers = headerRow.map(normalizeHeader);
  const columnIndexes = new Map<string, number>();
  headers.forEach((header, index) => {
    if (header) columnIndexes.set(header, index);
  });

  const requiredFields = [
    'batchcode',
    'bloodgroup',
    'component',
    'unitsavailable',
    'expirydate',
    'storageunit',
    'city',
    'state',
  ];
  const missingFields = requiredFields.filter((field) => !columnIndexes.has(field));
  if (!columnIndexes.has('unitsavailable') && columnIndexes.has('units')) {
    missingFields.splice(missingFields.indexOf('unitsavailable'), 1);
  }
  if (!columnIndexes.has('storageunit') && columnIndexes.has('location')) {
    missingFields.splice(missingFields.indexOf('storageunit'), 1);
  }
  if (missingFields.length) {
    throw new Error(`Missing required columns: ${missingFields.join(', ')}.`);
  }

  const rows = dataRows.map((cells) => {
    const record: Record<string, unknown> = {};
    for (const [header, columnIndex] of columnIndexes) {
      const field = HEADER_FIELDS[header];
      if (!field) continue;
      record[field] = normalizeCell(field, cells[columnIndex]);
    }
    return record;
  });
  const parsed = InventoryBatchImportSchema.safeParse({ rows });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const rowNumber = typeof issue?.path[1] === 'number' ? issue.path[1] + 2 : undefined;
    throw new Error(
      `${rowNumber ? `Row ${rowNumber}: ` : ''}${issue?.message ?? 'Invalid spreadsheet data.'}`,
    );
  }
  return parsed.data;
}

export async function parseInventoryImportFile(file: File): Promise<InventoryBatchImportInput> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension === 'csv') {
    return parseRows(parseCsv(await file.text()));
  }
  if (extension === 'xlsx') {
    const [firstSheet] = await readXlsxFile(file);
    if (!firstSheet) throw new Error('The spreadsheet is empty.');
    return parseRows(firstSheet.data);
  }
  throw new Error('Choose a .csv or .xlsx file.');
}
