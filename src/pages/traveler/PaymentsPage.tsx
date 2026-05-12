import { Wallet } from "lucide-react";

export default function PaymentsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes paiements</h1>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Wallet className="w-12 h-12 text-gray-300 mb-4" />
        <p className="text-gray-500 font-medium">Aucun paiement pour le moment</p>
        <p className="text-sm text-gray-400 mt-1">
          Vos versements apparaîtront ici une fois vos trajets terminés.
        </p>
      </div>
    </div>
  );
}
