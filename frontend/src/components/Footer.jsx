import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap foot-in">
        <div>
          <strong className="logo-sm">HireLane</strong>
          <p>Connecting job seekers with employers who are hiring now.</p>
        </div>
        <ul>
          <li><Mail size={16} /> support@hirelane.example</li>
          <li><Phone size={16} /> +91 98765 43210</li>
          <li><MapPin size={16} /> 12 Tech Park Road, Chennai, India</li>
        </ul>
      </div>
      <div className="wrap copy">© {new Date().getFullYear()} HireLane. All rights reserved.</div>
    </footer>
  );
}
