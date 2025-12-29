import { useState, useEffect } from 'react';
import followupService from '../../services/followupService';
import classService from '../../services/classService';
import detentionService from '../../services/detentionService';
import termService from '../../services/termService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './Home.css';

const AdminHome = () => {
  const [followups, setFollowups] = useState([]);
  const [todaysClasses, setTodaysClasses] = useState([]);
  const [todaysDetentions, setTodaysDetentions] = useState([]);
  const [weekInfo, setWeekInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeClassTab, setActiveClassTab] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [followupsData, classesData, detentionsData, weekData] = await Promise.all([
        followupService.getAll({ isCompleted: false }),
        classService.getTodaysClasses().catch(() => []),
        detentionService.getTodaysDetentions().catch(() => []),
        termService.getCurrentWeek().catch(() => ({ type: 'none', message: 'No incoming term available' }))
      ]);

      setFollowups(followupsData);
      setTodaysClasses(classesData);
      setTodaysDetentions(detentionsData);
      setWeekInfo(weekData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const markFollowupDone = async (id) => {
    try {
      await followupService.markComplete(id);
      loadData();
    } catch (err) {
      console.error('Error marking followup complete:', err);
    }
  };

  const updateAttendance = async (classId, week, studentId, status) => {
    try {
      // Find existing attendance for this week
      const classItem = todaysClasses.find(c => c._id === classId);
      if (!classItem) return;

      const attendanceData = classItem.students.map(s => ({
        student: s.student._id,
        status: s.student._id === studentId ? status : 'absent'
      }));

      await classService.markAttendance(classId, week, attendanceData);
      loadData();
    } catch (err) {
      console.error('Error updating attendance:', err);
    }
  };

  const updateDetentionStatus = async (detentionId, status) => {
    try {
      await detentionService.updateStatus(detentionId, status);
      loadData();
    } catch (err) {
      console.error('Error updating detention status:', err);
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const getHeaderText = () => {
    if (!weekInfo) return 'Admin Dashboard';

    if (weekInfo.type === 'current') {
      if (weekInfo.week) {
        // School term with week number
        return `${weekInfo.termName} Week ${weekInfo.week}`;
      } else {
        // Holiday without week number
        return weekInfo.termName;
      }
    } else if (weekInfo.type === 'upcoming') {
      const startDate = new Date(weekInfo.startDate);
      return `${weekInfo.termName} starts ${startDate.toLocaleDateString()}`;
    } else {
      return weekInfo.message || 'No incoming term available';
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-home">
      <h1>{getHeaderText()}</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Followups Section */}
      <section className="followups-section">
        <h2>Followups</h2>
        {followups.length === 0 ? (
          <p className="empty-state">No pending followups</p>
        ) : (
          <div className="followups-list">
            {followups.map((followup) => (
              <div
                key={followup._id}
                className={`followup-card ${isOverdue(followup.dueDate) ? 'overdue' : ''}`}
                title={followup.issue}
              >
                <div className="followup-content">
                  <p className="followup-issue">{followup.issue}</p>
                  <span className="due-date">
                    Due: {new Date(followup.dueDate).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => markFollowupDone(followup._id)}
                  className="btn-done"
                >
                  Done
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="bottom-section">
        {/* Today's Attendance */}
        <section className="attendance-section">
          <h2>Today's Attendance</h2>

          {todaysClasses.length === 0 ? (
            <p className="empty-state">No classes scheduled today</p>
          ) : (
            <>
              {/* Class Selector Dropdown */}
              <div className="class-selector">
                <label htmlFor="class-filter">Show class:</label>
                <select
                  id="class-filter"
                  value={activeClassTab}
                  onChange={(e) => setActiveClassTab(e.target.value)}
                  className="class-dropdown"
                >
                  <option value="all">All Classes</option>
                  {todaysClasses.map((classItem) => (
                    <option key={classItem._id} value={classItem._id}>
                      {classItem.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Attendance Tables */}
              <div className="attendance-content">
                {(activeClassTab === 'all' ? todaysClasses : todaysClasses.filter(c => c._id === activeClassTab)).map((classItem) => (
                  <div key={classItem._id} className="class-attendance">
                    {activeClassTab === 'all' && <h3>{classItem.name}</h3>}
                    <table>
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Present</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classItem.students?.map((student) => (
                          <tr key={student.student?._id || student._id}>
                            <td>{student.student?.name || 'Unknown'}</td>
                            <td>
                              <input
                                type="checkbox"
                                onChange={(e) =>
                                  updateAttendance(
                                    classItem._id,
                                    classItem.currentWeek || 1,
                                    student.student?._id,
                                    e.target.checked ? 'arrived' : 'absent'
                                  )
                                }
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Today's Detentions */}
        <section className="detentions-section">
          <h2>Today's Detentions</h2>
          {todaysDetentions.length === 0 ? (
            <p className="empty-state">No detentions scheduled today</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Status</th>
                  <th>Class</th>
                  <th>Week</th>
                </tr>
              </thead>
              <tbody>
                {todaysDetentions.map((detention) => (
                  <tr key={detention._id}>
                    <td>{detention.student?.name}</td>
                    <td>
                      <select
                        value={detention.completionStatus || ''}
                        onChange={(e) =>
                          updateDetentionStatus(detention._id, e.target.value)
                        }
                      >
                        <option value="">Pending</option>
                        <option value="complete">Complete</option>
                        <option value="incomplete">Incomplete</option>
                        <option value="absent">Absent</option>
                      </select>
                    </td>
                    <td>{detention.class?.name}</td>
                    <td>{detention.week}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminHome;
