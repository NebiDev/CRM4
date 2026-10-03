-- CreateTable
CREATE TABLE "_ping" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "_ping_pkey" PRIMARY KEY ("id")
);
