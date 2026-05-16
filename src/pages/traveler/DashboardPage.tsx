import { Routes, Route } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { LayoutDashboard, Plane, Wallet } from "lucide-react";

import OverviewPage from "./OverviewPage";
import TripsPage from "./TripsPage";
import TripDetailPage from "./TripDetailPage";
import CreateTripPage from "./CreateTripPage";
import PaymentsPage from "./PaymentsPage";

const navItems = [
  { label: "Vue d'ensemble", path: "/traveler",          icon: <LayoutDashboard size={16} /> },
  { label: "Mes trajets",    path: "/traveler/trips",    icon: <Plane size={16} /> },
  { label: "Mes paiements",  path: "/traveler/payments", icon: <Wallet size={16} /> },
];

export default function TravelerDashboard() {
  return (
    <AppLayout navItems={navItems}>
      <Routes>
        <Route index              element={<OverviewPage />} />
        <Route path="trips"       element={<TripsPage />} />
        <Route path="trips/new"   element={<CreateTripPage />} />
        <Route path="trips/:id"   element={<TripDetailPage />} />
        <Route path="payments"    element={<PaymentsPage />} />
      </Routes>
    </AppLayout>
  );
}
