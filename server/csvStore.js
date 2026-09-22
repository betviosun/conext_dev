import { mkdir, access, appendFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.CONTACT_CSV_DIR || path.join(__dirname, "data");
const CSV_PATH = process.env.CONTACT_CSV_PATH || path.join(DATA_DIR, "contacts.csv");

export const CSV_HEADERS = [
  "id",
  "name",
  "gmail",
  "company",
  "content",
  "created_at",
  "ip"
];

function escapeCsv(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function toRow(fields) {
  return CSV_HEADERS.map((key) => escapeCsv(fields[key])).join(",") + "\n";
}

async function ensureCsv() {
  await mkdir(path.dirname(CSV_PATH), { recursive: true });
  try {
    await access(CSV_PATH);
  } catch {
    await writeFile(CSV_PATH, CSV_HEADERS.join(",") + "\n", "utf8");
  }
}

export async function saveContactRecord({ name, gmail, company, content, ip }) {
  await ensureCsv();
  const record = {
    id: randomUUID(),
    name,
    gmail,
    company: company || "",
    content,
    created_at: new Date().toISOString(),
    ip: ip || ""
  };
  await appendFile(CSV_PATH, toRow(record), "utf8");
  return record;
}

export function getCsvPath() {
  return CSV_PATH;
}
