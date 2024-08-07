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

// const parseValue = (value: any): any => {
//   // Check if value is a string that ends with 'n', indicating it's a BigInt
//   if (typeof value === "string" && value.endsWith("n")) {
//     // Convert to a regular number
//     return Number(value.slice(0, -1));
//   }
//   return value;
// };

const parseValue = (value: any, type: 'number' | 'bigint'): any => {
  if (typeof value === "string" && value.endsWith("n")) {
    return BigInt(value.slice(0, -1));
  }
  return type === 'bigint' ? BigInt(value) : Number(value);
};

export const readParquetFile = async (file: File, schema?: string): Promise<any[]> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const asyncBuffer = new AsyncBuffer(arrayBuffer);

    return new Promise((resolve, reject) => {
      const options: ParquetReadOptions = {
        file: asyncBuffer,
        onComplete: (rows: any[][]) => {
          if (schema === 'entity') {
            resolve(rows.map(row => ({
              id: row[0],
              name: row[1],
              type: row[2],
              description: row[3],
              human_readable_id: parseValue(row[4], 'number'),
              graph_embedding: row[5],
              text_unit_ids: row[6],
              description_embedding: row[7],
            })));
          } else if (schema === 'relationship') {
            resolve(rows.map(row => ({
              source: row[0],
              target: row[1],
              type: 'RELATED', // Custom field to match neo4j
              weight: row[2],
              description: row[3],
              text_unit_ids: row[4],
              id: row[5],
              human_readable_id: parseValue(row[6], 'number'),
              source_degree: parseValue(row[7], 'number'),
              target_degree: parseValue(row[8], 'number'),
              rank: parseValue(row[9], 'number'),
            })));
          } else if (schema === 'document') {
            resolve(rows.map(row => ({
              id: row[0],
              text_unit_ids: row[1],
              raw_content: row[2],
              title: row[3],
            })));
          } else if (schema === 'text_unit') {
            resolve(rows.map(row => ({
              id: row[0],
              text: row[1],
              n_tokens: parseValue(row[2], 'number'),
              document_ids: row[3],
              entity_ids: row[4],
              relationship_ids: row[5],
            })));
          } else if (schema === 'community') {
            resolve(rows.map(row => ({
              id: row[0],
              title: row[1],
              level: parseValue(row[2], 'number'),
              raw_community: parseValue(row[3], 'number'),
              relationship_ids: row[4],
              text_unit_ids: row[5],
            })));
          } else if (schema === 'community_report') {
            resolve(rows.map(row => ({
              community: parseValue(row[0], 'number'),
              full_content: row[1],
              level: parseValue(row[2], 'number'),
              rank: parseValue(row[3], 'number'),
              title: row[4],
              rank_explanation: row[5],
              summary: row[6],
              findings: row[7].map((finding: any) => ({
                explanation: finding.explanation,
                summary: finding.summary,
              })),
              full_content_json: row[8],
              id: row[9],
              
            })));
          } else if (schema === 'covariate') {
            resolve(rows.map(row => ({
              id: row[0],
              human_readable_id: parseValue(row[1], 'number'),
              covariate_type: row[2],
              type: row[3],
              description: row[4],
              subject_id: row[5],
              subject_type: row[6],
              object_id: row[7],
              object_type: row[8],
              status: row[9],
              start_date: row[10],
              end_date: row[11],
              source_text: row[12],
              text_unit_id: row[13],
              document_ids: row[14],
              n_tokens: parseValue(row[15], 'number'),
            })));
          }
          
          else {
            resolve(rows.map(row => Object.fromEntries(row.map((value, index) => [index, value]))));
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
