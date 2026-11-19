import { ArrowRight, Package } from "lucide-react";
import { useEffect } from "react";
import { useAdminOrdersStore } from "../../stores/useAdminOrdersStore";
import { money } from "../../util/export";
import {
  accentText,
  btnSecondary,
  eyebrow,
  orderStatusClass,
  panel,
  statusPill,
  tableCell,
  tableHead,
} from "../../lib/ui";

function AdminDashboardPage() {
  const orders = useAdminOrdersStore((state) => state.orders);
  const message = useAdminOrdersStore((state) => state.message);
  const fetchOrders = useAdminOrdersStore((state) => state.fetchOrders);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  return (
    <>
      <div className="mx-auto my-8 max-w-[1100px] sm:my-10 lg:my-12">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className={eyebrow}>SSC / OPERATIONS</span>
            <h1 className="mb-2 mt-4 font-serif text-[clamp(2.2rem,4vw,3.2rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-navy-900">
              Good morning, <em className={accentText}>admin.</em>
            </h1>
            <p className="text-[11px] text-navy-900/55">Here is what is happening with your store.</p>
          </div>
        </div>
        <div className="my-8 grid gap-3 sm:grid-cols-3 sm:gap-3.5">
          <div className="flex flex-col gap-3 rounded-sm bg-linear-to-br from-navy-950 via-navy-900 to-forest-800 p-5 text-cream-100 shadow-[0_24px_50px_-36px_rgba(7,26,46,0.9)]">
            <span className="text-[8px] uppercase tracking-[0.16em] text-cream-200/55">ORDERS LOADED</span>
            <strong className="font-serif text-[33px] font-semibold leading-none text-cream-50">{orders.length}</strong>
            <small className="text-[9px] text-cream-200/45">Most recent 30 orders</small>
          </div>
          <div className="flex flex-col gap-3 rounded-sm border border-gold-500/30 bg-linear-to-br from-gold-600 via-gold-500 to-gold-300 p-5 text-navy-950 shadow-[0_24px_50px_-36px_rgba(166,128,47,0.9)]">
            <span className="text-[8px] uppercase tracking-[0.16em] text-navy-950/55">AWAITING ACTION</span>
            <strong className="font-serif text-[33px] font-semibold leading-none text-navy-950">
              {orders.filter((o) => o.order_status === "pending").length}
            </strong>
            <small className="text-[9px] text-navy-950/50">Pending orders</small>
          </div>
          <div className="flex flex-col gap-3 rounded-sm border border-white/10 bg-linear-to-br from-forest-700 via-forest-600 to-navy-800 p-5 text-cream-100 shadow-[0_24px_50px_-36px_rgba(23,53,40,0.9)]">
            <span className="text-[8px] uppercase tracking-[0.16em] text-cream-200/55">CONNECTION</span>
            <strong className="py-1.5 font-sans text-[19px] font-medium text-gold-300">Live</strong>
            <small className="text-[9px] text-cream-200/45">Supabase session active</small>
          </div>
        </div>
        <div className={`${panel} p-4 sm:p-6`}>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className={eyebrow}>THE DAILY DETAIL</span>
              <h2 className="mt-2 font-serif text-[25px] font-semibold text-navy-900 sm:text-[27px]">Recent orders</h2>
            </div>
            <button className={btnSecondary} onClick={() => void fetchOrders()}>
              Refresh <ArrowRight size={15} />
            </button>
          </div>
          {message && <p className="py-3 text-[12px] text-navy-900/50">{message}</p>}
          {orders.length ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse whitespace-nowrap text-left">
                <thead>
                  <tr>
                    <th className={tableHead}>ORDER</th>
                    <th className={tableHead}>DATE</th>
                    <th className={tableHead}>TOTAL</th>
                    <th className={tableHead}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="transition-colors hover:bg-cream-100/60">
                      <td className={tableCell}>
                        <strong className="font-medium text-navy-900">{order.order_number}</strong>
                      </td>
                      <td className={tableCell}>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className={tableCell}>{money(order.total)}</td>
                      <td className={tableCell}>
                        <span className={`${statusPill} ${orderStatusClass(order.order_status)}`}>
                          {order.order_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-3 py-12 text-center text-navy-900/50">
              <Package size={26} className="mx-auto mb-4 text-gold-500" />
              <h3 className="mb-2 font-serif text-[23px] font-semibold text-navy-900">
                Your order desk is clear.
              </h3>
              <p className="text-[10px]">
                When your first order arrives, its details will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default AdminDashboardPage;
