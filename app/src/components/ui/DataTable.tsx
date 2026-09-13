import type { ReactNode } from "react";

export interface Column<T> {
  header: string;
  render: (row: T, index: number) => ReactNode;
  align?: "left" | "right";
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T, index: number) => string;
  dense?: boolean;
}

export default function DataTable<T>({
  columns,
  data,
  rowKey,
  dense,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th
                key={i}
                className={`border-b border-line px-3 ${dense ? "py-1.5" : "py-2.5"} text-[11px] font-medium uppercase tracking-wider text-secondary ${
                  c.align === "right" ? "text-right" : "text-left"
                } ${c.className ?? ""}`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={rowKey(row, index)}
              className="border-b border-line/60 transition-colors last:border-0 hover:bg-white/[0.02]"
            >
              {columns.map((c, j) => (
                <td
                  key={j}
                  className={`px-3 ${dense ? "py-1.5" : "py-2.5"} text-primary ${
                    c.align === "right" ? "text-right" : "text-left"
                  } ${c.className ?? ""}`}
                >
                  {c.render(row, index)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}