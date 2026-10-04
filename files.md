1) types.ts

export interface Client {
  id: string;
  organizationId: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface ListClientsParams {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: Client["status"];
  sort?: "name" | "createdAt" | "updatedAt";
  order?: "asc" | "desc";
}

2) hooks

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import { qk } from "@/lib/query-keys";
import type { Paginated } from "@/lib/types";
import type { Client, ListClientsParams } from "./types";

export function useClients(params: ListClientsParams = {}) {
  return useQuery({
    queryKey: qk.clients.list(params),
    queryFn: async () => {
      const res = await apiGet<Paginated<Client>>("/api/clients", params as any);
      return res;
    },
  });
}

export function useClient(id: string | undefined) {
  return useQuery({
    queryKey: qk.clients.detail(id ?? ""),
    queryFn: async () => {
      const res = await apiGet<{ data: Client }>(`/api/clients/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Client>) => {
      const res = await apiPost<{ data: Client }>("/api/clients", input);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Client created");
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: qk.dashboard.summary });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateClient(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Client>) => {
      const res = await apiPatch<{ data: Client }>(`/api/clients/${id}`, input);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Client updated");
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: qk.dashboard.summary });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useArchiveClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiDelete<{ data: Client }>(`/api/clients/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Client archived");
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: qk.dashboard.summary });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

3) ClientForm.tsx

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Spinner } from "@/components/ui/Spinner";
import { Textarea } from "@/components/ui/Textarea";
import { useCreateClient, useUpdateClient } from "./hooks";
import type { Client } from "./types";

const Schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  company: z.string().trim().max(200).optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).default("ACTIVE"),
  notes: z.string().trim().max(5000).optional().or(z.literal("")),
});

type Values = z.infer<typeof Schema>;

interface Props {
  client?: Client;
  onDone: () => void;
}

export function ClientForm({ client, onDone }: Props) {
  const isEdit = !!client;
  const [submitting, setSubmitting] = useState(false);
  const create = useCreateClient();
  const update = useUpdateClient(client?.id ?? "");

  const form = useForm<Values>({
    resolver: zodResolver(Schema),
    defaultValues: {
      name: client?.name ?? "",
      email: client?.email ?? "",
      phone: client?.phone ?? "",
      company: client?.company ?? "",
      status: client?.status ?? "ACTIVE",
      notes: client?.notes ?? "",
    },
  });

  const onSubmit = async (values: Values) => {
    setSubmitting(true);
    try {
      if (isEdit) await update.mutateAsync(values);
      else await create.mutateAsync(values);
      onDone();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...form.register("email")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...form.register("phone")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <Input id="company" {...form.register("company")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          {...form.register("status")}
        >
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={3} {...form.register("notes")} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? <Spinner /> : isEdit ? "Save changes" : "Create client"}
        </Button>
      </div>
    </form>
  );
}

4) ClientsPage.tsx

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { StatusPill } from "@/features/dashboard/StatusPill";
import { ClientForm } from "@/features/clients/ClientForm";
import { useClients } from "@/features/clients/hooks";
import { formatDate } from "@/lib/format";

export function ClientsPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);

  const params = useMemo(
    () => ({
      page,
      pageSize: 20,
      q: q || undefined,
      status: (statusFilter || undefined) as any,
    }),
    [page, q, statusFilter],
  );

  const { data, isLoading } = useClients(params);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Every client relationship in your organization."
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> New client
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search clients…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !data?.data.length ? (
            <div className="p-6">
              <EmptyState
                icon={<Users className="h-6 w-6" />}
                title="No clients yet"
                description="Add your first client to get started."
                action={
                  <Button onClick={() => setModalOpen(true)}>
                    <Plus className="h-4 w-4" /> New client
                  </Button>
                }
              />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Company</TableHead>
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <Link
                          to={`/app/clients/${c.id}`}
                          className="font-medium hover:text-primary"
                        >
                          {c.name}
                        </Link>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {c.company ?? "—"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {c.email ?? "—"}
                      </TableCell>
                      <TableCell>
                        <StatusPill status={c.status} />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {formatDate(c.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-4">
                <Pagination
                  page={data.meta.page}
                  totalPages={data.meta.totalPages}
                  onChange={setPage}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New client"
        description="Add a client to your organization."
      >
        <ClientForm onDone={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}

5) ClientDetailPage.tsx

import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusPill } from "@/features/dashboard/StatusPill";
import { ClientForm } from "@/features/clients/ClientForm";
import { useArchiveClient, useClient } from "@/features/clients/hooks";
import { formatDate } from "@/lib/format";

export function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: client, isLoading } = useClient(id);
  const archive = useArchiveClient();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleArchive = async () => {
    if (!id) return;
    await archive.mutateAsync(id);
    setConfirmOpen(false);
    navigate("/app/clients");
  };

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!client) {
    return <p className="text-sm text-muted-foreground">Client not found.</p>;
  }

  return (
    <div className="space-y-6">
      <Link to="/app/clients" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to clients
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{client.name}</h1>
          <div className="mt-1 flex items-center gap-2">
            <StatusPill status={client.status} />
            <span className="text-xs text-muted-foreground">
              Added {formatDate(client.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" /> Edit
          </Button>
          <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
            <Trash2 className="h-4 w-4" /> Archive
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <Field label="Email" value={client.email} />
            <Field label="Phone" value={client.phone} />
            <Field label="Company" value={client.company} />
            <Field label="Notes" value={client.notes} multiline />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Related</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Link className="block hover:text-primary" to={`/app/projects?clientId=${client.id}`}>
              → Projects
            </Link>
            <Link className="block hover:text-primary" to={`/app/invoices?clientId=${client.id}`}>
              → Invoices
            </Link>
            <Link className="block hover:text-primary" to={`/app/files?clientId=${client.id}`}>
              → Files
            </Link>
          </CardContent>
        </Card>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit client">
        <ClientForm client={client} onDone={() => setEditOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleArchive}
        title="Archive client?"
        description="Archived clients remain readable but stop appearing in filters."
        confirmLabel="Archive"
        destructive
        loading={archive.isPending}
      />
    </div>
  );
}

function Field({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string | null | undefined;
  multiline?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={multiline ? "whitespace-pre-wrap" : ""}>{value || "—"}</p>
    </div>
  );
}

6) project.schema.ts

import { z } from "zod";

export const ProjectStatusEnum = z.enum([
    "PLANNING",
    "ACTIVE",
    "ON_HOLD",
    "COMPLETED",
    "ARCHIVED",
]);

export const ProjectPriorityEnum = z.enum([
    "LOW",
    "MEDIUM",
    "HIGH",
    "URGENT",
]);

export const CreateProjectSchema = z.object({
    clientId: z.string().min(1),
    name: z.string().trim().min(1).max(200),
    description: z.string().trim().max(5000).optional().or(z.literal("")),
    status: ProjectStatusEnum.default("PLANNING"),
    priority: ProjectPriorityEnum.default("MEDIUM"),
    startDate: z.coerce.date().optional(),
    dueDate: z.coerce.date().optional(),
    budget: z
        .union([z.number(), z.string()])
        .transform((v) => (v === "" ? undefined : String(v)))
        .optional(),
});

export const UpdateProjectSchema = CreateProjectSchema.partial().extend({
    // clientId shouldn't be changed after creation in MVP
    clientId: z.undefined().optional(),
});

export const ListProjectsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    q: z.string().trim().max(200).optional(),
    status: ProjectStatusEnum.optional(),
    priority: ProjectPriorityEnum.optional(),
    clientId: z.string().optional(),
    sort: z.enum(["name", "createdAt", "dueDate", "updatedAt"]).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type ListProjectsQuery = z.infer<typeof ListProjectsQuerySchema>;

7) task.schema.ts

import { z } from "zod";

export const TaskStatusEnum = z.enum([
    "TODO",
    "IN_PROGRESS",
    "REVIEW",
    "COMPLETED",
    "ARCHIVED",
]);

export const TaskPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export const CreateTaskSchema = z.object({
    projectId: z.string().min(1),
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(5000).optional().or(z.literal("")),
    status: TaskStatusEnum.default("TODO"),
    priority: TaskPriorityEnum.default("MEDIUM"),
    dueDate: z.coerce.date().optional(),
    assignedToId: z.string().optional().nullable(),
});

export const UpdateTaskSchema = CreateTaskSchema.partial().extend({
    projectId: z.undefined().optional(),
});

export const ListTasksQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    q: z.string().trim().max(200).optional(),
    status: TaskStatusEnum.optional(),
    priority: TaskPriorityEnum.optional(),
    projectId: z.string().optional(),
    assignedToId: z.string().optional(),
    sort: z.enum(["title", "createdAt", "dueDate", "updatedAt"]).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type ListTasksQuery = z.infer<typeof ListTasksQuerySchema>;