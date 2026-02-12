export const DEMO_ROOM_IDS = [
  "demo-room-001", "demo-room-002", "demo-room-003", "demo-room-004", "demo-room-005",
  "demo-room-006", "demo-room-007", "demo-room-008", "demo-room-009", "demo-room-010",
] as const;

export const DEMO_COMPANY_IDS = [
  "demo-company-room-001", "demo-company-room-002", "demo-company-room-003",
  "demo-company-room-004", "demo-company-room-005", "demo-company-room-006",
  "demo-company-room-007", "demo-company-room-008", "demo-company-room-009",
  "demo-company-room-010",
] as const;

export const GOLDEN_MASTER_COMPANY_ID = "demo-golden-master";
export const GOLDEN_MASTER_USER_ID = "demo-golden-master-admin";

export type DemoRoomId = typeof DEMO_ROOM_IDS[number];
export type DemoCompanyId = typeof DEMO_COMPANY_IDS[number];

export type DemoRoomStatus = "available" | "occupied" | "resetting" | "error";

export interface DemoRoomBooking {
  roomId: string;
  companyId: string;
  demoUsername: string;
  status: DemoRoomStatus;
  assignedProspectEmail: string | null;
  assignedSessionToken: string | null;
  expiresAt: Date | null;
  lastResetAt: Date | null;
  updatedAt: Date;
}

export interface CheckInResponse {
  success: boolean;
  roomId: string;
  companyId: string;
  username: string;
  password: string;
  expiresAt: string;
  message: string;
}

export function isDemoEnabled(): boolean {
  return process.env.ENABLE_DEMO_MODE === "true";
}

export function assertSafeDemoCompanyId(companyId: string): void {
  if (!DEMO_COMPANY_IDS.includes(companyId as DemoCompanyId) && companyId !== GOLDEN_MASTER_COMPANY_ID) {
    throw new Error(`[DEMO SAFETY] Company ID ${companyId} is NOT a demo company. Operation blocked.`);
  }
}

export function assertSafeDemoRoomCompanyId(companyId: string): void {
  if (!DEMO_COMPANY_IDS.includes(companyId as DemoCompanyId)) {
    throw new Error(`[DEMO SAFETY] Company ID ${companyId} is NOT a demo room company. Destructive operation blocked.`);
  }
}
