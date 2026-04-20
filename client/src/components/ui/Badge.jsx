// Badge — maps status strings to color variants
const statusMap = {
  // Gig statuses
  pending_approval: 'badge-amber',
  open:             'badge-green',
  in_progress:      'badge-blue',
  pending_delivery: 'badge-amber',
  completed:        'badge-green',
  rejected:         'badge-red',
  // Application statuses
  applied:          'badge-slate',
  shortlisted:      'badge-blue',
  selected:         'badge-green',
  // Payment statuses
  pending:          'badge-amber',
  paid:             'badge-green',
  payout_requested: 'badge-purple',
  payout_approved:  'badge-blue',
  payout_done:      'badge-green',
  // User statuses
  approved:         'badge-green',
};

export default function Badge({ status, label, variant }) {
  const cls = variant || statusMap[status] || 'badge-slate';
  const text = label || (status ? status.replace(/_/g, ' ') : '');
  return <span className={cls}>{text}</span>;
}
