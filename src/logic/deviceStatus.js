// Mapping status dari API ke mode UI
export function mapDeviceStatusToMode(statusAlat) {
  if (!statusAlat) return "disconnected";

  switch (statusAlat.toLowerCase()) {
    case "on":
      return "active";
    case "standby":
      return "loading";
    case "off":
    default:
      return "disconnected";
  }
}
