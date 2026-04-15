import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
  FileText,
  Settings,
  HelpCircle,
  PanelLeftClose,
  PanelLeft,
  Layers,
} from 'lucide-react';
import './Sidebar.css';

import { sprints, type Sprint } from '../../config/sprints';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSprints, setExpandedSprints] = useState<string[]>(['sprint-1', 'sprint-2']);
  const location = useLocation();

  const toggleSprint = (sprintId: string) => {
    setExpandedSprints((prev) =>
      prev.includes(sprintId)
        ? prev.filter((id) => id !== sprintId)
        : [...prev, sprintId]
    );
  };

  const isStoryActive = (path: string) => location.pathname === path;

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      {/* Logo Area */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">
          <Layers size={22} />
        </div>
        {!collapsed && (
          <div className="sidebar__logo-text">
            <span className="sidebar__logo-title">Deposit UI</span>
            <span className="sidebar__logo-subtitle">Screen Framework</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {/* Dashboard link */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
          }
          end
        >
          <LayoutDashboard size={18} />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        {/* Sprint Accordion */}
        {!collapsed && <div className="sidebar__section-label">Sprints</div>}

        {sprints.map((sprint) => (
          <div key={sprint.id} className="sidebar__sprint">
            <button
              className={`sidebar__sprint-header ${
                expandedSprints.includes(sprint.id) ? 'sidebar__sprint-header--open' : ''
              }`}
              onClick={() => toggleSprint(sprint.id)}
            >
              <div className="sidebar__sprint-header-left">
                {expandedSprints.includes(sprint.id) ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
                {!collapsed && <span>{sprint.name}</span>}
              </div>
              {!collapsed && (
                <span className="sidebar__sprint-count">{sprint.stories.length}</span>
              )}
            </button>

            {expandedSprints.includes(sprint.id) && !collapsed && (
              <div className="sidebar__stories animate-fade-in">
                {sprint.stories.map((story) => (
                  <NavLink
                    key={story.id}
                    to={story.path}
                    className={`sidebar__story-link ${
                      isStoryActive(story.path) ? 'sidebar__story-link--active' : ''
                    }`}
                  >
                    <FileText size={14} />
                    <span className="truncate">{story.title}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar__footer">
        <NavLink to="/settings" className="sidebar__link">
          <Settings size={18} />
          {!collapsed && <span>Settings</span>}
        </NavLink>
        <NavLink to="/help" className="sidebar__link">
          <HelpCircle size={18} />
          {!collapsed && <span>Help</span>}
        </NavLink>

        <button
          className="sidebar__toggle"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
