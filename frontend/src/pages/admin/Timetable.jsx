import { useState, useEffect } from 'react';
import classService from '../../services/classService';
import classroomService from '../../services/classroomService';
import termService from '../../services/termService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './Timetable.css';

const Timetable = () => {
  const [classes, setClasses] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState('all');
  const [termInfo, setTermInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const daysOfWeek = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const dayOfWeekMapping = [6, 0, 1, 2, 3, 4, 5]; // Maps display order to database dayOfWeek (0=Sun, 6=Sat)
  const timeSlots = generateTimeSlots();
  const SLOT_HEIGHT = 60; // Height of each hour slot in pixels

  useEffect(() => {
    loadData();
  }, [selectedClassroom]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Get current/upcoming term info first
      const weekData = await termService.getCurrentWeek().catch(() => ({ type: 'none' }));
      setTermInfo(weekData);

      // If no term, don't load classes
      if (weekData.type === 'none') {
        setClasses([]);
        setClassrooms([]);
        setLoading(false);
        return;
      }

      // Get the term to display
      let termToDisplay = null;
      if (weekData.type === 'current') {
        // Get current term details
        const currentTerm = await termService.getCurrent().catch(() => null);
        termToDisplay = currentTerm;
      } else if (weekData.type === 'upcoming') {
        // Get upcoming term details - we need to fetch by start date
        const allTerms = await termService.getAll();
        termToDisplay = allTerms.find(t => t.name === weekData.termName);
      }

      if (!termToDisplay) {
        setClasses([]);
        setClassrooms([]);
        setLoading(false);
        return;
      }

      // Load classes and classrooms
      const [allClasses, classroomsData] = await Promise.all([
        classService.getAll(),
        classroomService.getAll()
      ]);

      // Filter classes for this term only
      const termClasses = allClasses.filter(c => c.term?._id === termToDisplay._id);

      console.log('Loaded classes for term:', termToDisplay.name, termClasses);

      setClasses(termClasses);
      setClassrooms(classroomsData);
    } catch (err) {
      console.error('Error loading timetable data:', err);
      setError(err.message || 'Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  // Get classes for a specific day
  const getClassesForDay = (dayOfWeek) => {
    const filteredClasses = selectedClassroom === 'all'
      ? classes
      : classes.filter(c => c.classroom?._id === selectedClassroom);

    const dayClasses = [];

    filteredClasses.forEach(cls => {
      if (!cls.schedule || cls.schedule.length === 0) return;

      cls.schedule.forEach(schedule => {
        if (schedule.dayOfWeek === dayOfWeek) {
          dayClasses.push({
            ...cls,
            scheduleSlot: schedule
          });
        }
      });
    });

    return dayClasses;
  };

  // Calculate position and dimensions for each class
  const calculateClassLayout = (dayClasses) => {
    if (dayClasses.length === 0) return [];

    // Sort by start time
    const sortedClasses = [...dayClasses].sort((a, b) => {
      if (!a.scheduleSlot || !b.scheduleSlot) return 0;
      const timeA = timeToMinutes(a.scheduleSlot.startTime);
      const timeB = timeToMinutes(b.scheduleSlot.startTime);
      return timeA - timeB;
    });

    // Create layout array
    const layout = sortedClasses.map(cls => {
      // Safety check
      if (!cls.scheduleSlot) {
        console.error('Class missing scheduleSlot:', cls);
        return null;
      }

      const startMinutes = timeToMinutes(cls.scheduleSlot.startTime);
      const endMinutes = startMinutes + cls.scheduleSlot.duration;

      // Calculate position from top (8am = 0 minutes)
      const topPosition = ((startMinutes - 8 * 60) / 60) * SLOT_HEIGHT;
      const height = (cls.scheduleSlot.duration / 60) * SLOT_HEIGHT;

      return {
        class: cls,
        scheduleSlot: cls.scheduleSlot,
        startMinutes,
        endMinutes,
        topPosition,
        height,
        column: 0,
        totalColumns: 1
      };
    }).filter(Boolean);

    // Find overlapping classes and assign columns
    const groups = [];

    layout.forEach(item => {
      // Find which group this class belongs to
      let foundGroup = false;

      for (let group of groups) {
        // Check if this class overlaps with any class in the group
        const overlaps = group.some(g => checkOverlap(item, g));

        if (overlaps) {
          group.push(item);
          foundGroup = true;
          break;
        }
      }

      if (!foundGroup) {
        groups.push([item]);
      }
    });

    // Assign columns within each group
    groups.forEach(group => {
      group.forEach((item, index) => {
        item.column = index;
        item.totalColumns = group.length;
      });
    });

    return layout;
  };

  const checkOverlap = (class1, class2) => {
    return (
      (class1.startMinutes < class2.endMinutes && class1.endMinutes > class2.startMinutes)
    );
  };

  const getClassroomColor = (classroomId) => {
    const colors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#e91e63', '#16a085'];
    const index = classrooms.findIndex(c => c._id === classroomId);
    return colors[index % colors.length];
  };

  const calculateEndTime = (startTime, duration) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + duration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  const getTermTitle = () => {
    if (!termInfo) return '';

    if (termInfo.type === 'current') {
      if (termInfo.week) {
        // School term with week number
        return `${termInfo.termName} Week ${termInfo.week}`;
      } else {
        // Holiday without week number
        return termInfo.termName;
      }
    } else if (termInfo.type === 'upcoming') {
      const startDate = new Date(termInfo.startDate);
      return `${termInfo.termName} (starts ${startDate.toLocaleDateString()})`;
    }
    return '';
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="admin-page">
        <div className="alert alert-error">Error: {error}</div>
      </div>
    );
  }

  // If no term available
  if (termInfo?.type === 'none') {
    return (
      <div className="admin-page">
        <div className="page-header">
          <h1>Timetable</h1>
        </div>
        <div className="empty-state" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>No incoming term available</p>
        </div>
      </div>
    );
  }

  // Calculate total height for the day column
  const totalHeight = timeSlots.length * SLOT_HEIGHT;

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Timetable</h1>

        <div className="timetable-controls">
          <select
            value={selectedClassroom}
            onChange={(e) => setSelectedClassroom(e.target.value)}
            className="classroom-filter"
          >
            <option value="all">All Classrooms</option>
            {classrooms.map((room) => (
              <option key={room._id} value={room._id}>
                {room.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Term title */}
      <div className="timetable-term-title">
        <h2>{getTermTitle()}</h2>
      </div>

      <div className="timetable-container">
        <div className="timetable-wrapper">
          {/* Time labels column */}
          <div className="time-column">
            <div className="day-header-cell">Time</div>
            {timeSlots.map((timeSlot) => (
              <div key={`time-${timeSlot}`} className="time-label">
                {timeSlot}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {daysOfWeek.map((day, dayIndex) => {
            const dayClasses = getClassesForDay(dayOfWeekMapping[dayIndex]);
            const layout = calculateClassLayout(dayClasses);

            return (
              <div key={day} className="day-column">
                <div className="day-header-cell">{day}</div>
                <div className="day-content" style={{ height: `${totalHeight}px` }}>
                  {/* Time slot grid lines */}
                  {timeSlots.map((_, idx) => (
                    <div
                      key={idx}
                      className="time-grid-line"
                      style={{ top: `${idx * SLOT_HEIGHT}px` }}
                    />
                  ))}

                  {/* Class blocks */}
                  {layout.map((item) => {
                    // Safety check
                    if (!item || !item.class || !item.scheduleSlot) {
                      console.error('Invalid item in layout:', item);
                      return null;
                    }

                    const widthPercent = 100 / item.totalColumns;
                    const leftPercent = item.column * widthPercent;
                    const color = getClassroomColor(item.class.classroom?._id);
                    const isSmall = widthPercent < 50;

                    return (
                      <div
                        key={item.class._id}
                        className="class-block"
                        style={{
                          top: `${item.topPosition}px`,
                          left: `${leftPercent}%`,
                          width: `${widthPercent}%`,
                          height: `${item.height}px`,
                          backgroundColor: color,
                          borderLeft: `4px solid ${color}`,
                          filter: 'brightness(0.95)'
                        }}
                        title={`${item.class.name}\n${item.class.classroom?.name || 'No classroom'}\n${item.scheduleSlot?.startTime || 'N/A'} - ${calculateEndTime(item.scheduleSlot?.startTime || '00:00', item.scheduleSlot?.duration || 0)}\nStudents: ${item.class.students?.length || 0}`}
                      >
                        {!isSmall ? (
                          <div className="class-block-content">
                            <div className="class-name">{item.class.name}</div>
                            <div className="class-room">{item.class.classroom?.name || 'No room'}</div>
                            <div className="class-time">
                              {item.scheduleSlot?.startTime || 'N/A'} - {calculateEndTime(item.scheduleSlot?.startTime || '00:00', item.scheduleSlot?.duration || 0)}
                            </div>
                            <div className="class-students">{item.class.students?.length || 0} students</div>
                          </div>
                        ) : (
                          <div className="class-block-content-minimal">
                            <div className="class-name-small">{item.class.name}</div>
                          </div>
                        )}

                        {/* Hover tooltip */}
                        <div className="class-tooltip">
                          <div className="tooltip-row"><strong>{item.class.name}</strong></div>
                          <div className="tooltip-row">Room: {item.class.classroom?.name || 'No room'}</div>
                          <div className="tooltip-row">Time: {item.scheduleSlot?.startTime || 'N/A'} - {calculateEndTime(item.scheduleSlot?.startTime || '00:00', item.scheduleSlot?.duration || 0)}</div>
                          <div className="tooltip-row">Teacher: {item.class.teacher?.name || 'N/A'}</div>
                          <div className="tooltip-row">Students: {item.class.students?.length || 0}</div>
                        </div>
                      </div>
                    );
                  }).filter(Boolean)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      {selectedClassroom === 'all' && classrooms.length > 0 && (
        <div className="timetable-legend">
          <h3>Classroom Legend:</h3>
          <div className="legend-items">
            {classrooms.map((room) => (
              <div key={room._id} className="legend-item">
                <span
                  className="legend-color"
                  style={{ backgroundColor: getClassroomColor(room._id) }}
                ></span>
                <span>{room.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions
function generateTimeSlots() {
  const slots = [];
  for (let hour = 8; hour <= 21; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
  }
  return slots;
}

function timeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

export default Timetable;
