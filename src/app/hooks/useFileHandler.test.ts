import { act, renderHook } from "@testing-library/react";
import useFileHandler from "./useFileHandler";
import { readParquetFile } from "../utils/parquet-utils";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({ useNavigate: () => mockNavigate }));
jest.mock("../utils/parquet-utils", () => ({ readParquetFile: jest.fn() }));
const read = readParquetFile as jest.Mock;
const originalFetch = global.fetch;
const entity = (id: string) => ({ id, title: id, type: "ENTITY" });
const file = (name: string, path?: string) => {
  const value = new File([], name);
  if (path) Object.defineProperty(value, "webkitRelativePath", { value: path });
  return value;
};

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
});
afterEach(() => { global.fetch = originalFetch; });

test("Files from two exports cannot be merged into one data type", async () => {
  const { result } = renderHook(useFileHandler);
  await act(async () => {
    expect(await result.current.handleFilesRead([
      file("entities.parquet", "first/output/entities.parquet"),
      file("entities.parquet", "second/output/entities.parquet"),
    ])).toBe(false);
  });
  expect(read).not.toHaveBeenCalled();
  expect(result.current.loadError).toContain("Select one export");
  expect(result.current.entities).toHaveLength(0);
});

test("Legacy and current files cannot both supply the same data type", async () => {
  const { result } = renderHook(useFileHandler);
  await act(async () => {
    await result.current.handleFilesRead([file("entities.parquet"), file("create_final_entities.parquet")]);
  });
  expect(result.current.loadError).toContain("same data type");
  expect(read).not.toHaveBeenCalled();
});

test("Loaded paths and row counts describe the current export", async () => {
  read.mockResolvedValueOnce([entity("a"), entity("b")]).mockResolvedValueOnce([{ id: "ab" }]);
  const { result } = renderHook(useFileHandler);
  await act(async () => {
    expect(await result.current.handleFilesRead([file("entities.parquet", "run/output/entities.parquet"), file("relationships.parquet")])).toBe(true);
  });
  expect(result.current.loadedFiles).toEqual([
    { path: "run/output/entities.parquet", schema: "entity", rows: 2 },
    { path: "relationships.parquet", schema: "relationship", rows: 1 },
  ]);
  expect(result.current.entities).toHaveLength(2);
  expect(result.current.relationships).toHaveLength(1);
});

test("A failed load preserves the previous export and its file counts", async () => {
  read.mockResolvedValueOnce([entity("a")]).mockResolvedValueOnce([entity("b"), entity("b")]);
  const { result } = renderHook(useFileHandler);
  await act(async () => { await result.current.handleFilesRead([file("entities.parquet")]); });
  await act(async () => { await result.current.handleFilesRead([file("entities.parquet")]); });
  expect(result.current.entities.map(item => item.id)).toEqual(["a"]);
  expect(result.current.loadedFiles[0].rows).toBe(1);
  expect(result.current.loadError).toContain("Duplicate id");
});

test("An older load cannot replace a newer user selection", async () => {
  let resolveOld!: (rows: any[]) => void;
  read.mockReturnValueOnce(new Promise(resolve => { resolveOld = resolve; })).mockResolvedValueOnce([entity("new")]);
  const { result } = renderHook(useFileHandler);
  let old!: Promise<boolean>;
  await act(async () => { old = result.current.handleFilesRead([file("entities.parquet")]); });
  await act(async () => { await result.current.handleFilesRead([file("entities.parquet")]); });
  await act(async () => { resolveOld([entity("old")]); expect(await old).toBe(false); });
  expect(result.current.entities.map(item => item.id)).toEqual(["new"]);
});

test("A new selection replaces all tables from the previous export", async () => {
  read.mockResolvedValueOnce([entity("a")]).mockResolvedValueOnce([{ id: "ab" }]).mockResolvedValueOnce([entity("new")]);
  const { result } = renderHook(useFileHandler);
  await act(async () => { await result.current.handleFilesRead([file("entities.parquet"), file("relationships.parquet")]); });
  await act(async () => { await result.current.handleFilesRead([file("entities.parquet")]); });
  expect(result.current.entities[0].id).toBe("new");
  expect(result.current.relationships).toHaveLength(0);
  expect(result.current.loadedFiles).toHaveLength(1);
});

test("Default loading prefers the current filename over its legacy name", async () => {
  (global.fetch as jest.Mock).mockImplementation((path: string, options: any) => Promise.resolve(
    options.method === "HEAD"
      ? { ok: path.endsWith("/entities.parquet"), headers: { get: () => "application/x-parquet" } }
      : { ok: true, arrayBuffer: async () => new ArrayBuffer(0) }
  ));
  read.mockResolvedValue([entity("current")]);
  const { result } = renderHook(useFileHandler);
  await act(async () => { await result.current.loadDefaultFiles(); });
  expect(result.current.entities[0].id).toBe("current");
  expect(result.current.loadedFiles[0].path).toMatch(/\/entities\.parquet$/);
  expect((global.fetch as jest.Mock).mock.calls.some(([path]) => path.endsWith("/create_final_entities.parquet"))).toBe(false);
  expect(mockNavigate).toHaveBeenCalledWith("/graph", { replace: true });
});

test("A parser error is shown and leaves loading state", async () => {
  read.mockRejectedValue(new Error("Invalid parquet file"));
  const { result } = renderHook(useFileHandler);
  await act(async () => { await result.current.handleFilesRead([file("entities.parquet")]); });
  expect(result.current.loadError).toBe("Invalid parquet file");
  expect(result.current.isLoading).toBe(false);
});
