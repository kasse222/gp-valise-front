import { useSearchParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button, Card } from "@/components/ui";

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking_id");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Paiement confirmé !
        </h1>
        <p className="text-gray-500 mb-8">
          Votre réservation est en cours de traitement.
        </p>

        <div className="flex flex-col gap-3">
          {bookingId && (
            <Button
              variant="primary"
              onClick={() => navigate(`/sender/bookings/${bookingId}`)}
            >
              Voir ma réservation
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() => navigate("/sender/bookings")}
          >
            Mes réservations
          </Button>
        </div>
      </Card>
    </div>
  );
}
