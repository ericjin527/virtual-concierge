import { redirect } from 'next/navigation';

// Category landing page — redirect to request with category preset
export default function ApplianceRepairPage() {
  redirect('/request?category=appliance_repair');
}
