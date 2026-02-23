/**
 * Server Component: RecordItemForm Wrapper
 * 
 * This server component fetches categories server-side and passes them
 * to the RecordItemForm client component as initial props.
 * 
 * Benefits:
 * - Categories are fetched on the server before render
 * - No loading skeleton or delay for category dropdown
 * - Hybrid rendering: Server data + Client interactivity
 * - Instant category availability when form loads
 */

import { getServerCategories } from '@/lib/server-api';
import RecordItemForm from './record-item-form';

interface RecordItemFormWrapperProps {
  onSuccess?: () => void;
}

export default async function RecordItemFormWrapper({ onSuccess }: RecordItemFormWrapperProps) {
  // Fetch categories on the server during initial render
  const categoriesData = await getServerCategories();
  const categories = categoriesData.categories || [];

  // Pass categories as initial props to client component
  return <RecordItemForm onSuccess={onSuccess} initialCategories={categories} />;
}
