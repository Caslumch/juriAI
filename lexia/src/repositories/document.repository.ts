import { prisma } from "./base";

export type DocumentFilters = {
  search?: string;
  fileType?: string;
  page?: number;
  perPage?: number;
};

export const documentRepository = {
  async findById(id: string) {
    return prisma.document.findUnique({
      where: { id },
      select: {
        id: true,
        fileName: true,
        fileUrl: true,
        fileType: true,
        fileSize: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
        extractions: {
          orderBy: { createdAt: "desc" as const },
          select: {
            id: true,
            data: true,
            confidence: true,
            status: true,
            processingTimeMs: true,
            createdAt: true,
          },
        },
      },
    });
  },

  async findMany(filters: DocumentFilters) {
    const where: Record<string, unknown> = {};

    if (filters.search) {
      where.fileName = { contains: filters.search, mode: "insensitive" };
    }

    if (filters.fileType && filters.fileType !== "ALL") {
      if (filters.fileType === "PDF") {
        where.fileType = "application/pdf";
      } else if (filters.fileType === "IMAGE") {
        where.fileType = { startsWith: "image/" };
      }
    }

    const page = filters.page ?? 1;
    const perPage = filters.perPage ?? 20;

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        select: {
          id: true,
          fileName: true,
          fileUrl: true,
          fileType: true,
          fileSize: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
          extractions: {
            orderBy: { createdAt: "desc" as const },
            take: 1,
            select: { status: true, confidence: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.document.count({ where }),
    ]);

    return {
      documents: documents.map((doc) => ({
        id: doc.id,
        fileName: doc.fileName,
        fileUrl: doc.fileUrl,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        createdAt: doc.createdAt,
        user: doc.user,
        latestExtraction: doc.extractions[0] ?? null,
      })),
      total,
      page,
      perPage,
    };
  },

  async count(where?: Record<string, unknown>) {
    return prisma.document.count({ where });
  },
};
