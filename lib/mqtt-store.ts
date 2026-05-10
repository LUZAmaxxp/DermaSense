import { EventEmitter } from "events";
import type { SensorUpdate } from "@/types/sensor.types";

class SensorStore extends EventEmitter {
  private connected = false;

  setConnected(val: boolean) {
    this.connected = val;
    this.emit("connection-change", val);
  }

  isConnected(): boolean {
    return this.connected;
  }

  // Convenience typed emit
  emitUpdate(update: SensorUpdate) {
    this.emit("sensor-update", update);
  }
}

declare global {
  // eslint-disable-next-line no-var
  var _sensorStore: SensorStore | undefined;
}

// Singleton: reuse across hot-reloads
export const sensorStore: SensorStore =
  global._sensorStore ?? (global._sensorStore = new SensorStore());

sensorStore.setMaxListeners(100); // support many concurrent SSE clients
