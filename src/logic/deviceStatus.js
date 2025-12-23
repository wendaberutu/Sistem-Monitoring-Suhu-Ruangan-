function parseTimeToday(timeStr) {
  if (!timeStr) return null;

  const [h, m, s] = timeStr.split(":").map(Number);
  if ([h, m, s].some(isNaN)) return null;

  const now = new Date();
  const t = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    h,
    m,
    s
  );

  if (t.getTime() > now.getTime()) {
    t.setDate(t.getDate() - 1);
  }

  return t;
}

export function getDeviceStatus(timeStr) {
  const last = parseTimeToday(timeStr);
  if (!last) return "off";

  const diffMinutes = (Date.now() - last.getTime()) / 60000;

  if (diffMinutes <= 3) return "on";
  if (diffMinutes <= 15) return "standby";
  return "off";
}

export function mapDeviceStatusToMode(deviceStatus) {
  if (deviceStatus === "standby") return "loading";
  if (deviceStatus === "off") return "disconnected";
  return "active";
}
