import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useComandas, useInventory, useMesas } from "@/lib/micheladas-store";
import { AlertTriangle, ClipboardList, DollarSign, Users, Package } from "lucide-react";

function isToday(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function AdminDashboard() {
  const { comandas } = useComandas();
  const { items } = useInventory();
  const { mesas } = useMesas();

  const hoy = comandas.filter((c) => isToday(c.createdAt));
  const ventasHoy = hoy.reduce((s, c) => s + c.total, 0);
  const pendientes = comandas.filter((c) => c.status === "pendiente").length;
  const listas = comandas.filter((c) => c.status === "lista").length;
  const inventarioBajo = items.filter((i) => i.stock <= (i.minStock ?? 5)).length;
  const mesasOcupadas = mesas.filter((m) => m.estado === "ocupada").length;

  const stats = [
    {
      title: "Ventas hoy",
      value: `$${ventasHoy.toLocaleString("es-MX")}`,
      sub: `${hoy.length} comandas`,
      icon: DollarSign,
    },
    {
      title: "Pendientes",
      value: String(pendientes),
      sub: "por preparar",
      icon: ClipboardList,
    },
    {
      title: "Listas",
      value: String(listas),
      sub: "por entregar",
      icon: Package,
    },
    {
      title: "Mesas ocupadas",
      value: `${mesasOcupadas}/${mesas.length}`,
      sub: "capacidad en uso",
      icon: Users,
    },
    {
      title: "Inventario bajo",
      value: String(inventarioBajo),
      sub: "productos ≤ 5 u.",
      icon: AlertTriangle,
      alert: inventarioBajo > 0,
    },
  ];

  const recientes = comandas.slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Resumen del día</h2>
        <p className="text-sm text-muted-foreground">Vista general de operación e inventario</p>
      </div>

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.title} className={s.alert ? "border-destructive/50" : ""}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
                <Icon className={`h-4 w-4 ${s.alert ? "text-destructive" : "text-muted-foreground"}`} />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comandas recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {recientes.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Sin actividad registrada</p>
          ) : (
            <>
              <div className="md:hidden space-y-2">
                {recientes.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl border p-3 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-sm">#{c.folio} · {c.cliente}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {c.mesa ? `Mesa ${c.mesa}` : "Sin mesa"} ·{" "}
                        <span className="capitalize">{c.status}</span>
                      </p>
                    </div>
                    <p className="font-bold text-sm tabular-nums shrink-0">${c.total}</p>
                  </div>
                ))}
              </div>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 pr-4">Folio</th>
                      <th className="pb-2 pr-4">Cliente</th>
                      <th className="pb-2 pr-4">Mesa</th>
                      <th className="pb-2 pr-4">Estado</th>
                      <th className="pb-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recientes.map((c) => (
                      <tr key={c.id} className="border-b last:border-0">
                        <td className="py-2 pr-4 font-medium">#{c.folio}</td>
                        <td className="py-2 pr-4">{c.cliente}</td>
                        <td className="py-2 pr-4 text-muted-foreground">{c.mesa ?? "—"}</td>
                        <td className="py-2 pr-4 capitalize">{c.status}</td>
                        <td className="py-2 text-right font-medium">${c.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
