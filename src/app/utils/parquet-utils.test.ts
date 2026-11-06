import { parquetRead } from "hyparquet";
import { readParquetFile } from "./parquet-utils";

jest.mock("hyparquet", () => ({ parquetRead: jest.fn() }));

test("Relationship types are preserved and absent types use RELATED", async () => {
  (parquetRead as jest.Mock).mockImplementation(options => {
    options.onComplete([
      { id: "a", human_readable_id: 0, combined_degree: 0, source: "a", target: "b", type: "MENTIONS" },
      { id: "b", human_readable_id: 1, combined_degree: 0, source: "a", target: "b" },
    ]);
    return Promise.resolve();
  });
  const file = { arrayBuffer: async () => new ArrayBuffer(0) } as File;
  expect((await readParquetFile(file, "relationship")).map(row => row.type)).toEqual(["MENTIONS", "RELATED"]);
});

test("Unreadable files reject instead of becoming empty tables", async () => {
  const error = new Error("Cannot read bytes");
  const log = jest.spyOn(console, "error").mockImplementation(() => {});
  try {
    await expect(readParquetFile({ arrayBuffer: async () => { throw error; } } as unknown as File)).rejects.toBe(error);
  } finally {
    log.mockRestore();
  }
});
