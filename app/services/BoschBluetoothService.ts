export type BoschConnectionStatus =
  | 'idle'
  | 'unsupported'
  | 'searching'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error';

export type BoschMeasurement = {
  millimeters: number;
  rawText: string;
  createdAt: string;
};

export type BoschDeviceInfo = {
  name: string;
  id: string;
  battery?: number;
};

type Listener = (measurement: BoschMeasurement) => void;
type StatusListener = (status: BoschConnectionStatus, message?: string) => void;

declare global {
  interface Navigator {
    bluetooth?: any;
  }
}

class BoschBluetoothService {
  private device: any = null;
  private server: any = null;
  private status: BoschConnectionStatus = 'idle';
  private measurementListeners: Listener[] = [];
  private statusListeners: StatusListener[] = [];
  private simulationTimer: number | null = null;

  getStatus() {
    return this.status;
  }

  isSupported() {
    return typeof navigator !== 'undefined' && !!navigator.bluetooth;
  }

  onMeasurement(listener: Listener) {
    this.measurementListeners.push(listener);

    return () => {
      this.measurementListeners = this.measurementListeners.filter((l) => l !== listener);
    };
  }

  onStatus(listener: StatusListener) {
    this.statusListeners.push(listener);

    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== listener);
    };
  }

  private setStatus(status: BoschConnectionStatus, message?: string) {
    this.status = status;
    this.statusListeners.forEach((listener) => listener(status, message));
  }

  private emitMeasurement(mm: number) {
    const clean = Math.round(Number(mm));

    if (!Number.isFinite(clean) || clean <= 0) return;

    const measurement: BoschMeasurement = {
      millimeters: clean,
      rawText: `${clean} mm`,
      createdAt: new Date().toISOString(),
    };

    this.measurementListeners.forEach((listener) => listener(measurement));
  }

  async connect(): Promise<BoschDeviceInfo | null> {
    if (!this.isSupported()) {
      this.setStatus(
        'unsupported',
        'Bluetooth wird von diesem Browser nicht unterstützt. Für echte Verbindung später Android-App nutzen.'
      );

      return null;
    }

    try {
      this.setStatus('searching', 'Bosch-Gerät wird gesucht...');

      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'Bosch' },
          { namePrefix: 'GLM' },
          { namePrefix: 'UniversalDistance' },
        ],
        optionalServices: [
          'battery_service',
          'device_information',
          '0000ffe0-0000-1000-8000-00805f9b34fb',
          '0000fff0-0000-1000-8000-00805f9b34fb',
        ],
      });

      this.device.addEventListener('gattserverdisconnected', () => {
        this.stopSimulation();
        this.setStatus('disconnected', 'Bosch-Gerät wurde getrennt.');
      });

      this.setStatus('connecting', 'Verbindung wird aufgebaut...');

      this.server = await this.device.gatt.connect();

      let battery: number | undefined;

      try {
        const batteryService = await this.server.getPrimaryService('battery_service');
        const batteryChar = await batteryService.getCharacteristic('battery_level');
        const value = await batteryChar.readValue();
        battery = value.getUint8(0);
      } catch {
        battery = undefined;
      }

      this.setStatus('connected', 'Bosch verbunden.');

      return {
        name: this.device.name || 'Bosch UniversalDistance',
        id: this.device.id || 'bosch-device',
        battery,
      };
    } catch (error) {
      this.setStatus(
        'error',
        'Verbindung konnte nicht aufgebaut werden. Gerät einschalten und Bluetooth aktivieren.'
      );

      return null;
    }
  }

  async disconnect() {
    this.stopSimulation();

    try {
      if (this.device?.gatt?.connected) {
        this.device.gatt.disconnect();
      }
    } catch {}

    this.device = null;
    this.server = null;
    this.setStatus('disconnected', 'Verbindung getrennt.');
  }

  async startLiveMeasurement() {
    if (!this.server) {
      this.setStatus('error', 'Kein Bosch-Gerät verbunden.');
      return;
    }

    /*
      Wichtig:
      Bosch UniversalDistance nutzt je nach Modell/Firmware eigene Bluetooth-Dienste.
      Sobald wir die echten Service-/Characteristic-UUIDs haben, lesen wir hier echte Messwerte.

      Bis dahin bleibt die App stabil und kann über Simulation getestet werden.
    */

    this.setStatus('connected', 'Live-Messung vorbereitet.');
  }

  simulateSingleMeasurement() {
    const values = [650, 720, 865, 980, 1050, 1234, 1450, 1487, 1620, 1920, 2100];
    const value = values[Math.floor(Math.random() * values.length)];
    this.emitMeasurement(value);
  }

  startSimulation() {
    this.stopSimulation();

    this.simulateSingleMeasurement();

    this.simulationTimer = window.setInterval(() => {
      this.simulateSingleMeasurement();
    }, 2500);
  }

  stopSimulation() {
    if (this.simulationTimer) {
      window.clearInterval(this.simulationTimer);
      this.simulationTimer = null;
    }
  }

  manualMeasurement(value: number) {
    this.emitMeasurement(value);
  }
}

const boschBluetoothService = new BoschBluetoothService();

export default boschBluetoothService;
