import { initials, formatTime, bookingStart, getJoinTarget, formatCurrency } from "./format";

test("initials", () => {
  expect(initials("Aisha Khan")).toBe("AK");
  expect(initials("  madonna ")).toBe("M");
  expect(initials("")).toBe("?");
});

test("formatTime converts 24h to 12h", () => {
  expect(formatTime("00:05")).toBe("12:05 AM");
  expect(formatTime("13:30")).toBe("1:30 PM");
  expect(formatTime("bad")).toBe("bad");
});

test("bookingStart combines date and HH:MM", () => {
  const d = bookingStart({ meetingDate: "2026-10-25T00:00:00.000Z", timingFrom: "10:30" });
  expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()]).toEqual([2026, 9, 25, 10, 30]);
  expect(bookingStart({ timingFrom: "10:30" })).toBeNull();
});

test("getJoinTarget keeps internal and external links apart", () => {
  expect(getJoinTarget({ _id: "1", status: "pending" })).toBeNull();
  expect(getJoinTarget({ _id: "1", status: "accepted", meetingLink: "" })).toEqual({ internal: "/videocall?booking=1" });
  expect(getJoinTarget({ _id: "1", status: "accepted", meetingLink: "https://meet.google.com/x" })).toEqual({ external: "https://meet.google.com/x" });
});

test("formatCurrency", () => {
  expect(formatCurrency(1200)).toBe("₹1,200");
});
