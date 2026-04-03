import { FieldRow } from "./FieldRow";
import { fieldLabels } from "./field-labels";
import type { ExtractedField } from "@/shared/schemas/extraction";

export function FieldGroup({
  title,
  groupKey,
  data,
  onEdit,
  editedFields,
}: {
  title: string;
  groupKey: string;
  data: Record<string, ExtractedField | undefined>;
  onEdit: (group: string, field: string, value: string) => void;
  editedFields: Set<string>;
}) {
  const entries = Object.entries(data).filter(
    (entry): entry is [string, ExtractedField] =>
      entry[1] !== undefined && entry[1] !== null,
  );

  if (entries.length === 0) {
    return (
      <div className="py-[var(--space-4)] text-center">
        <p className="text-small text-text-tertiary">
          Nenhum dado de {title.toLowerCase()} encontrado.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {entries.map(([key, field]) => (
        <FieldRow
          key={key}
          label={fieldLabels[key] ?? key}
          field={field}
          fieldKey={key}
          groupKey={groupKey}
          onEdit={onEdit}
          isEdited={editedFields.has(`${groupKey}.${key}`)}
        />
      ))}
    </div>
  );
}
