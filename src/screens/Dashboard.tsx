import {
  FileText,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Layers,
} from 'lucide-react';
import { useAllComments } from '../hooks/useComments';
import { sprints } from '../config/sprints';
import './Dashboard.css';

export default function Dashboard() {
  const { allComments, loading } = useAllComments();

  // Basic calculations
  const totalScreens = sprints.reduce((acc, sprint) => acc + sprint.stories.length, 0);
  const openCommentsCount = allComments.filter((c) => c.status === 'open').length;
  const resolvedCommentsCount = allComments.filter((c) => c.status === 'resolved').length;

  // Calculate pending review screens: Count unique screen_ids that have open comments
  const screensWithOpenComments = new Set(
    allComments.filter((c) => c.status === 'open').map((c) => c.screen_id)
  );
  const pendingReviewCount = screensWithOpenComments.size;

  const stats = [
    { label: 'Total Screens', value: totalScreens.toString(), icon: FileText, color: 'var(--color-primary)' },
    { label: 'Open Comments', value: openCommentsCount.toString(), icon: MessageSquare, color: 'var(--color-warning)' },
    { label: 'Resolved', value: resolvedCommentsCount.toString(), icon: CheckCircle2, color: 'var(--color-success)' },
    { label: 'Pending Review', value: pendingReviewCount.toString(), icon: AlertCircle, color: 'var(--color-error)' },
  ];

  const formatTime = (dateStr: string) => {
    const diffMin = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${Math.floor(diffHr / 24)}d ago`;
  };

  const getScreenName = (screenId: string) => {
    for (const sprint of sprints) {
      for (const story of sprint.stories) {
        if (story.screen_id === screenId) return story.title;
      }
    }
    return screenId;
  };

  // Recent activity - top 5 most recent comments
  const recentActivity = allComments.slice(0, 5).map((c) => ({
    user: c.created_by || 'Unknown User',
    action: c.status === 'resolved' ? 'resolved comment on' : 'added a comment to',
    target: getScreenName(c.screen_id),
    time: formatTime(c.created_at),
  }));

  // Overall Completion Tracker
  let totalScreensReviewed = 0;

  return (
    <div className="dashboard">
      {/* Welcome */}
      <div className="dashboard__welcome">
        <div className="dashboard__welcome-content">
          <h2 className="dashboard__welcome-title">
            Welcome back 👋
          </h2>
          <p className="dashboard__welcome-text">
            Here's an overview of your screen-driven development progress. Click on any sprint screen in the sidebar to review and add feedback.
          </p>
        </div>
        <div className="dashboard__welcome-graphic">
          <Layers size={48} strokeWidth={1.5} />
        </div>
      </div>

      {/* Stats */}
      <div className="dashboard__stats">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card card">
            <div className="stat-card__icon" style={{ color: stat.color, background: `${stat.color}15` }}>
              <stat.icon size={20} />
            </div>
            <div className="stat-card__info">
              <span className="stat-card__value">{stat.value}</span>
              <span className="stat-card__label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity + Sprint Overview */}
      <div className="dashboard__grid">
        {/* Activity */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontWeight: 600, fontSize: 'var(--font-size-md)' }}>Recent Activity</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {loading ? (
              <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-tertiary)' }}>Loading activity...</div>
            ) : recentActivity.length === 0 ? (
              <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-tertiary)' }}>No recent activity.</div>
            ) : (
              recentActivity.map((item, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-item__avatar">
                    {item.user.charAt(0).toUpperCase()}
                  </div>
                  <div className="activity-item__content">
                    <p className="activity-item__text">
                      <strong>{item.user}</strong> {item.action}{' '}
                      <span className="activity-item__target">{item.target}</span>
                    </p>
                    <span className="activity-item__time">{item.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sprint Progress */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontWeight: 600, fontSize: 'var(--font-size-md)' }}>Sprint Progress</h3>
          </div>
          <div className="card-body">
            <div className="sprint-progress">
              {sprints.map((sprint) => {
                const totalSprintScreens = sprint.stories.length;
                // A screen is considered "reviewed" if it has comments and NO open comments
                const reviewedScreens = sprint.stories.filter((story) => {
                  const commentsForScreen = allComments.filter((c) => c.screen_id === story.screen_id);
                  if (commentsForScreen.length === 0) return false;
                  // Must have no open comments to be classified as fully reviewed/completed
                  return !commentsForScreen.some((c) => c.status === 'open');
                }).length;
                
                totalScreensReviewed += reviewedScreens;
                
                const percent = totalSprintScreens === 0 ? 0 : Math.round((reviewedScreens / totalSprintScreens) * 100);

                return (
                  <div key={sprint.id} className="sprint-progress__item">
                    <div className="sprint-progress__header">
                      <span className="sprint-progress__name">{sprint.name}</span>
                      <span className="sprint-progress__percent">{percent}%</span>
                    </div>
                    <div className="sprint-progress__bar">
                      <div className="sprint-progress__fill" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="sprint-progress__detail">
                      {reviewedScreens} of {totalSprintScreens} screens reviewed
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="sprint-summary">
              <TrendingUp size={16} />
              <span>
                Overall completion: <strong>{totalScreens > 0 ? Math.round((totalScreensReviewed / totalScreens) * 100) : 0}%</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
