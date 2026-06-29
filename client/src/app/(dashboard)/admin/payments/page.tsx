"use client";
import { useState } from "react";
import { App, Modal, Button, Select, Input, Tag } from "antd";
import { 
  Filter, 
  DollarSign, 
  CreditCard, 
  Calendar, 
  User, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus
} from "lucide-react";
import { useAdminPaymentsQuery } from "@/shared/services/api/queries/usePayments.query";
import { useCreatePaymentMutation, useUpdatePaymentMutation } from "@/shared/services/api/mutations/usePayments.mutation";
import type { PaymentListQuery, PaymentMethod, PaymentStatus } from "@/shared/types/api/payments";

export default function AdminPaymentsPage() {
  const { message } = App.useApp();
  const [params, setParams] = useState<PaymentListQuery>({ current: 1, pageSize: 9 });
  const query = useAdminPaymentsQuery(params);
  const createMutation = useCreatePaymentMutation();
  const updateMutation = useUpdatePaymentMutation();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState({
    bookingId: "",
    method: "cash" as PaymentMethod,
    amount: "" as string | number,
    status: "pending" as PaymentStatus
  });

  const payments = query.data?.results ?? [];
  const pages = query.data?.totalPages ?? 1;

  const handleCreate = async () => {
    if (!form.bookingId) return message.error("Booking ID required");
    try {
      await createMutation.mutateAsync({
        ...form,
        amount: form.amount ? Number(form.amount) : undefined
      } as any);
      message.success("Created payment");
      setIsCreateOpen(false);
      setForm({ bookingId: "", method: "cash", amount: "", status: "pending" });
    } catch(e: any) {
      message.error(e?.message || 'Failed');
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await updateMutation.mutateAsync({ id, body: { status: 'paid' } });
      message.success("Marked as paid");
    } catch(e: any) {
      message.error(e?.message || 'Failed');
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Payments</h1>
          <p className="text-gray-500 mt-1">Track and manage booking payments.</p>
        </div>
        <Button 
          type="primary" 
          icon={<Plus className="w-4 h-4" />} 
          onClick={() => setIsCreateOpen(true)}
          className="bg-blue-600"
          size="large"
        >
          New Payment
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 text-gray-600">
           <Filter className="w-4 h-4" />
           <span className="text-sm font-medium">Filter:</span>
        </div>
        <Select 
           value={params.status ?? ""} 
           onChange={v => setParams(p => ({...p, status: (v || undefined) as any, current:1}))}
           options={[
             {label:'All Status', value:''},
             {label:'Pending', value:'pending'},
             {label:'Paid', value:'paid'},
             {label:'Failed', value:'failed'}
           ]}
           variant="filled"
           className="min-w-[120px]"
        />
         <Select 
           value={params.method ?? ""} 
           onChange={v => setParams(p => ({...p, method: (v || undefined) as any, current:1}))}
           options={[
             {label:'All Methods', value:''},
             {label:'Cash', value:'cash'},
             {label:'Bank Transfer', value:'bank_transfer'},
             {label:'Momo', value:'momo'},
             {label:'PayPal', value:'paypal'}
           ]}
           variant="filled"
           className="min-w-[140px]"
        />
      </div>

      {/* Grid */}
      {query.isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[...Array(6)].map((_,i) => <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse"></div>)}
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
           <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
           <p className="text-gray-500">No payments found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {payments.map(p => (
            <PaymentCard key={p._id} payment={p} onMarkPaid={() => handleMarkPaid(p._id)} isUpdating={updateMutation.isPending} />
          ))}
        </div>
      )}

      {/* Pagination */}
       {pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button 
            disabled={params.current === 1}
            onClick={() => setParams(p => ({ ...p, current: Math.max(1, (p.current||1)-1) }))}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-gray-600">
            Page {params.current} of {pages}
          </span>
          <Button 
            disabled={(params.current||1) >= pages}
            onClick={() => setParams(p => ({ ...p, current: (p.current||1)+1 }))}
          >
            Next
          </Button>
        </div>
      )}

      {/* Create Modal */}
      <Modal 
        title="Create Payment"
        open={isCreateOpen}
        onCancel={() => setIsCreateOpen(false)}
        onOk={handleCreate}
        confirmLoading={createMutation.isPending}
      >
        <div className="space-y-4 py-4">
           <div>
             <label className="text-sm font-medium">Booking ID</label>
             <Input value={form.bookingId} onChange={e => setForm(f => ({...f, bookingId: e.target.value}))} placeholder="Paste Booking ID" />
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Method</label>
                <Select className="w-full" value={form.method} onChange={v => setForm(f => ({...f, method: v}))} options={[{value:'cash', label:'Cash'}, {value:'bank_transfer', label:'Bank Transfer'}, {value:'momo', label:'Momo'}, {value:'paypal', label:'PayPal'}]} />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select className="w-full" value={form.status} onChange={v => setForm(f => ({...f, status: v}))} options={[{value:'pending', label:'Pending'}, {value:'paid', label:'Paid'}]} />
              </div>
           </div>

           <div>
              <label className="text-sm font-medium">Amount (Optional)</label>
              <Input type="number" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} placeholder="Leave empty to use Booking amount" />
           </div>
        </div>
      </Modal>
    </div>
  );
}

function PaymentCard({ payment, onMarkPaid, isUpdating }: { payment: any, onMarkPaid: () => void, isUpdating: boolean }) {
   const statusColors: any = {
     paid: 'green',
     pending: 'gold',
     failed: 'red',
     cancelled: 'default'
   };
   
   return (
     <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full">
        <div>
          <div className="flex justify-between items-start mb-4">
             <Tag color={statusColors[payment.status]} className="capitalize m-0 rounded-full px-2.5">{payment.status}</Tag>
             <span className="text-xs text-gray-400 font-mono">#{payment._id.slice(-6)}</span>
          </div>
          
          <div className="mb-4">
             <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-5 h-5 text-gray-800" />
                <span className="text-2xl font-bold text-gray-900">{payment.amount?.toLocaleString()}</span>
             </div>
             <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">{payment.method?.replace('_', ' ')}</p>
          </div>
          
          <div className="space-y-2 mb-4">
             <div className="flex items-center gap-2 text-sm text-gray-600">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <span className="truncate">Booking: {payment.booking?._id ? `#${payment.booking._id.slice(-6)}` : 'N/A'}</span>
             </div>
             <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4 text-gray-400" />
                <span className="truncate">{payment.booking?.parent?.name || payment.booking?.parent?.email || 'Unknown Parent'}</span>
             </div>
             <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
             </div>
          </div>
        </div>
        
        {payment.status === 'pending' && (
           <Button 
             block 
             type="primary" 
             className="bg-blue-600 hover:bg-blue-700" 
             onClick={onMarkPaid}
             loading={isUpdating}
           >
             Mark as Paid
           </Button>
        )}
         {payment.status === 'paid' && (
           <div className="text-xs text-center text-green-600 font-medium py-2 bg-green-50 rounded-lg">
              Paid on {new Date(payment.paidAt).toLocaleDateString()}
           </div>
        )}
     </div>
   )
}
