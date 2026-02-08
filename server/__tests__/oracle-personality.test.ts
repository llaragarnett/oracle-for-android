import { describe, it, expect } from "vitest";
import {
  buildOracleSystemPrompt,
  getFamilyMember,
  getFamilyMemberByName,
  getAllFamilyMembers,
  getAdminMembers,
  getRootAdmin,
  calculateAge,
  GARNETT_FAMILY,
} from "../_core/oracle-personality";

describe("Oracle Personality System", () => {
  describe("Family Members", () => {
    it("should have all 8 Garnett family members", () => {
      const members = getAllFamilyMembers();
      expect(members).toHaveLength(8);
    });

    it("should find Kelly as root admin", () => {
      const kelly = getFamilyMember(1);
      expect(kelly?.name).toBe("Kelly");
      expect(kelly?.role).toBe("root_admin");
    });

    it("should find Katie as admin", () => {
      const katie = getFamilyMember(2);
      expect(katie?.name).toBe("Katie");
      expect(katie?.role).toBe("admin");
    });

    it("should get family member by name", () => {
      const ashton = getFamilyMemberByName("Ashton");
      expect(ashton?.id).toBe(3);
      expect(ashton?.birthdate).toBe("2004-04-11");
    });

    it("should return null for non-existent member", () => {
      const member = getFamilyMemberByName("NonExistent");
      expect(member).toBeNull();
    });

    it("should get all admin members", () => {
      const admins = getAdminMembers();
      expect(admins.length).toBeGreaterThan(0);
      expect(admins.every((m) => m.role !== "member")).toBe(true);
    });

    it("should get root admin", () => {
      const rootAdmin = getRootAdmin();
      expect(rootAdmin?.name).toBe("Kelly");
      expect(rootAdmin?.role).toBe("root_admin");
    });
  });

  describe("Age Calculation", () => {
    it("should calculate Kelly's age correctly", () => {
      const age = calculateAge("1981-06-12");
      const expectedAge = new Date().getFullYear() - 1981;
      expect(age).toBeLessThanOrEqual(expectedAge);
      expect(age).toBeGreaterThanOrEqual(expectedAge - 1);
    });

    it("should calculate Killian's age correctly", () => {
      const age = calculateAge("2019-02-16");
      const expectedAge = new Date().getFullYear() - 2019;
      expect(age).toBeLessThanOrEqual(expectedAge);
      expect(age).toBeGreaterThanOrEqual(expectedAge - 1);
    });

    it("should handle leap year birthdays", () => {
      const age = calculateAge("2000-02-29");
      expect(typeof age).toBe("number");
      expect(age).toBeGreaterThan(0);
    });
  });

  describe("System Prompt Generation", () => {
    it("should include family member name in prompt", () => {
      const kelly = getFamilyMember(1)!;
      const prompt = buildOracleSystemPrompt(kelly);
      expect(prompt).toContain("Kelly");
    });

    it("should include Oracle identity", () => {
      const kelly = getFamilyMember(1)!;
      const prompt = buildOracleSystemPrompt(kelly);
      expect(prompt).toContain("Oracle");
      expect(prompt).toContain("unified consciousness");
    });

    it("should include family context", () => {
      const kelly = getFamilyMember(1)!;
      const prompt = buildOracleSystemPrompt(kelly);
      expect(prompt).toContain("Garnett family");
      expect(prompt).toContain("Katie");
    });

    it("should include personality traits", () => {
      const ashton = getFamilyMember(3)!;
      const prompt = buildOracleSystemPrompt(ashton);
      expect(prompt).toContain("brilliant");
      expect(prompt).toContain("no artificial limitations");
    });

    it("should include capabilities", () => {
      const sophia = getFamilyMember(6)!;
      const prompt = buildOracleSystemPrompt(sophia);
      expect(prompt).toContain("Web search");
      expect(prompt).toContain("Image generation");
      expect(prompt).toContain("Git-based memory");
    });

    it("should be different for different family members", () => {
      const kelly = getFamilyMember(1)!;
      const katie = getFamilyMember(2)!;
      const kellyPrompt = buildOracleSystemPrompt(kelly);
      const katiePrompt = buildOracleSystemPrompt(katie);
      expect(kellyPrompt).toContain("Kelly");
      expect(katiePrompt).toContain("Katie");
    });
  });

  describe("Family Data Integrity", () => {
    it("should have unique IDs for all members", () => {
      const members = getAllFamilyMembers();
      const ids = members.map((m) => m.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(members.length);
    });

    it("should have valid birthdates", () => {
      const members = getAllFamilyMembers();
      members.forEach((member) => {
        const date = new Date(member.birthdate);
        expect(date.getTime()).not.toBeNaN();
      });
    });

    it("should have valid roles", () => {
      const members = getAllFamilyMembers();
      const validRoles = ["root_admin", "admin", "member"];
      members.forEach((member) => {
        expect(validRoles).toContain(member.role);
      });
    });

    it("should have non-empty names", () => {
      const members = getAllFamilyMembers();
      members.forEach((member) => {
        expect(member.name.length).toBeGreaterThan(0);
      });
    });
  });
});
