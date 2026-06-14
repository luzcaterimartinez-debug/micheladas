import type { Comanda, Mesa } from "@/lib/micheladas-store";

import { LS_OUTBOX, notifySyncChange, readLocal, writeLocal } from "./network";

export type OutboxOp =
  | {
      opId: string;
      type: "comanda:create";
      clientId: string;
      payload: Omit<Comanda, "id" | "folio" | "queueOrder" | "createdAt" | "status">;
      createdAt: number;
    }
  | {
      opId: string;
      type: "comanda:patch";
      comandaId: string;
      patch: { status?: Comanda["status"]; mesa?: string; mesaId?: string; cliente?: string };
      createdAt: number;
    }
  | {
      opId: string;
      type: "comanda:delete";
      comandaId: string;
      createdAt: number;
    }
  | {
      opId: string;
      type: "mesa:atendida";
      mesaId: string;
      createdAt: number;
    }
  | {
      opId: string;
      type: "mesa:patch";
      mesaId: string;
      patch: Partial<Mesa>;
      createdAt: number;
    }
  | {
      opId: string;
      type: "inventario:patch";
      key: string;
      stock: number;
      createdAt: number;
    };

function readOutbox(): OutboxOp[] {
  return readLocal<OutboxOp[]>(LS_OUTBOX, []);
}

function writeOutbox(ops: OutboxOp[]): void {
  writeLocal(LS_OUTBOX, ops);
  notifySyncChange();
}

export function getPendingCount(): number {
  return readOutbox().length;
}

export function enqueueOp(op: Omit<OutboxOp, "opId" | "createdAt"> & { opId?: string }): OutboxOp {
  const entry = {
    ...op,
    opId: op.opId ?? crypto.randomUUID(),
    createdAt: Date.now(),
  } as OutboxOp;
  const next = [...readOutbox(), entry].sort((a, b) => a.createdAt - b.createdAt);
  writeOutbox(next);
  return entry;
}

export function removeOp(opId: string): void {
  writeOutbox(readOutbox().filter((o) => o.opId !== opId));
}

export function listOutbox(): OutboxOp[] {
  return readOutbox();
}

export function clearOutbox(): void {
  writeOutbox([]);
}
