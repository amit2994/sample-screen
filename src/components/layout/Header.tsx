import { useLocation } from 'react-router-dom';
import { Bell, MessageSquare, Search, User } from 'lucide-react';
import './Header.css';

export default function Header() {
  const location = useLocation();

  // Derive page title from route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/settings') return 'Settings';
    if (path === '/help') return 'Help';

    const match = path.match(/\/sprint\/(\d+)\/story\/(\d+)/);
    if (match) {
      return `Sprint ${match[1]} — Story ${match[2]}`;
    }
    return 'Page';
  };

  return (
    <header className="header">
      <div className="header__left">
        <h1 className="header__title">{getPageTitle()}</h1>
        <Breadcrumb />
      </div>

      <div className="header__right">
        {/* Search */}
        <div className="header__search">
          <Search size={16} className="header__search-icon" />
          <input
            type="text"
            placeholder="Search screens..."
            className="header__search-input"
            id="global-search"
          />
        </div>

        {/* Comment toggle */}
        <button className="header__icon-btn" id="toggle-comments" title="Comments">
          <MessageSquare size={18} />
          <span className="header__badge">3</span>
        </button>

        {/* Notifications */}
        <button className="header__icon-btn" id="notifications" title="Notifications">
          <Bell size={18} />
        </button>

        {/* User avatar */}
        <button className="header__user" id="user-menu">
          <div className="header__avatar">
            <User size={16} />
          </div>
          <span className="header__username">Admin</span>
        </button>
      </div>
    </header>
  );
}

/* Breadcrumb sub-component */
function Breadcrumb() {
  const location = useLocation();
  const path = location.pathname;

  const crumbs: { label: string; path?: string }[] = [{ label: 'Home', path: '/' }];

  const match = path.match(/\/sprint\/(\d+)\/story\/(\d+)/);
  if (match) {
    crumbs.push({ label: `Sprint ${match[1]}` });
    crumbs.push({ label: `Story ${match[2]}` });
  } else if (path === '/settings') {
    crumbs.push({ label: 'Settings' });
  } else if (path === '/help') {
    crumbs.push({ label: 'Help' });
  }

  if (crumbs.length <= 1) return null;

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {crumbs.map((crumb, index) => (
        <span key={index} className="breadcrumb__item">
          {index > 0 && <span className="breadcrumb__separator">/</span>}
          {crumb.path ? (
            <a href={crumb.path} className="breadcrumb__link">
              {crumb.label}
            </a>
          ) : (
            <span className="breadcrumb__current">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
