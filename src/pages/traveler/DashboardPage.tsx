import { Routes, Route } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { LayoutDashboard, Plane, Wallet, User } from "lucide-react";

import OverviewPage from "./TravelerOverviewPage";
import TripsPage from "./TripsPage";
import TripDetailPage from "./TripDetailPage";
import CreateTripPage from "./CreateTripPage";
import PaymentsPage from "./PaymentsPage";
import ProfilePage from "@/pages/profile/ProfilePage";
import TravelerBookingDetailPage from "./BookingDetailPage";

const navItems = [
  { label: "Vue d'ensemble", path: "/traveler",          icon: <LayoutDashboard size={16} /> },
  { label: "Mes trajets",    path: "/traveler/trips",    icon: <Plane size={16} /> },
  { label: "Mes paiements",  path: "/traveler/payments", icon: <Wallet size={16} /> },
  { label: "Mon profil",     path: "/traveler/profile",  icon: <User size={16} /> },
];

export default function TravelerDashboard() {
  return (
    <AppLayout navItems={navItems}>
      <Routes>
        <Route index              element={<OverviewPage />} />
        <Route path="trips"       element={<TripsPage />} />
        <Route path="trips/new"   element={<CreateTripPage />} />
        <Route path="trips/:id"   element={<TripDetailPage />} />
        <Route path="payments"      element={<PaymentsPage />} />
        <Route path="bookings/:id"  element={<TravelerBookingDetailPage />} />
        <Route path="profile"       element={<ProfilePage />} />
      </Routes>
    </AppLayout>
  );
}
