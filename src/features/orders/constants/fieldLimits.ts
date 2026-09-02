/**
 * Maximum length of each free-text field.
 *
 * Shared by the inputs and the validator: `maxLength` stops typing and pasting,
 * the validator covers anything that reaches the queue by another path, and the
 * same numbers back the check constraints in supabase/schema.sql.
 */
export const FIELD_LIMITS = {
  orderNumber: 60,
  customer: 100,
  address: 100,
  comment: 280,
} as const;
