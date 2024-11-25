import { parquetRead, ParquetReadOptions } from "hyparquet";

export class AsyncBuffer {
  private buffer: ArrayBuffer;

  constructor(buffer: ArrayBuffer) {
    this.buffer = buffer;
  }

  async slice(start: number, end: number): Promise<ArrayBuffer> {
    return this.buffer.slice(start, end);
  }

  get byteLength() {
    return this.buffer.byteLength;
  }
}

const parseValue = (value: any, type: "number" | "bigint"): any => {
  if (typeof value === "string" && value.endsWith("n")) {
    return BigInt(value.slice(0, -1));
  }
  return type === "bigint" ? BigInt(value) : Number(value);
};

export const readParquetFile = async (
  file: File | Blob,
  schema?: string
): Promise<any[]> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const asyncBuffer = new AsyncBuffer(arrayBuffer);

    return new Promise((resolve, reject) => {
      const options: ParquetReadOptions = {
        file: asyncBuffer,
        onComplete: (rows: any[][]) => {
          if (schema === "entity") {
            resolve(
              rows.map((row) => ({
                id: row[0],
                human_readable_id: parseValue(row[1], "number"),
                title: row[2],
                type: row[3],
                description: row[4],                                
                text_unit_ids: row[5],                
              }))
            );
          } else if (schema === "relationship") {
            resolve(
              rows.map((row) => ({
                id: row[0],
                human_readable_id: parseValue(row[1], "number"),
                source: row[2],
                target: row[3],
                description: row[4],
                weight: row[5],
                combined_degree: parseValue(row[6], "number"),
                text_unit_ids: row[7],
                type: "RELATED", // Custom field to match neo4j                
              }))
            );
          } else if (schema === "document") {
            resolve(
              rows.map((row) => ({
                id: row[0],
                human_readable_id: parseValue(row[1], "number"),
                title: row[2],
                text: row[3],
                text_unit_ids: row[4],                
              }))
            );
          } else if (schema === "text_unit") {
            resolve(
              rows.map((row) => ({
                id: row[0],
                human_readable_id: parseValue(row[1], "number"),
                text: row[2],
                n_tokens: parseValue(row[3], "number"),
                document_ids: row[4],
                entity_ids: row[5],
                relationship_ids: row[6],
              }))
            );
          } else if (schema === "community") {
            resolve(
              rows.map((row) => ({
                id: row[0],
                human_readable_id: parseValue(row[1], "number"),
                community: parseValue(row[2], "number"),
                level: parseValue(row[3], "number"),
                title: row[4],
                entity_ids: row[5],
                relationship_ids: row[6],
                text_unit_ids: row[7],
                period: row[8],
                size: parseValue(row[9], "number"),
              }))
            );
          } else if (schema === "community_report") {
            resolve(
              rows.map((row) => ({
                id: row[0],
                human_readable_id: parseValue(row[1], "number"),
                community: parseValue(row[2], "number"),
                level: parseValue(row[3], "number"),
                title: row[4],
                summary: row[5],
                full_content: row[6],
                rank: parseValue(row[7], "number"),                
                rank_explanation: row[8],                
                findings: row[9].map((finding: any) => ({
                  explanation: finding.explanation,
                  summary: finding.summary,
                })),
                full_content_json: row[10],  
                period: row[11],
                size: parseValue(row[12], "number"),              
              }))
            );
          } else if (schema === "covariate") {
            resolve(
              rows.map((row) => ({
                id: row[0],
                human_readable_id: parseValue(row[1], "number"),
                covariate_type: row[2],
                type: row[3],
                description: row[4],
                subject_id: row[5],                
                object_id: row[6],                
                status: row[7],
                start_date: row[8],
                end_date: row[9],
                source_text: row[10],
                text_unit_id: row[11],                
              }))
            );
          } else {
            resolve(
              rows.map((row) =>
                Object.fromEntries(row.map((value, index) => [index, value]))
              )
            );
          }
        },
      };
      parquetRead(options).catch(reject);
    });
  } catch (err) {
    console.error("Error reading Parquet file", err);
    return [];
  }
};
