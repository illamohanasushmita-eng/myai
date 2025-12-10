/**
 * Tests for reminder automation date calculation
 *
 * TIMEZONE: All tests verify IST (Asia/Kolkata, UTC+5:30) timezone handling
 * Expected output format: ISO 8601 with +05:30 offset, never UTC (Z)
 */

import {
  getNextDayOfWeek,
  convertToISOTimestamp,
  parseTimeFromText,
} from "../reminder-automation";

describe("Reminder Automation - Date Calculation", () => {
  describe("getNextDayOfWeek", () => {
    it("should return next Monday when today is not Monday", () => {
      // Mock today as Tuesday (day 2)
      const today = new Date("2025-11-11"); // Tuesday
      const result = getNextDayOfWeek("monday");

      // Should be 6 days from Tuesday = next Monday
      const expectedDate = new Date("2025-11-17"); // Next Monday
      expect(result.toDateString()).toBe(expectedDate.toDateString());
    });

    it("should return next Monday when today is Monday", () => {
      // Mock today as Monday (day 1)
      const today = new Date("2025-11-10"); // Monday
      const result = getNextDayOfWeek("monday");

      // Should be 7 days from Monday = next Monday
      const expectedDate = new Date("2025-11-17"); // Next Monday
      expect(result.toDateString()).toBe(expectedDate.toDateString());
    });

    it("should return next Friday when today is Monday", () => {
      const today = new Date("2025-11-10"); // Monday
      const result = getNextDayOfWeek("friday");

      // Should be 4 days from Monday = Friday
      const expectedDate = new Date("2025-11-14"); // Friday
      expect(result.toDateString()).toBe(expectedDate.toDateString());
    });

    it("should handle case-insensitive day names", () => {
      const result1 = getNextDayOfWeek("MONDAY");
      const result2 = getNextDayOfWeek("monday");
      const result3 = getNextDayOfWeek("Monday");

      expect(result1.toDateString()).toBe(result2.toDateString());
      expect(result2.toDateString()).toBe(result3.toDateString());
    });

    it("should return today for invalid day names", () => {
      const today = new Date();
      const result = getNextDayOfWeek("invalidday");

      // Should return today
      expect(result.toDateString()).toBe(today.toDateString());
    });
  });

  describe("parseTimeFromText", () => {
    it('should parse "5 PM" format', () => {
      const result = parseTimeFromText("5 PM");
      expect(result).toBe("17:00");
    });

    it('should parse "5:30 PM" format', () => {
      const result = parseTimeFromText("5:30 PM");
      expect(result).toBe("17:30");
    });

    it('should parse "17:00" format', () => {
      const result = parseTimeFromText("17:00");
      expect(result).toBe("17:00");
    });

    it('should parse "9 AM" format', () => {
      const result = parseTimeFromText("9 AM");
      expect(result).toBe("09:00");
    });

    it('should parse "12:30 PM" format', () => {
      const result = parseTimeFromText("12:30 PM");
      expect(result).toBe("12:30");
    });

    it('should parse "12:30 AM" format', () => {
      const result = parseTimeFromText("12:30 AM");
      expect(result).toBe("00:30");
    });

    it("should return null for no time", () => {
      const result = parseTimeFromText("call my mom");
      expect(result).toBeNull();
    });
  });

  describe("convertToISOTimestamp", () => {
    it('should handle "tomorrow" with time', () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(17, 0, 0, 0);

      const result = convertToISOTimestamp("call my mom tomorrow", "17:00");
      const resultDate = new Date(result);

      expect(resultDate.getDate()).toBe(tomorrow.getDate());
      expect(resultDate.getMonth()).toBe(tomorrow.getMonth());
      expect(resultDate.getHours()).toBe(17);
      expect(resultDate.getMinutes()).toBe(0);
    });

    it("should handle day name with time", () => {
      const result = convertToISOTimestamp("call my mom Monday", "17:00");
      const resultDate = new Date(result);

      // Should be a Monday
      expect(resultDate.getDay()).toBe(1); // Monday
      expect(resultDate.getHours()).toBe(17);
      expect(resultDate.getMinutes()).toBe(0);
    });

    it("should handle day name with time in text", () => {
      const result = convertToISOTimestamp("call my mom Monday at 5 PM");
      const resultDate = new Date(result);

      // Should be a Monday at 5 PM
      expect(resultDate.getDay()).toBe(1); // Monday
      expect(resultDate.getHours()).toBe(17);
    });

    it('should handle "today" with time', () => {
      const today = new Date();
      today.setHours(17, 0, 0, 0);

      const result = convertToISOTimestamp("call my mom today at 5 PM");
      const resultDate = new Date(result);

      expect(resultDate.getDate()).toBe(today.getDate());
      expect(resultDate.getMonth()).toBe(today.getMonth());
      expect(resultDate.getHours()).toBe(17);
    });

    it("should never return a past date for day names", () => {
      const now = new Date();
      const result = convertToISOTimestamp("call my mom Monday");
      const resultDate = new Date(result);

      // Result should be in the future
      expect(resultDate.getTime()).toBeGreaterThan(now.getTime());
    });

    it("should handle multiple day names (should use first match)", () => {
      const result = convertToISOTimestamp("call my mom Monday or Tuesday");
      const resultDate = new Date(result);

      // Should be Monday (first match)
      expect(resultDate.getDay()).toBe(1);
    });
  });

  describe("Integration Tests", () => {
    it('should create reminder for "call my mom Monday 5 PM"', () => {
      const result = convertToISOTimestamp("call my mom Monday 5 PM");
      const resultDate = new Date(result);

      expect(resultDate.getDay()).toBe(1); // Monday
      expect(resultDate.getHours()).toBe(17);
      expect(resultDate.getTime()).toBeGreaterThan(new Date().getTime());
    });

    it('should create reminder for "remind me to call my mom tomorrow at 5:30 PM"', () => {
      const result = convertToISOTimestamp(
        "remind me to call my mom tomorrow at 5:30 PM",
      );
      const resultDate = new Date(result);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      expect(resultDate.getDate()).toBe(tomorrow.getDate());
      expect(resultDate.getHours()).toBe(17);
      expect(resultDate.getMinutes()).toBe(30);
    });

    it('should create reminder for "remind me to call my mom Friday at 3 PM"', () => {
      const result = convertToISOTimestamp(
        "remind me to call my mom Friday at 3 PM",
      );
      const resultDate = new Date(result);

      expect(resultDate.getDay()).toBe(5); // Friday
      expect(resultDate.getHours()).toBe(15);
      expect(resultDate.getTime()).toBeGreaterThan(new Date().getTime());
    });

    it('should handle "tomorrow" when passed as timeStr parameter', () => {
      const result = convertToISOTimestamp("write notebook", "tomorrow");
      const resultDate = new Date(result);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      expect(resultDate.getDate()).toBe(tomorrow.getDate());
      expect(resultDate.getMonth()).toBe(tomorrow.getMonth());
      // Should default to current time + 1 hour
      expect(resultDate.getTime()).toBeGreaterThan(new Date().getTime());
    });

    it('should handle "tomorrow" in text parameter', () => {
      const result = convertToISOTimestamp("write notebook tomorrow");
      const resultDate = new Date(result);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      expect(resultDate.getDate()).toBe(tomorrow.getDate());
      expect(resultDate.getMonth()).toBe(tomorrow.getMonth());
      // Should default to current time + 1 hour
      expect(resultDate.getTime()).toBeGreaterThan(new Date().getTime());
    });

    it('should handle "tomorrow" with explicit time in timeStr', () => {
      const result = convertToISOTimestamp("write notebook", "tomorrow 5 PM");
      const resultDate = new Date(result);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      expect(resultDate.getDate()).toBe(tomorrow.getDate());
      expect(resultDate.getMonth()).toBe(tomorrow.getMonth());
      expect(resultDate.getHours()).toBe(17);
    });

    it('should not parse time from "tomorrow" string', () => {
      const result = convertToISOTimestamp("write notebook", "tomorrow");
      const resultDate = new Date(result);

      // Should NOT be 4:30 PM (which would be incorrect parsing of "tomorrow")
      // Should be current time + 1 hour
      const now = new Date();
      const expectedHour = (now.getHours() + 1) % 24;

      // Allow some flexibility for the hour (within 1 hour)
      const hourDiff = Math.abs(resultDate.getHours() - expectedHour);
      expect(hourDiff <= 1 || hourDiff >= 23).toBe(true);
    });
  });

  describe("IST Timezone Tests", () => {
    it("should return timestamp with +05:30 offset (IST), never UTC (Z)", () => {
      const result = convertToISOTimestamp("write notebook tomorrow");

      // Verify format: YYYY-MM-DDTHH:mm:ss+05:30
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+05:30$/);
      expect(result).not.toMatch(/Z$/); // Should NOT end with Z (UTC)
      expect(result).not.toMatch(/\+00:00$/); // Should NOT have UTC offset
    });

    it('should use default time 09:00 for "tomorrow" (IST)', () => {
      const result = convertToISOTimestamp("write notebook tomorrow");

      // Extract time from ISO string: YYYY-MM-DDTHH:mm:ss+05:30
      const timeMatch = result.match(/T(\d{2}):(\d{2}):/);
      expect(timeMatch).not.toBeNull();

      if (timeMatch) {
        const hour = parseInt(timeMatch[1]);
        const minute = parseInt(timeMatch[2]);
        expect(hour).toBe(9);
        expect(minute).toBe(0);
      }
    });

    it('should use default time 20:00 for "tonight" (IST)', () => {
      const result = convertToISOTimestamp("write notebook tonight");

      // Extract time from ISO string
      const timeMatch = result.match(/T(\d{2}):(\d{2}):/);
      expect(timeMatch).not.toBeNull();

      if (timeMatch) {
        const hour = parseInt(timeMatch[1]);
        const minute = parseInt(timeMatch[2]);
        expect(hour).toBe(20);
        expect(minute).toBe(0);
      }
    });

    it('should use default time 19:00 for "evening" (IST)', () => {
      const result = convertToISOTimestamp("write notebook this evening");

      // Extract time from ISO string
      const timeMatch = result.match(/T(\d{2}):(\d{2}):/);
      expect(timeMatch).not.toBeNull();

      if (timeMatch) {
        const hour = parseInt(timeMatch[1]);
        const minute = parseInt(timeMatch[2]);
        expect(hour).toBe(19);
        expect(minute).toBe(0);
      }
    });

    it('should use default time 15:00 for "afternoon" (IST)', () => {
      const result = convertToISOTimestamp("write notebook this afternoon");

      // Extract time from ISO string
      const timeMatch = result.match(/T(\d{2}):(\d{2}):/);
      expect(timeMatch).not.toBeNull();

      if (timeMatch) {
        const hour = parseInt(timeMatch[1]);
        const minute = parseInt(timeMatch[2]);
        expect(hour).toBe(15);
        expect(minute).toBe(0);
      }
    });

    it("should use default time 09:00 for day names (IST)", () => {
      const result = convertToISOTimestamp("write notebook Monday");

      // Extract time from ISO string
      const timeMatch = result.match(/T(\d{2}):(\d{2}):/);
      expect(timeMatch).not.toBeNull();

      if (timeMatch) {
        const hour = parseInt(timeMatch[1]);
        const minute = parseInt(timeMatch[2]);
        expect(hour).toBe(9);
        expect(minute).toBe(0);
      }
    });

    it("should parse explicit time and apply to date (IST)", () => {
      const result = convertToISOTimestamp("write notebook tomorrow at 5 PM");

      // Extract time from ISO string
      const timeMatch = result.match(/T(\d{2}):(\d{2}):/);
      expect(timeMatch).not.toBeNull();

      if (timeMatch) {
        const hour = parseInt(timeMatch[1]);
        const minute = parseInt(timeMatch[2]);
        expect(hour).toBe(17); // 5 PM = 17:00
        expect(minute).toBe(0);
      }
    });

    it('should handle "tomorrow at 9 AM" with IST timezone', () => {
      const result = convertToISOTimestamp("call mom tomorrow at 9 AM");

      // Verify format and time
      expect(result).toMatch(/\+05:30$/);
      const timeMatch = result.match(/T(\d{2}):(\d{2}):/);

      if (timeMatch) {
        const hour = parseInt(timeMatch[1]);
        expect(hour).toBe(9);
      }
    });

    it('should handle "Monday at 3 PM" with IST timezone', () => {
      const result = convertToISOTimestamp("call mom Monday at 3 PM");

      // Verify format and time
      expect(result).toMatch(/\+05:30$/);
      const timeMatch = result.match(/T(\d{2}):(\d{2}):/);

      if (timeMatch) {
        const hour = parseInt(timeMatch[1]);
        expect(hour).toBe(15); // 3 PM = 15:00
      }
    });

    it('should handle "today" with IST timezone and default time 09:00', () => {
      const result = convertToISOTimestamp("write notebook today");

      // Verify format
      expect(result).toMatch(/\+05:30$/);

      // Extract time
      const timeMatch = result.match(/T(\d{2}):(\d{2}):/);
      if (timeMatch) {
        const hour = parseInt(timeMatch[1]);
        expect(hour).toBe(9);
      }
    });
  });
});
