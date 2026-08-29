import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Wallet,
} from "lucide-react";

const transactions = [
  {
    title: "Charging",
    detail: "Janakpuri Mobility Hub",
    amount: "- ₹420",
  },
  {
    title: "Journey",
    detail: "Mobility service",
    amount: "- ₹180",
  },
  {
    title: "Wallet top-up",
    detail: "Added to wallet",
    amount: "+ ₹1,000",
    positive: true,
  },
  {
    title: "Charging",
    detail: "Dwarka Sector 14",
    amount: "- ₹260",
  },
];

export default function WalletPage() {
  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400">
            Payments
          </div>

          <h1 className="mt-2 text-2xl font-black sm:text-3xl">
            Wallet
          </h1>

          <p className="mt-1 text-[10px] text-slate-500">
            Balance and recent transactions.
          </p>
        </div>

        <Link
          href="/drivers"
          className="flex items-center gap-1 rounded-lg border border-slate-800 px-3 py-2 text-[8px] font-bold text-slate-500 hover:text-white"
        >
          <ArrowLeft className="h-3 w-3" />
          Back
        </Link>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-800 bg-[#07101d] p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[8px] uppercase tracking-widest text-slate-600">
              Available balance
            </div>

            <div className="mt-2 text-3xl font-black">
              ₹1,240.00
            </div>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-400/10">
            <Wallet className="h-5 w-5 text-blue-400" />
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-3 text-[8px] font-bold uppercase tracking-widest text-slate-600">
            Recent transactions
          </div>

          <div className="space-y-2">
            {transactions.map((transaction, index) => (
              <div
                key={`${transaction.title}-${index}`}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#050A13] p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-400/10">
                    <CreditCard className="h-3.5 w-3.5 text-blue-400" />
                  </div>

                  <div>
                    <div className="text-[10px] font-bold text-white">
                      {transaction.title}
                    </div>

                    <div className="mt-1 text-[8px] text-slate-600">
                      {transaction.detail}
                    </div>
                  </div>
                </div>

                <div
                  className={`text-[10px] font-black ${
                    transaction.positive
                      ? "text-emerald-400"
                      : "text-slate-400"
                  }`}
                >
                  {transaction.amount}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}