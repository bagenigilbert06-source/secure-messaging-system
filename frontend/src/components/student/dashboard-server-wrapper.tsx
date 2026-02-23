/**
 * Server Component: Fetches all dashboard data server-side
 * Returns data to client components for immediate rendering (SSR + Hybrid)
 */

import { 
  getServerUser, 
  getServerFoundItems, 
  getServerUserClaims, 
  getServerUserItems, 
  getServerUserMessages, 
  getServerCategories,
  getServerConversations
} from '@/lib/server-api';
import CompleteStudentDashboard from './complete-student-dashboard';

export default async function DashboardServerWrapper() {
  // Fetch all data in parallel on the server
  const [user, foundItems, claims, userItems, messages, categories, conversationsData] = await Promise.all([
    getServerUser(),
    getServerFoundItems(1, 100),
    getServerUserClaims(1, 10),
    getServerUserItems(1, 10),
    getServerUserMessages(1, 5),
    getServerCategories(),
    getServerConversations(),
  ]);

  // Pass fetched data to client component
  return (
    <CompleteStudentDashboard
      studentName={user?.first_name || 'Student'}
      studentId={user?.id || ''}
      onLogout={() => {}}
      initialFoundItems={foundItems || { items: [], total: 0 }}
      initialUserItems={userItems || { items: [], total: 0 }}
      initialUserClaims={claims || { items: [], total: 0 }}
      initialMessages={messages || { messages: [], total: 0 }}
      initialUserProfile={user ? { data: user } : null}
      initialCategories={categories || { categories: [] }}
      initialConversations={conversationsData?.conversations || []}
    />
  );
}
