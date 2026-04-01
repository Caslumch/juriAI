"use client";

import { useState, useCallback, useEffect } from "react";
import { FilterBar, FilterSelect, Pagination } from "@/components/admin/shared";
import { DocumentCard } from "./DocumentCard";
import { DocumentViewer } from "./DocumentViewer";
import { getDocuments, type DocumentsResult } from "@/app/actions/admin/documents";

export function DocumentManager() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<DocumentsResult | null>(null);
  const [loading, setLoading] = useState(true);

  const [viewingDocId, setViewingDocId] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDocuments({
        search: search || undefined,
        fileType: typeFilter !== "ALL" ? typeFilter : undefined,
        page,
        perPage: 20,
      });
      setResult(data);
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, page]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    setPage(1);
  }, [search, typeFilter]);

  const totalPages = result ? Math.ceil(result.total / result.perPage) : 0;

  return (
    <div>
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome de arquivo..."
        filters={
          <FilterSelect
            value={typeFilter}
            onChange={setTypeFilter}
            label="Filtrar por tipo"
            options={[
              { value: "ALL", label: "Todos os tipos" },
              { value: "PDF", label: "PDF" },
              { value: "IMAGE", label: "Imagem" },
            ]}
          />
        }
      />

      {loading && !result ? (
        <div className="flex items-center justify-center py-[var(--space-8)]">
          <span className="text-small text-text-tertiary">Carregando...</span>
        </div>
      ) : (
        <>
          {result && (
            <div className="mb-[var(--space-4)]">
              <span className="text-micro text-text-tertiary">
                {result.total} documento{result.total !== 1 ? "s" : ""}{" "}
                encontrado{result.total !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--space-4)]">
            {(result?.documents ?? []).map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onClick={() => setViewingDocId(doc.id)}
              />
            ))}
          </div>

          {result?.documents.length === 0 && (
            <div className="text-center py-[var(--space-8)]">
              <p className="text-small text-text-tertiary">
                Nenhum documento encontrado.
              </p>
            </div>
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      {viewingDocId && (
        <DocumentViewer
          documentId={viewingDocId}
          open={!!viewingDocId}
          onClose={() => setViewingDocId(null)}
        />
      )}
    </div>
  );
}
