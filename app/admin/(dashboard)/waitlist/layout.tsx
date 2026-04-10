import { WaitlistSubnav } from '@/components/admin/waitlist-subnav';

export default function AdminWaitlistLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <WaitlistSubnav />
      {children}
    </div>
  );
}
