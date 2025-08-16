import {
  formatCurrency,
  generateAccountNumber,
  generateRoutingNumber,
  cn,
} from "@/lib/utils"

describe("Utils Functions", () => {
  describe("formatCurrency", () => {
    it("should format positive numbers as USD currency", () => {
      expect(formatCurrency(1000)).toBe("$1,000.00")
      expect(formatCurrency(1000.5)).toBe("$1,000.50")
      expect(formatCurrency(0)).toBe("$0.00")
    })

    it("should format negative numbers correctly", () => {
      expect(formatCurrency(-500)).toBe("-$500.00")
    })

    it("should handle decimal places correctly", () => {
      expect(formatCurrency(10.99)).toBe("$10.99")
      expect(formatCurrency(10.9)).toBe("$10.90")
    })

    it("should handle large numbers", () => {
      expect(formatCurrency(1000000)).toBe("$1,000,000.00")
    })
  })

  describe("generateAccountNumber", () => {
    it("should generate a 10-digit account number", () => {
      const accountNumber = generateAccountNumber()
      expect(accountNumber).toHaveLength(10)
      expect(/^\d{10}$/.test(accountNumber)).toBe(true)
    })

    it("should generate unique account numbers", () => {
      const numbers = new Set()
      for (let i = 0; i < 100; i++) {
        numbers.add(generateAccountNumber())
      }
      // Should have high uniqueness (allowing for very small chance of collision)
      expect(numbers.size).toBeGreaterThan(95)
    })

    it("should not start with 0 (basic validation)", () => {
      const accountNumber = generateAccountNumber()
      expect(accountNumber[0]).not.toBe("0")
    })
  })

  describe("generateRoutingNumber", () => {
    it("should return the demo routing number", () => {
      expect(generateRoutingNumber()).toBe("021000021")
    })

    it("should always return the same routing number", () => {
      const routing1 = generateRoutingNumber()
      const routing2 = generateRoutingNumber()
      expect(routing1).toBe(routing2)
    })
  })

  describe("cn (className utility)", () => {
    it("should merge class names correctly", () => {
      expect(cn("bg-red-500", "text-white")).toBe("bg-red-500 text-white")
    })

    it("should handle conditional classes", () => {
      expect(cn("base-class", true && "conditional-class")).toBe(
        "base-class conditional-class"
      )
      expect(cn("base-class", false && "conditional-class")).toBe("base-class")
    })

    it("should handle Tailwind conflicts by prioritizing later classes", () => {
      const result = cn("bg-red-500", "bg-blue-500")
      expect(result).toBe("bg-blue-500")
    })

    it("should handle undefined and null values", () => {
      expect(cn("base-class", undefined, null, "valid-class")).toBe(
        "base-class valid-class"
      )
    })
  })
})
