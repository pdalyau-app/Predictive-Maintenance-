// src/data/connections.ts
import { Connection, ConnectionKind } from "../types-extra";

const KEY = "pm_connections_v1";

function read(): Connection[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Connection[]) : seed();
  } catch {
    return seed();
  }
}

function write(list: Connection[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
}

function seed(): Connection[] {
  const demo: Connection[] = [
    {
      id: "CN-OPCUA-1",
      name: "OPC UA — Main PLC",
      kind: "opcua",
      config: { endpoint: "opc.tcp://192.168.1.10:4840" },
      enabled: true,
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "CN-MQTT-1",
      name: "MQTT — Plant Broker",
      kind: "mqtt",
      config: { url: "mqtt://192.168.1.50", topicPrefix: "site/telemetry" },
      enabled: false,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
  write(demo);
  return demo;
}

let state = read();

export function getConnections(): Connection[] {
  return [...state].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function addConnection(input: {
  name: string;
  kind: ConnectionKind;
  config?: any;
}) {
  const newConn: Connection = {
    id: `CN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    name: input.name,
    kind: input.kind,
    config: input.config ?? {},
    enabled: true,
    createdAt: new Date().toISOString(),
  };
  state = [newConn, ...state];
  write(state);
}

export function toggleConnection(id: string, enabled: boolean) {
  state = state.map((c) => (c.id === id ? { ...c, enabled } : c));
  write(state);
}
