import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Pencil, UserPlus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Rol } from "@/lib/auth";
import { ROL_LABELS, getStoredSession } from "@/lib/auth";
import {
  createUser,
  listUsers,
  updateUser,
  type AdminUser,
  type CreateUserInput,
} from "@/lib/admin-api";

const ROLES: Rol[] = ["admin", "mesero", "cocinero"];

type FormState = {
  nombre: string;
  email: string;
  password: string;
  rol: Rol;
  activo: boolean;
};

const emptyForm: FormState = {
  nombre: "",
  email: "",
  password: "",
  rol: "mesero",
  activo: true,
};

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const currentId = getStoredSession()?.user.id;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setUsers(await listUsers());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(user: AdminUser) {
    setEditing(user);
    setForm({
      nombre: user.nombre,
      email: user.email,
      password: "",
      rol: user.rol,
      activo: user.activo,
    });
    setOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing) {
        const patch: Parameters<typeof updateUser>[1] = {
          nombre: form.nombre.trim(),
          email: form.email.trim(),
          rol: form.rol,
          activo: form.activo,
        };
        if (form.password.trim()) patch.password = form.password;
        await updateUser(editing.id, patch);
        toast.success("Usuario actualizado");
      } else {
        const input: CreateUserInput = {
          nombre: form.nombre.trim(),
          email: form.email.trim(),
          password: form.password,
          rol: form.rol,
        };
        await createUser(input);
        toast.success("Usuario creado");
      }
      setOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Equipo</h2>
          <p className="text-sm text-muted-foreground">Meseros, barra y administradores</p>
        </div>
        <Button onClick={openCreate} className="gap-2 w-full sm:w-auto min-h-11 sm:min-h-0">
          <UserPlus className="h-4 w-4" />
          Nuevo usuario
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usuarios registrados</CardTitle>
          <CardDescription>Gestiona accesos y roles del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No hay usuarios</p>
          ) : (
            <>
              <div className="md:hidden space-y-2">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="rounded-xl border p-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {u.nombre}
                        {u.id === currentId && (
                          <span className="ml-1 text-xs text-muted-foreground">(tú)</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="text-xs">{ROL_LABELS[u.rol]}</span>
                        <Badge variant={u.activo ? "secondary" : "outline"} className="text-[10px]">
                          {u.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="shrink-0 h-10 w-10"
                      onClick={() => openEdit(u)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 pr-4">Nombre</th>
                      <th className="pb-2 pr-4">Correo</th>
                      <th className="pb-2 pr-4">Rol</th>
                      <th className="pb-2 pr-4">Estado</th>
                      <th className="pb-2 w-20" />
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b last:border-0">
                        <td className="py-3 pr-4 font-medium">
                          {u.nombre}
                          {u.id === currentId && (
                            <span className="ml-2 text-xs text-muted-foreground">(tú)</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">{u.email}</td>
                        <td className="py-3 pr-4">{ROL_LABELS[u.rol]}</td>
                        <td className="py-3 pr-4">
                          <Badge variant={u.activo ? "secondary" : "outline"}>
                            {u.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(u)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                Contraseña {editing && <span className="text-muted-foreground">(opcional)</span>}
              </Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder={editing ? "Dejar vacío para no cambiar" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select value={form.rol} onValueChange={(v) => setForm((f) => ({ ...f, rol: v as Rol }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROL_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {editing && (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label htmlFor="activo">Cuenta activa</Label>
                <Switch
                  id="activo"
                  checked={form.activo}
                  onCheckedChange={(activo) => setForm((f) => ({ ...f, activo }))}
                  disabled={editing.id === currentId}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button
              onClick={() => void handleSave()}
              disabled={
                saving ||
                !form.nombre.trim() ||
                !form.email.trim() ||
                (!editing && form.password.length < 6)
              }
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
