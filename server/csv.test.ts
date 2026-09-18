import { describe, expect, it } from "vitest";
import { toCsv } from "../shared/csv";

describe("toCsv", () => {
  it("creates an Excel-compatible UTF-8 CSV and escapes quotes", () => {
    const result = toCsv(["Nombre", "Nota"], [["José", 'Pago "verificado"']]);
    expect(result.startsWith("\uFEFF")).toBe(true);
    expect(result).toContain('"Nombre";"Nota"');
    expect(result).toContain('"José";"Pago ""verificado"""');
    expect(result).toContain("\r\n");
  });
});
