// import React, { useEffect, useState } from "react";
// import { db } from "../firebase/firebaseConfig";
// import { collection, onSnapshot } from "firebase/firestore";
// import { Doughnut } from "react-chartjs-2";
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
// import { toast } from "react-toastify";

// ChartJS.register(ArcElement, Tooltip, Legend);

// /* ─────────────────────────────────────────────────────────────────────────
//    MAIN COMPONENT - Payment History View Only (No Actions)
// ───────────────────────────────────────────────────────────────────────── */
// function ViewBookings() {
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [filterStatus, setFilterStatus] = useState("all");
//   const [filterEvent, setFilterEvent] = useState("all");

//   // 🔥 Realtime listener for bookings with error handling
//   useEffect(() => {
//     const unsub = onSnapshot(
//       collection(db, "bookings"), 
//       (snap) => {
//         try {
//           const bookingsData = snap.docs.map((d) => {
//             const data = d.data();
//             // Safely handle timestamps
//             let createdAt = new Date();
//             if (data.createdAt?.toDate) {
//               createdAt = data.createdAt.toDate();
//             } else if (data.createdAt) {
//               createdAt = new Date(data.createdAt);
//             } else if (data.bookingDate) {
//               createdAt = new Date(data.bookingDate);
//             }
            
//             return { 
//               id: d.id, 
//               ...data,
//               createdAt
//             };
//           });
//           setBookings(bookingsData);
//         } catch (error) {
//           // Silent fail - just show empty state
//         } finally {
//           setLoading(false);
//         }
//       },
//       (error) => {
//         // Silent error handling
//         setLoading(false);
//       }
//     );
    
//     return () => unsub();
//   }, []);

//   // 🔥 Stats for dashboard with safe calculations
//   const total = bookings.length;
//   const paidBookings = bookings.filter(b => 
//     b.status === "paid" || b.status === "accepted" || b.status === "confirmed"
//   ).length;
//   const pending = bookings.filter((b) => 
//     !b.status || b.status === "pending"
//   ).length;
  
//   // Calculate total revenue safely
//   const totalRevenue = bookings.reduce((sum, booking) => {
//     const amount = booking.totalPrice || 0;
//     return sum + (typeof amount === 'number' ? amount : 0);
//   }, 0);

//   // 🔥 Chart data - Event distribution (safe handling)
//   const eventMap = {};
//   bookings.forEach((b) => {
//     const eventName = b.eventTitle || b.eventName || "Unknown Event";
//     eventMap[eventName] = (eventMap[eventName] || 0) + 1;
//   });

//   const chartData = {
//     labels: Object.keys(eventMap),
//     datasets: [
//       {
//         data: Object.values(eventMap),
//         backgroundColor: ["#a855f7", "#f97316", "#22c55e", "#ef4444", "#3b82f6", "#ec4899", "#14b8a6", "#8b5cf6"],
//         borderWidth: 3,
//         borderColor: "#ffffff",
//         hoverOffset: 14,
//       },
//     ],
//   };

//   const chartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         position: "bottom",
//         labels: { 
//           padding: 20, 
//           font: { size: 13 }, 
//           color: "#475569",
//           boxWidth: 14, 
//           boxHeight: 14, 
//           borderRadius: 4, 
//           useBorderRadius: true 
//         },
//       },
//       tooltip: { 
//         backgroundColor: "#1e293b", 
//         padding: 12, 
//         cornerRadius: 10,
//         callbacks: {
//           label: function(context) {
//             const label = context.label || '';
//             const value = context.raw || 0;
//             const total = context.dataset.data.reduce((a, b) => a + b, 0);
//             const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
//             return `${label}: ${value} booking${value !== 1 ? 's' : ''} (${percentage}%)`;
//           }
//         }
//       },
//     },
//     cutout: "68%",
//   };

//   // Get unique events for filter dropdown (safe)
//   const uniqueEvents = [...new Set(
//     bookings
//       .map(b => b.eventTitle || b.eventName)
//       .filter(Boolean)
//   )];

//   // 🔥 Filtered rows with safe checks
//   const filtered = bookings.filter((b) => {
//     const q = search.toLowerCase().trim();
    
//     // Safe field access with defaults
//     const customerName = (b.customerName || b.name || "").toString().toLowerCase();
//     const customerEmail = (b.customerEmail || b.email || "").toString().toLowerCase();
//     const eventName = (b.eventTitle || b.eventName || "").toString().toLowerCase();
//     const paymentId = (b.paymentId || "").toString().toLowerCase();
//     const orderId = (b.orderId || b.paymentOrderId || "").toString().toLowerCase();
    
//     const matchSearch = q === "" || 
//       customerName.includes(q) ||
//       customerEmail.includes(q) ||
//       eventName.includes(q) ||
//       paymentId.includes(q) ||
//       orderId.includes(q);
    
//     const bookingStatus = b.status || "pending";
//     const matchStatus =
//       filterStatus === "all" ||
//       (filterStatus === "pending" && (bookingStatus === "pending" || bookingStatus === "free")) ||
//       bookingStatus === filterStatus;
    
//     const matchEvent = filterEvent === "all" || eventName === filterEvent.toLowerCase();
    
//     return matchSearch && matchStatus && matchEvent;
//   });

//   // Format currency safely
//   const formatCurrency = (amount) => {
//     const numAmount = Number(amount) || 0;
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     }).format(numAmount);
//   };

//   // Format date safely
//   const formatDate = (date) => {
//     if (!date) return "N/A";
//     try {
//       const d = new Date(date);
//       if (isNaN(d.getTime())) return "Invalid date";
      
//       return d.toLocaleDateString('en-IN', {
//         day: 'numeric',
//         month: 'short',
//         year: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit'
//       });
//     } catch {
//       return "Invalid date";
//     }
//   };

//   // Get status display safely
//   const getStatusDisplay = (status) => {
//     const statusMap = {
//       'paid': { bg: "bg-green-100", text: "text-green-700", label: "Paid" },
//       'accepted': { bg: "bg-emerald-100", text: "text-emerald-700", label: "Confirmed" },
//       'confirmed': { bg: "bg-emerald-100", text: "text-emerald-700", label: "Confirmed" },
//       'pending': { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending" },
//       'free': { bg: "bg-blue-100", text: "text-blue-700", label: "Free" },
//       'failed': { bg: "bg-red-100", text: "text-red-700", label: "Failed" },
//       'refunded': { bg: "bg-orange-100", text: "text-orange-700", label: "Refunded" }
//     };
//     return statusMap[status] || statusMap.pending;
//   };

//   // ── Loading ──
//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
//         <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-purple-500 animate-spin" />
//         <p className="text-slate-400 text-sm font-medium">Loading payment history…</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-white">
//       {/* ── PAGE HEADER ── */}
//       <div className="px-6 lg:px-9 pt-[110px]">
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
//           <div>
//             <p className="text-xs font-extrabold tracking-widest uppercase text-purple-500 mb-1">
//               Admin Panel
//             </p>
//             <h1 className="text-3xl font-bold text-slate-900">
//               Payment History
//             </h1>
//             <p className="text-sm text-slate-400 mt-1">
//               Real-time view of all booking payments
//             </p>
//           </div>
//           <div className="flex gap-2">
//             <span className="inline-flex items-center gap-2 self-start sm:self-auto bg-purple-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-lg shadow-purple-200">
//               📋 {total} booking{total !== 1 ? "s" : ""}
//             </span>
//             <span className="inline-flex items-center gap-2 self-start sm:self-auto bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-lg shadow-green-200">
//               💰 {formatCurrency(totalRevenue)}
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* ── OVERVIEW ROW: Chart LEFT · Stats 2×2 RIGHT ── */}
//       <div className="px-6 lg:px-9">
//         <div className="flex flex-col lg:flex-row gap-6 mb-7 items-stretch">

//           {/* ─ CHART (left) ─ */}
//           <div className="w-full lg:w-[56%] bg-white rounded-2xl border border-slate-100 shadow-sm p-7 flex flex-col">
//             <h3 className="text-base font-bold text-slate-800 mb-5">
//               Bookings by Event
//             </h3>
//             <div className="flex-1 relative min-h-[320px]">
//               {Object.keys(eventMap).length > 0 ? (
//                 <Doughnut data={chartData} options={chartOptions} />
//               ) : (
//                 <p className="text-slate-400 text-sm text-center mt-20">No booking data yet</p>
//               )}
//             </div>
//           </div>

//           {/* ─ STAT CARDS 2×2 (right) ─ */}
//           <div className="flex-1 grid grid-cols-2 gap-4">
//             <StatCard
//               label="Total Bookings"
//               value={total}
//               icon="📋"
//               wrapCls="bg-purple-50 border-purple-100"
//               iconCls="bg-purple-100"
//               valueCls="text-purple-600"
//               labelCls="text-purple-400"
//             />

//             <StatCard
//               label="Paid/Confirmed"
//               value={paidBookings}
//               icon="✅"
//               wrapCls="bg-green-50 border-green-100"
//               iconCls="bg-green-100"
//               valueCls="text-green-600"
//               labelCls="text-green-400"
//             />

//             <StatCard
//               label="Pending"
//               value={pending}
//               icon="⏳"
//               wrapCls="bg-orange-50 border-orange-100"
//               iconCls="bg-orange-100"
//               valueCls="text-orange-500"
//               labelCls="text-orange-300"
//             />

//             <StatCard
//               label="Revenue"
//               value={`₹${totalRevenue.toLocaleString('en-IN')}`}
//               icon="💰"
//               wrapCls="bg-blue-50 border-blue-100"
//               iconCls="bg-blue-100"
//               valueCls="text-blue-600 text-3xl"
//               labelCls="text-blue-400"
//             />
//           </div>
//         </div>
//       </div>

//       {/* ── PAYMENTS TABLE (No Actions) ── */}
//       <div className="px-6 lg:px-9 pb-10">
//         <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

//           {/* Toolbar - Search & Filters Only */}
//           <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-b border-slate-100">
            
//             {/* Search */}
//             <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 flex-1 max-w-md">
//               <span className="text-slate-400 text-sm select-none">🔍</span>
//               <input
//                 type="text"
//                 placeholder="Search by name, email, event or payment ID…"
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 className="bg-transparent border-none outline-none text-sm text-slate-700 placeholder-slate-400 w-full"
//               />
//             </div>

//             {/* Filters */}
//             <div className="flex items-center gap-3 flex-wrap">
//               {/* Event filter */}
//               <select
//                 value={filterEvent}
//                 onChange={(e) => setFilterEvent(e.target.value)}
//                 className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-200"
//               >
//                 <option value="all">All Events</option>
//                 {uniqueEvents.map(event => (
//                   <option key={event} value={event}>{event}</option>
//                 ))}
//               </select>

//               {/* Status filter pills */}
//               <div className="flex items-center gap-2 flex-wrap">
//                 {["all", "pending", "paid", "failed", "free"].map((s) => (
//                   <button
//                     key={s}
//                     onClick={() => setFilterStatus(s)}
//                     className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border transition-all duration-150 cursor-pointer
//                       ${filterStatus === s
//                         ? "bg-purple-600 text-white border-purple-600 shadow shadow-purple-200"
//                         : "bg-slate-100 text-slate-500 border-transparent hover:bg-slate-200"
//                       }`}
//                   >
//                     {s}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Table - Read Only View */}
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="bg-slate-50 border-b-2 border-slate-100">
//                   <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-slate-400">Date & Time</th>
//                   <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-slate-400">Customer</th>
//                   <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-slate-400">Event</th>
//                   <th className="px-4 py-3.5 text-center text-xs font-bold uppercase tracking-widest text-slate-400">Tickets</th>
//                   <th className="px-4 py-3.5 text-right text-xs font-bold uppercase tracking-widest text-slate-400">Amount</th>
//                   <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-slate-400">Payment ID</th>
//                   <th className="px-4 py-3.5 text-center text-xs font-bold uppercase tracking-widest text-slate-400">Status</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {filtered.length === 0 ? (
//                   <tr>
//                     <td colSpan={7} className="text-center py-14 text-slate-400 text-sm">
//                       No payment records found.
//                     </td>
//                   </tr>
//                 ) : (
//                   filtered.map((b) => {
//                     const statusDisplay = getStatusDisplay(b.status);
//                     return (
//                       <tr
//                         key={b.id}
//                         className="border-b border-slate-100 hover:bg-purple-50/40 transition-colors duration-150"
//                       >
//                         {/* Date & Time */}
//                         <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">
//                           {formatDate(b.createdAt || b.bookingDate)}
//                         </td>

//                         {/* Customer */}
//                         <td className="px-4 py-3.5">
//                           <div className="font-semibold text-slate-800">{b.customerName || b.name || "Guest"}</div>
//                           <div className="text-xs text-slate-400">{b.customerEmail || b.email || "—"}</div>
//                           {b.customerPhone && (
//                             <div className="text-xs text-slate-400">{b.customerPhone}</div>
//                           )}
//                         </td>

//                         {/* Event */}
//                         <td className="px-4 py-3.5">
//                           <span className="inline-block bg-purple-50 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
//                             {b.eventTitle || b.eventName || "Unknown Event"}
//                           </span>
//                           {b.eventDate && (
//                             <div className="text-xs text-slate-400 mt-1">{b.eventDate}</div>
//                           )}
//                         </td>

//                         {/* Tickets */}
//                         <td className="px-4 py-3.5 text-center">
//                           <div className="font-medium text-slate-700">{b.quantity || 1}</div>
//                           {b.selectedExtras && b.selectedExtras.length > 0 && (
//                             <div className="text-xs text-purple-500 mt-1">
//                               +{b.selectedExtras.length} extra{b.selectedExtras.length > 1 ? 's' : ''}
//                             </div>
//                           )}
//                         </td>

//                         {/* Amount */}
//                         <td className="px-4 py-3.5 text-right">
//                           <div className="font-bold text-purple-600">
//                             {formatCurrency(b.totalPrice)}
//                           </div>
//                           {b.extrasPrice > 0 && (
//                             <div className="text-xs text-slate-400">
//                               (Extras: {formatCurrency(b.extrasPrice)})
//                             </div>
//                           )}
//                         </td>

//                         {/* Payment ID */}
//                         <td className="px-4 py-3.5">
//                           <div className="font-mono text-xs text-slate-500">
//                             {b.paymentId ? b.paymentId.slice(-12) : (b.paymentMethod === 'free' ? 'FREE' : 'N/A')}
//                           </div>
//                           {b.paymentOrderId && (
//                             <div className="text-xs text-slate-400">
//                               Order: {b.paymentOrderId.slice(-8)}
//                             </div>
//                           )}
//                         </td>

//                         {/* Status - Read Only Badge */}
//                         <td className="px-4 py-3.5 text-center">
//                           <span className={`inline-block ${statusDisplay.bg} ${statusDisplay.text} text-xs font-bold px-3 py-1 rounded-full`}>
//                             {statusDisplay.label}
//                           </span>
//                         </td>
//                       </tr>
//                     );
//                   })
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Table footer with summary */}
//           <div className="px-6 py-3.5 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-400">
//             <span>
//               Showing <span className="font-bold text-slate-600">{filtered.length}</span> of{" "}
//               <span className="font-bold text-slate-600">{total}</span> payments
//             </span>
//             <div className="flex gap-4">
//               <span className="font-medium text-purple-600">
//                 Total: {formatCurrency(totalRevenue)}
//               </span>
//               <span className="font-medium text-green-600">
//                 Avg: {formatCurrency(total > 0 ? totalRevenue / total : 0)}
//               </span>
//             </div>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }

// export default ViewBookings;

// /* ─────────────────────────────────────────────────────────────────────────
//    STAT CARD — pure Tailwind
// ───────────────────────────────────────────────────────────────────────── */
// const StatCard = ({ label, value, icon, wrapCls, iconCls, valueCls, labelCls }) => (
//   <div
//     className={`${wrapCls} border rounded-2xl p-5 flex flex-col justify-between gap-3 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-200`}
//   >
//     <div className="flex items-center justify-between">
//       <div className={`${iconCls} w-10 h-10 rounded-xl flex items-center justify-center text-xl`}>
//         {icon}
//       </div>
//       <span className={`${labelCls} text-xs font-bold uppercase tracking-wider`}>
//         {label}
//       </span>
//     </div>
//     <p className={`${valueCls} text-4xl font-extrabold leading-none`}>
//       {value}
//     </p>
//   </div>
// );