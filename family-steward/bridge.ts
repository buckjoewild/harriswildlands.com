/**
 * Family Steward Bridge
 * 
 * Safe TS wrapper for external AI automation tools.
 * Supports:
 * 1. DrCodePT-Swarm via file-based I/O (opt-in via DRCODEPT_ENABLED env var)
 * 2. Claude Desktop via MCP endpoints
 * 
 * Security: No shell interpolation, fixed script paths, validated inputs
 */

import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

const BRIDGE_DIR = path.resolve(__dirname);
const INPUT_FILE = path.join(BRIDGE_DIR, "input.json");
const OUTPUT_FILE = path.join(BRIDGE_DIR, "output.json");

export interface FamilyExportData {
  exportDate: string;
  members: Array<{
    id: number;
    name: string;
    role: string;
    active: boolean;
  }>;
  logs: Array<{
    date: string;
    energy?: number;
    mood?: number;
    connection?: number;
    topWin?: string;
    topFriction?: string;
  }>;
  drifts: Array<{
    driftType: string;
    severity: string;
    sentence: string;
    acknowledged: boolean;
  }>;
  weeklyStats: {
    completionRate: number;
    avgEnergy: number;
    avgConnection: number;
  };
}

export interface DrCodePTResult {
  success: boolean;
  drifts?: Array<{
    type: string;
    severity: string;
    observation: string;
    suggestions: string[];
  }>;
  summary?: string;
  error?: string;
}

/**
 * Check if DrCodePT bridge is enabled
 */
export function isDrCodePTEnabled(): boolean {
  return process.env.DRCODEPT_ENABLED === "true";
}

/**
 * Export family data to a JSON file for external processing
 */
export async function exportFamilyData(data: FamilyExportData): Promise<string> {
  const sanitizedData = {
    exportDate: data.exportDate,
    members: data.members.map(m => ({
      id: m.id,
      name: String(m.name).slice(0, 100),
      role: String(m.role).slice(0, 50),
      active: Boolean(m.active)
    })),
    logs: data.logs.slice(0, 30).map(l => ({
      date: String(l.date).slice(0, 10),
      energy: typeof l.energy === 'number' ? Math.min(10, Math.max(0, l.energy)) : null,
      mood: typeof l.mood === 'number' ? Math.min(10, Math.max(0, l.mood)) : null,
      connection: typeof l.connection === 'number' ? Math.min(10, Math.max(0, l.connection)) : null,
      topWin: l.topWin ? String(l.topWin).slice(0, 500) : null,
      topFriction: l.topFriction ? String(l.topFriction).slice(0, 500) : null
    })),
    drifts: data.drifts.slice(0, 20).map(d => ({
      driftType: String(d.driftType).slice(0, 50),
      severity: String(d.severity).slice(0, 20),
      sentence: String(d.sentence).slice(0, 500),
      acknowledged: Boolean(d.acknowledged)
    })),
    weeklyStats: {
      completionRate: typeof data.weeklyStats?.completionRate === 'number' ? data.weeklyStats.completionRate : 0,
      avgEnergy: typeof data.weeklyStats?.avgEnergy === 'number' ? data.weeklyStats.avgEnergy : 0,
      avgConnection: typeof data.weeklyStats?.avgConnection === 'number' ? data.weeklyStats.avgConnection : 0
    }
  };

  fs.writeFileSync(INPUT_FILE, JSON.stringify(sanitizedData, null, 2), "utf-8");
  return INPUT_FILE;
}

/**
 * Run DrCodePT analysis via subprocess (file-based I/O only)
 * 
 * This is a controlled bridge that:
 * - Uses fixed script paths (no user input in commands)
 * - Passes data via files only (no shell interpolation)
 * - Validates all inputs before processing
 */
export async function runDrCodePTAnalysis(): Promise<DrCodePTResult> {
  if (!isDrCodePTEnabled()) {
    return { 
      success: false, 
      error: "DrCodePT bridge is not enabled. Set DRCODEPT_ENABLED=true to enable." 
    };
  }

  const drcodeptPath = path.join(BRIDGE_DIR, "DrCodePT-Swarm");
  
  if (!fs.existsSync(drcodeptPath)) {
    return {
      success: false,
      error: "DrCodePT-Swarm not installed. Run: git clone https://github.com/Treytucker05/DrCodePT-Swarm.git family-steward/DrCodePT-Swarm"
    };
  }

  if (!fs.existsSync(INPUT_FILE)) {
    return {
      success: false,
      error: "No input data. Call exportFamilyData() first."
    };
  }

  return new Promise((resolve) => {
    const pythonScript = path.join(drcodeptPath, "analyze_family.py");
    
    if (!fs.existsSync(pythonScript)) {
      resolve({
        success: false,
        error: "analyze_family.py not found in DrCodePT-Swarm directory"
      });
      return;
    }

    const proc = spawn("python3", [pythonScript, INPUT_FILE, OUTPUT_FILE], {
      cwd: drcodeptPath,
      timeout: 60000,
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stderr = "";

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        resolve({
          success: false,
          error: `DrCodePT exited with code ${code}: ${stderr.slice(0, 500)}`
        });
        return;
      }

      try {
        const output = fs.readFileSync(OUTPUT_FILE, "utf-8");
        const result = JSON.parse(output);
        resolve({
          success: true,
          drifts: result.drifts || [],
          summary: result.summary || ""
        });
      } catch (parseError: any) {
        resolve({
          success: false,
          error: `Failed to parse output: ${parseError.message}`
        });
      }
    });

    proc.on("error", (err) => {
      resolve({
        success: false,
        error: `Process error: ${err.message}`
      });
    });
  });
}

/**
 * Read analysis results from output file
 */
export function readAnalysisResults(): DrCodePTResult | null {
  if (!fs.existsSync(OUTPUT_FILE)) {
    return null;
  }

  try {
    const output = fs.readFileSync(OUTPUT_FILE, "utf-8");
    const result = JSON.parse(output);
    return {
      success: true,
      drifts: result.drifts || [],
      summary: result.summary || ""
    };
  } catch {
    return null;
  }
}

/**
 * Clean up temporary files
 */
export function cleanupBridgeFiles(): void {
  try {
    if (fs.existsSync(INPUT_FILE)) fs.unlinkSync(INPUT_FILE);
    if (fs.existsSync(OUTPUT_FILE)) fs.unlinkSync(OUTPUT_FILE);
  } catch {
  }
}
