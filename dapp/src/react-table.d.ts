import "@tanstack/react-table"

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    style: {
      textAlign: "left" | "center" | "right"
    }
  }
}
