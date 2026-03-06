// src/utils/format.ts

export function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatMinutes(seconds: number): string {
  return `${Math.ceil(seconds / 60)} min`;
}

export function skinTypeName(type: number): string {
  const names: Record<number, string> = {
    1: 'Type I — Very Fair',
    2: 'Type II — Fair',
    3: 'Type III — Medium',
    4: 'Type IV — Olive',
    5: 'Type V — Brown',
    6: 'Type VI — Dark',
  };
  return names[type] ?? 'Unknown';
}

export function skinTypeColor(type: number): string {
  const colors: Record<number, string> = {
    1: '#FDDCB5',
    2: '#F9C58E',
    3: '#E8A87C',
    4: '#C68642',
    5: '#8D5524',
    6: '#3B1F0A',
  };
  return colors[type] ?? '#C68642';
}

export function spfLabel(spf: number): string {
  return spf > 0 ? `SPF ${spf}` : 'None';
}

export function formatTime(isoString: string): string {
  // Extract HH:MM and convert to 12-hour
  const date = new Date(isoString);
  let h = date.getUTCHours();
  const m = String(date.getUTCMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
