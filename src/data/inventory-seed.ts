import type { InventoryItem } from "./schemas";

const today = new Date().toISOString().slice(0, 10);

export const INV_CATEGORIES = [
  { key: "mcu", label: "MCU / SoC" },
  { key: "ic", label: "IC" },
  { key: "passive", label: "Passive" },
  { key: "sensor", label: "Sensor" },
  { key: "actuator", label: "Motor / Actuator" },
  { key: "power", label: "Power" },
  { key: "connector", label: "Connector / Cable" },
  { key: "module", label: "Module / Breakout" },
  { key: "mech", label: "Mechanical" },
  { key: "consumable", label: "Consumable" },
  { key: "tool", label: "Tool" },
  { key: "other", label: "Other" },
] as const;

export const INV_CAT_LABEL: Record<string, string> = Object.fromEntries(
  INV_CATEGORIES.map((c) => [c.key, c.label]),
);

type SeedSpec = Omit<InventoryItem, "unit" | "tags" | "updated" | "notes"> & {
  notes?: string;
};

const SEED_SPECS: SeedSpec[] = [
  { id: "i-esp32", name: "ESP32-WROOM-32", pn: "ESP32-WROOM-32E", cat: "mcu", qty: 6, min: 2, bin: "A1-2", supplier: "DigiKey", unitCost: 3.95, notes: "Used in bench harness + ECG. Dual core, Wi-Fi+BLE." },
  { id: "i-rp2040", name: "RP2040 chip", pn: "RP2040", cat: "mcu", qty: 4, min: 3, bin: "A1-3", supplier: "Mouser", unitCost: 1.1, notes: "For the breakout v1 build." },
  { id: "i-stm32f4", name: "STM32F411 Black Pill", pn: "STM32F411CEU6", cat: "module", qty: 2, min: 1, bin: "A2-1", supplier: "AliExpress", unitCost: 6.2, notes: "USB-C version." },
  { id: "i-ad8232", name: "AD8232", pn: "AD8232ACPZ-R7", cat: "ic", qty: 3, min: 1, bin: "B1-1", supplier: "DigiKey", unitCost: 5.4, notes: "ECG analog front-end." },
  { id: "i-drv8323", name: "DRV8323", pn: "DRV8323RSRGZR", cat: "ic", qty: 2, min: 2, bin: "B1-2", supplier: "DigiKey", unitCost: 6.8, notes: "3-phase smart gate driver." },
  { id: "i-ina219", name: "INA219 breakout", pn: "Adafruit 904", cat: "module", qty: 2, min: 1, bin: "B2-1", supplier: "Adafruit", unitCost: 9.95, notes: "I²C current/voltage sensor." },
  { id: "i-mpu6050", name: "MPU-6050 IMU", pn: "GY-521", cat: "sensor", qty: 5, min: 2, bin: "B2-3", supplier: "AliExpress", unitCost: 2.3, notes: "6-axis IMU for balancer + arm." },
  { id: "i-ads1115", name: "ADS1115 16-bit ADC", pn: "ADS1115IDGSR", cat: "ic", qty: 4, min: 2, bin: "B1-3", supplier: "LCSC", unitCost: 2.15 },
  { id: "i-dyna", name: "Dynamixel-style servo", pn: "STS3215", cat: "actuator", qty: 6, min: 6, bin: "C1-1", supplier: "AliExpress", unitCost: 18.5, notes: "SO-ARM100 joints." },
  { id: "i-nema17", name: "NEMA17 stepper", pn: "17HS19-2004S1", cat: "actuator", qty: 2, min: 1, bin: "C1-2", supplier: "StepperOnline", unitCost: 13.4 },
  { id: "i-buck", name: "MP1584 buck", pn: "MP1584EN", cat: "power", qty: 8, min: 3, bin: "D1-1", supplier: "AliExpress", unitCost: 0.8, notes: "Adjustable 3A buck." },
  { id: "i-tp4056", name: "TP4056 charger", pn: "TP4056", cat: "power", qty: 10, min: 5, bin: "D1-2", supplier: "AliExpress", unitCost: 0.45 },
  { id: "i-18650", name: "18650 Li-ion", pn: "Samsung 30Q", cat: "power", qty: 4, min: 4, bin: "D2-1", supplier: "IMR", unitCost: 6.5, notes: "3000 mAh, 15A continuous." },
  { id: "i-r1k", name: "1 kΩ 0805 1%", pn: "—", cat: "passive", qty: 180, min: 50, bin: "E1-1", supplier: "LCSC", unitCost: 0.005 },
  { id: "i-r10k", name: "10 kΩ 0805 1%", pn: "—", cat: "passive", qty: 240, min: 50, bin: "E1-2", supplier: "LCSC", unitCost: 0.005 },
  { id: "i-c100n", name: "100 nF 0805 X7R", pn: "—", cat: "passive", qty: 1, min: 50, bin: "E2-1", supplier: "LCSC", unitCost: 0.01, notes: "REORDER — used most of bag on RP2040 breakout." },
  { id: "i-c10u", name: "10 µF 0805 X5R", pn: "—", cat: "passive", qty: 60, min: 25, bin: "E2-2", supplier: "LCSC", unitCost: 0.03 },
  { id: "i-usbc", name: "USB-C receptacle", pn: "TYPE-C-31-M-12", cat: "connector", qty: 8, min: 4, bin: "F1-1", supplier: "LCSC", unitCost: 0.35 },
  { id: "i-jstph", name: "JST-PH 2-pin", pn: "B2B-PH-K-S", cat: "connector", qty: 25, min: 10, bin: "F1-2", supplier: "DigiKey", unitCost: 0.18 },
  { id: "i-solder", name: "Sn63/Pb37 0.5mm", pn: "Kester 24-6337", cat: "consumable", qty: 1, min: 1, bin: "G1-1", supplier: "DigiKey", unitCost: 22, notes: "Spool, ~60% remaining." },
];

export const INV_SEED: InventoryItem[] = SEED_SPECS.map((s) => ({
  unit: "pcs",
  tags: [],
  notes: "",
  updated: today,
  ...s,
}));
