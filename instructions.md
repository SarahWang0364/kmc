Create a website for a tutoring centre (Kurt's Mathematics Centre, or KMC for short) with 3 types of users: student, teacher, admin. 

1. The main functionalities include 

Term: school term or holiday, where school term only allows classes to occur once a week, and holiday allows maximum 3 lessons per week on either Mon Wed Fri or Tue Thu Fri. School term lasts 10 weeks and holiday lasts 3 weeks. There are usually 4 school terms and 4 holidays each year. Each term contains a list of progress, the progress can be copied from previous terms. There should be a field asking whether this term is the first term of a new year, if selected yes, then when this term starts, the year group of students will be incremented automatically, and Y12 students will be deactivated. Named in the form (e.g. 25T1 or 25H1)

Progress: acts as a tag for different types of classes (e.g. Year 8 general class, Year 8 faster class), if students are absent this week, then they can switch to another class (during the same week and later than the current day) with the same progress. Progress also contains each week's content for the entire term. 
Content: contains a list of topics and tests for each week (one or more topics per week, can one or no test per week), also may or may not contain some text comments from the admin or the teacher. Classes with the same progress should generally teach the same 
content every week (unless the topics are changed by the teacher). Admin can choose to set content for specific weeks when creating progress, and when progress is assigned to a class when creating the class, the teacher of that class should be able to see and edit the content. 

topic: things to be taught in class, group by year (Y6, Y7, Y8, Y9, Y10, Y11, Y12 3U, Y12 4U) and term (T1, T2, T3, T4, does not depend on the actual current term, the term used in topic is just a filter to group the topics), should be in text

test: grouped the same way as topic, should be written in the form Y# Test# (e.g. Y8 Test1), term does not need to be included in the name

class: contains the following
- year (e.g. Y8)
- time (e.g. Fri 7pm-9pm), only at :00 or :30
- teacher (e.g. Sarah)
- class name (e.g. Sarah Y8 Fri 7pm-9pm)
- classroom
- list of students
- each student's test result for this term in their own school (added by the teacher, not manditory)
- for all weeks within the term, need to have the class notes (documents uploaded by the teacher or admin, can be empty), student's attendance (arrived / absent), homework completion (A, B, C, D, E, incomplete, missing, absent), comments for homework (can be empty), test or no test, if has test then the test mark for each student, and whether or not the student has been assigned detention this week and reason on why student received detention

detention: assigned by teacher or admin, comes in 3 forms (assigned, booked, completed). When detention is assigned, parents need to book for a time for detention on the student's page, then student comes for detention. If the student passes, detention is completed, if not passed, it is marked as incomplete, the number of attemps increment, and student needs to book again, if absent, the number of attemps does't increment, but student needs to book again. Need to include
- class
- student
- reason for detention 
- booked detention time (can be empty if assigned but not booked)
- is completed or not
- number of attempts

users: 3 types, student, teacher, admin. Teacher and admin are both staff, and a staff can be both a teacher and an admin. The data base needs to initially include an admin with password Kurt2389. All other users need to have: 
- name (auto append 1, 2, 3 etc if dup names)
- phone number 
- email address
- password (initially a randomly generated, admin gives the initial password, the login page should include a register button, where the user types their email and initial password to verify their identity, then have the choice to reset their password)
- log in with email and password

admin: able to class into student and teacher's web page to modify things, has the highest access. Admins that are also teachers should be able to switch between their teacher's page and admins page easily on the top corner after logged in
teacher: teach classes
students: Each student can usually only join one class, but Y12 students can join both Y12 3U or Y12 4U class (in the scenario when updating class details for the next year, e.g. if students are currently in Y11 this year, and T1 next year is marked as the first term in a new year, then when updating details of classes in all existing i.e. created terms after and including T1 next year, the student will be considered Y12 and will be able to entire both Y12 3U and Y12 4U).  With additional fields on top of users
- school 
- year (Y6, Y7, Y8, Y9, Y10, Y11, Y12)
- starting term (which term they start to take classes, not mandatory)
- class (which class they will join, not mandatory)
- notes (admin's notes when creating the student, not mandatory)

classrooms:
- room name
- capacity

followups: includes the issue (mandatory), solution (not mandatory), and due date (mandotary), and is displayed on admin's page to be marked as completed. 

2. guidance on the UI
Should be as simple as possible, no need to have gradient colour or pictures. Can use icons for simplicity.
Home page should be a login page which can switch tab between the 3 types of users: student, teach and admin. Includes register and forget password. All autoemails are sent from no-reply-KMC@hotmail.com

Admin's page (only used on computer, mobile devices should not display admin login):
On the left, there should be a menu
menu1: home page, should include 3 sections:
- on the top, display followups, ranked by earliest due date. For followups that are due today or before today, display in red. If there are too many followups, the top section should allow page flip. If the text within a followup is too long, followup should display the all content on hover. There should be a button to click done for the followup, and followup is marked as complete and disappears from the homepage. 
- the bottom left should display tables for students and tickboxes to mark attendence for all classes today, each class has its own table, and the classes are ranked by the class time. If there are too many students or classes, scroll should be allowed. This section should take at least half of the bottom section
- the bottom right should display one table containing all students completing detention today, with columns for student name, a dropdown for detention status (complete, incomplete, absent), which class the student is from, which week is this detention assiged (e.g. week 1)

menu 2: timetable
Looks like google calendar, displays days from Saturday to Friday, 8am-10pm, contains all classes, and a dash for the current time. On the top right corner, it should include a tab to switch between week and day. If switched to day, it should display all classes in different rooms within this day, and there should be a dropdown to switch between days. For the week tab, there should be a dropdown to select which room's classes to display, by default it displays all room's classes, and classes at the same time will be squashed. The classes from different rooms can be grouped by colour. On the calender, classes should display class name, time and room. If there are too many classes, only display the colour, but admin should be able to switch to day tab to view all classes. 

menu 3a: student list
Gives the list of students, displays their name, phone, email, school, year, class in the current term, number of absences, should be able to sort by all of the columns listed. Can filter by searching student name, clicking on Year and class dropdowns. Can deactivate or reactivate students, and can delete if deactivated. Can add students with mandatory fields email, name, phone no., school and no mandatory fields term (dropdown), class (dropdown) and admin input notes. Can modify each student's details. The name of the student should be a href to the student's home page, admin should be able to do what the student can do. 

menu 3b: class list 
Gives the list of classes, displays name, progress, year, class time, classroom, student count, teacher, term, should be able to short by all listed columns. Can search by class name, and filter by term, on default only display classes in the current term. Add class should have mandatory fields for teacher (dropdown), year (dropdown, Y7, Y8, Y9, Y10, Y11, Y12 3U, Y12 4U), classroom (dropdown), week days (multiselect up to 3 for holidays and 1 for school terms), class start time (in :00 and :30) and duration with gap of 0.5 hours. Not mandatory field is a button for add student, and a switch for allowing the class to be copied to the next term, but only for school terms. If selected, then the current class is auto copied when creating a new school term. Add student should have a pop up modal for searching and multiselecting students. Classes can be editted here, can also be deleted. The name of the class should be a href to the teacher's page with the current class, and admin should be able to do what the teacher can do.

menu 3c: classroom list
Shows classrooms by name, capacity, status (currently in use by a class or not), can be sorted by the columns. Should be able to deactivate or reactivate students, and can delete if deactivated. Can search by classroom name or filter by classes. 

menu 3d: staff list
shows name, phone no., email, role (teach, admin or both), can sort by columns. Search by name or class. Can add, modify, deactivate and reactivate a staff. 

menu 3d: term list
shows name, type (holiday / school term), duration, and current term indicator. Can delete a term. Can add a term with name, type, start date and number of weeks. 

menu 3e: progress list
on default displays the progresses added for the current term, showing the name, term, year which can be sorted. Can filter using term or year. Adding a progress will require the name of the progress, dropdown for the term, dropdown for year group, and select the classes with this progress. Also allows filling in of the content (topics) for each week during the term, but is not mandatory. 

menu 3f: gives the grouped topics, can create new topics

menu 4a: design a page for admin to create and modify available spots for detention easily. We want to be able to decide the classroom and duration of detention, and the capacity of detention is the capacity of the classroom. Make this easy for admins to create available detention spots in a batch. 

menu 4b: unbooked detention
gives a list of student detentions that have been assigned but not yet booked by students, ranked by days since issued, shows the name of student, email, phone no., and all details included for detention. Can add a detention on this page.

menu 5a: followup
a list of followups, can create or modify.

menu 5b: change class log
default displays current term, can filter by searching students, selecting terms, classes or dates. Gives the name, current class and original class of the student, the week in the term where they changed a class, and the number of times they changed class within the term. 

menu 5c: absense summary
display current term only. Can search by student name, select class and dates. Shows a list of students who were absent, shows the name, email, class, week in the term where they were absent, and indicator of whether the class notes have been sent. 

menu 5d: operation history
gives the detail of what the admin has done.

teacher's page: use what we have above, design a teacher's page so that the teacher can do the functionalities listed above. No mobile device should be used, login page should not include teacher if mobile is used. 

student's page: should be able to see all class history, but default showing their class in the current term, their homework completion and test marks. On the side, should have a section showing unbooked detention, booked detention and completed detention, showing necessary details. Should be able to book for detention by selecting dates on the calendar, which then shows the time for all available spots. Design a web page for them. Should be adapted for both mobile and PC. 