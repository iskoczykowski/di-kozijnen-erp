// BoschLaserModule.tsx
// Speichern als: app/BoschLaserModule.tsx
// Funktioniert nur in Android Development Build / APK, nicht in Expo Go.

import React, { useEffect, useRef, useState } from "react";
import { Alert, PermissionsAndroid, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BleManager, Device, Characteristic } from "react-native-ble-plx";
import { Buffer } from "buffer";

type Lang = "de" | "nl";

type Props = {
  lang?: Lang;
  activeFieldLabel?: string;
  onMeasure?: (millimeters: number, rawText?: string) => void;
};

type Status = "idle" | "permission" | "scanning" | "connected" | "failed" | "disconnected";

const TEXT = {
  de: {
    title: "Bosch Laser",
    device: "Bosch UniversalDistance 40 C",
    idle: "Nicht verbunden",
    permission: "Berechtigung wird geprüft",
    scanning: "Suche Bosch Gerät...",
    connected: "Verbunden",
    failed: "Verbindung fehlgeschlagen",
    disconnected: "Getrennt",
    connect: "Laser verbinden",
    disconnect: "Trennen",
    test: "Testwert übernehmen",
    lastMeasure: "Letzte Messung",
    activeField: "Aktives Feld",
    noValue: "Noch kein Wert",
    hint: "Bosch einschalten, Bluetooth aktivieren und dann verbinden.",
    permissionDenied: "Bluetooth-Berechtigung wurde nicht erlaubt.",
    noDevice: "Kein Bosch Gerät gefunden.",
  },
  nl: {
    title: "Bosch laser",
    device: "Bosch UniversalDistance 40 C",
    idle: "Niet verbonden",
    permission: "Toestemming wordt gecontroleerd",
    scanning: "Bosch apparaat zoeken...",
    connected: "Verbonden",
    failed: "Verbinding mislukt",
    disconnected: "Verbroken",
    connect: "Laser verbinden",
    disconnect: "Verbreken",
    test: "Testwaarde overnemen",
    lastMeasure: "Laatste meting",
    activeField: "Actief veld",
    noValue: "Nog geen waarde",
    hint: "Bosch aanzetten, Bluetooth activeren en daarna verbinden.",
    permissionDenied: "Bluetooth-toestemming is niet toegestaan.",
    noDevice: "Geen Bosch apparaat gevonden.",
  },
};

function decodeBase64(value?: string | null): string {
  if (!value) return "";
  try {
    return Buffer.from(value, "base64").toString("utf8");
  } catch {
    return "";
  }
}

function parseMillimeters(raw: string): number | null {
  const normalized = raw.replace(",", ".").replace(/\s+/g, " ").trim();

  const mm = normalized.match(/(\d+(?:\.\d+)?)\s*mm/i);
  if (mm) return Math.round(Number(mm[1]));

  const cm = normalized.match(/(\d+(?:\.\d+)?)\s*cm/i);
  if (cm) return Math.round(Number(cm[1]) * 10);

  const m = normalized.match(/(\d+(?:\.\d+)?)\s*m/i);
  if (m) return Math.round(Number(m[1]) * 1000);

  const n = normalized.match(/(\d+(?:\.\d+)?)/);
  if (n) {
    const value = Number(n[1]);
    if (value > 0 && value < 10000) return Math.round(value);
  }

  return null;
}

async function requestPermissions(): Promise<boolean> {
  if (Platform.OS !== "android") return true;

  if (Platform.Version >= 31) {
    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);

    return (
      result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED &&
      result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED
    );
  }

  const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

export default function BoschLaserModule({ lang = "de", activeFieldLabel, onMeasure }: Props) {
  const t = TEXT[lang];
  const managerRef = useRef<BleManager | null>(null);
  const subscriptionsRef = useRef<any[]>([]);

  const [status, setStatus] = useState<Status>("idle");
  const [device, setDevice] = useState<Device | null>(null);
  const [lastRaw, setLastRaw] = useState("");
  const [lastMm, setLastMm] = useState<number | null>(null);

  useEffect(() => {
    managerRef.current = new BleManager();

    return () => {
      subscriptionsRef.current.forEach((s) => {
        try { s.remove(); } catch {}
      });
      managerRef.current?.destroy();
      managerRef.current = null;
    };
  }, []);

  function handleUpdate(characteristic: Characteristic | null, error: any) {
    if (error) return;

    const raw = decodeBase64(characteristic?.value);
    if (!raw) return;

    setLastRaw(raw);

    const mm = parseMillimeters(raw);
    if (mm !== null) {
      setLastMm(mm);
      onMeasure?.(mm, raw);
    }
  }

  async function subscribeAll(connected: Device) {
    const services = await connected.services();

    for (const service of services) {
      const chars = await service.characteristics();

      for (const char of chars) {
        if (char.isNotifiable || char.isIndicatable) {
          const sub = char.monitor(handleUpdate);
          subscriptionsRef.current.push(sub);
        }

        if (char.isReadable) {
          try {
            const readChar = await char.read();
            handleUpdate(readChar, null);
          } catch {}
        }
      }
    }
  }

  async function connect() {
    try {
      setStatus("permission");
      const ok = await requestPermissions();

      if (!ok) {
        setStatus("failed");
        Alert.alert(t.title, t.permissionDenied);
        return;
      }

      const manager = managerRef.current;
      if (!manager) return;

      setStatus("scanning");
      let found = false;

      manager.startDeviceScan(null, null, async (error, scanned) => {
        if (error) {
          setStatus("failed");
          return;
        }

        const name = scanned?.name || scanned?.localName || "";
        const lower = name.toLowerCase();

        const isBosch =
          lower.includes("bosch") ||
          lower.includes("glm") ||
          lower.includes("universal") ||
          lower.includes("distance");

        if (!scanned || !isBosch || found) return;

        found = true;
        manager.stopDeviceScan();

        try {
          const connected = await scanned.connect();
          const ready = await connected.discoverAllServicesAndCharacteristics();

          setDevice(ready);
          setStatus("connected");

          await subscribeAll(ready);
        } catch {
          setStatus("failed");
        }
      });

      setTimeout(() => {
        if (!found) {
          manager.stopDeviceScan();
          setStatus("failed");
          Alert.alert(t.title, t.noDevice);
        }
      }, 15000);
    } catch {
      setStatus("failed");
    }
  }

  async function disconnect() {
    subscriptionsRef.current.forEach((s) => {
      try { s.remove(); } catch {}
    });
    subscriptionsRef.current = [];

    try {
      await device?.cancelConnection();
    } catch {}

    setDevice(null);
    setStatus("disconnected");
  }

  function testMeasure() {
    const value = 1234;
    setLastMm(value);
    setLastRaw("1234 mm");
    onMeasure?.(value, "1234 mm");
  }

  const statusText =
    status === "idle" ? t.idle :
    status === "permission" ? t.permission :
    status === "scanning" ? t.scanning :
    status === "connected" ? t.connected :
    status === "failed" ? t.failed :
    t.disconnected;

  const color =
    status === "connected" ? "#16a34a" :
    status === "permission" || status === "scanning" ? "#d97706" :
    "#dc2626";

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.deviceIcon}>
          <Text style={{ fontSize: 28 }}>📏</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{t.title}</Text>
          <Text style={styles.subtitle}>{t.device}</Text>
          <Text style={[styles.status, { color }]}>● {statusText}</Text>
        </View>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>{t.hint}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>{t.activeField}</Text>
        <Text style={styles.value}>{activeFieldLabel || "-"}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>{t.lastMeasure}</Text>
        <Text style={styles.value}>{lastMm !== null ? `${lastMm} mm` : t.noValue}</Text>
      </View>

      {lastRaw ? (
        <View style={styles.rawBox}>
          <Text style={styles.rawText}>RAW: {lastRaw}</Text>
        </View>
      ) : null}

      <View style={styles.buttons}>
        {status === "connected" ? (
          <TouchableOpacity style={styles.dangerButton} onPress={disconnect}>
            <Text style={styles.buttonText}>{t.disconnect}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.blueButton} onPress={connect}>
            <Text style={styles.buttonText}>{t.connect}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.secondaryButton} onPress={testMeasure}>
          <Text style={styles.secondaryText}>{t.test}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#dfe6f0", borderRadius: 16, padding: 16, marginVertical: 10 },
  header: { flexDirection: "row", gap: 14, alignItems: "center" },
  deviceIcon: { width: 64, height: 84, backgroundColor: "#111827", borderRadius: 12, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "900", color: "#0f172a" },
  subtitle: { color: "#475569", marginTop: 2 },
  status: { marginTop: 8, fontWeight: "900" },
  infoBox: { backgroundColor: "#eff6ff", borderWidth: 1, borderColor: "#bfdbfe", padding: 10, borderRadius: 10, marginTop: 14 },
  infoText: { color: "#1e40af", fontSize: 13 },
  row: { marginTop: 12, flexDirection: "row", justifyContent: "space-between", gap: 12 },
  label: { color: "#64748b", fontWeight: "700" },
  value: { color: "#0f172a", fontWeight: "900" },
  rawBox: { marginTop: 10, padding: 8, backgroundColor: "#f8fafc", borderRadius: 8 },
  rawText: { fontSize: 12, color: "#475569" },
  buttons: { flexDirection: "row", gap: 10, marginTop: 16 },
  blueButton: { backgroundColor: "#2563eb", paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10 },
  dangerButton: { backgroundColor: "#dc2626", paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10 },
  secondaryButton: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#cbd5e1", paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10 },
  buttonText: { color: "#fff", fontWeight: "900" },
  secondaryText: { color: "#0f172a", fontWeight: "900" },
});

