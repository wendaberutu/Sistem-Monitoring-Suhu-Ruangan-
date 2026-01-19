// logic/fillPage.js
export function fillPage(page, pageSize) {
  const filled = [...page];

  while (filled.length < pageSize) {
    filled.push({
      no: "—",
      room: "",
      temp: 0,
      rh: 0,
      lumens: 0,
      tempStatus: "normal",
      deviceMode: "empty",
    });
  }

  return filled;
}
