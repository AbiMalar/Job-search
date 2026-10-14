export const CATEGORIES = ['Software Development', 'Data & Analytics', 'DevOps & Cloud', 'Quality Assurance', 'Design', 'Marketing'];
export const TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
export const LEVELS = ['Entry', 'Mid', 'Senior'];
export const STATUSES = ['PENDING', 'REVIEWED', 'SHORTLISTED', 'REJECTED'];

export const salary = (j) => `₹${j.salaryMin}–${j.salaryMax} LPA`;
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
export const isClosed = (j) => j.deadline && new Date(j.deadline + 'T23:59:59') < new Date();
export const label = (s) => s.charAt(0) + s.slice(1).toLowerCase();
