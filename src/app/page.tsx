"use client";
/* eslint-disable react/no-unescaped-entities */

import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase-browser";
import { Archive, Bell, BookOpen, CalendarDays, Check, ChevronRight, CircleHelp, ClipboardCheck, Home as HomeIcon, Menu, MoreHorizontal, PanelLeftClose, Plus, Search, Settings, Sparkles, Target, Users, X } from "lucide-react";

type Section = "home" | "calendar" | "tasks" | "tests" | "more";
type Task = { id: number; subject: string; title: string; due: string; time: string; priority: "High" | "Medium" | "Low"; color: string; completed: boolean };

const initialTasks: Task[] = [
  { id: 1, subject: "Geometry", title: "Worksheet 4 · Similarity", due: "Today", time: "11:59 PM", priority: "High", color: "#4f7cff", completed: false },
  { id: 2, subject: "English", title: "Essay outline", due: "Tomorrow", time: "8:00 AM", priority: "Medium", color: "#a06bd8", completed: true },
  { id: 3, subject: "Spanish", title: "Vocabulary practice", due: "Sep 24", time: "11:59 PM", priority: "Low", color: "#d99527", completed: false },
];

const navItems: { id: Section; label: string; icon: typeof HomeIcon }[] = [
  { id: "home", label: "Home", icon: HomeIcon }, { id: "calendar", label: "Calendar", icon: CalendarDays }, { id: "tasks", label: "Tasks", icon: ClipboardCheck }, { id: "tests", label: "Tests", icon: Target }, { id: "more", label: "More", icon: MoreHorizontal },
];

function SubjectDot({ color }: { color: string }) { return <span className="subject-dot" style={{ background: color }} />; }

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [section, setSection] = useState<Section>("home");
  const [tasks, setTasks] = useState(initialTasks);
  const [quickAdd, setQuickAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [sidebar, setSidebar] = useState(true);
  const [toast, setToast] = useState("");
  const [newTitle, setNewTitle] = useState("");
  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => listener.subscription.unsubscribe();
  }, []);
  const filteredTasks = useMemo(() => tasks.filter((task) => `${task.subject} ${task.title}`.toLowerCase().includes(search.toLowerCase())), [tasks, search]);
  const toggleTask = (id: number) => setTasks((current) => current.map((task) => task.id === id ? { ...task, completed: !task.completed } : task));
  const addTask = () => { if (!newTitle.trim()) return; setTasks((current) => [...current, { id: Date.now(), subject: "Geometry", title: newTitle.trim(), due: "Tomorrow", time: "11:59 PM", priority: "Medium", color: "#4f7cff", completed: false }]); setNewTitle(""); setQuickAdd(false); setToast("Homework added successfully."); window.setTimeout(() => setToast(""), 2800); };

  if (authLoading) return <div className="auth-loading">Checking your classroom session...</div>;
  if (!session) return <AuthScreen />;

  return <div className="app-shell">
    <aside className={`sidebar ${sidebar ? "" : "collapsed"}`}>
      <div className="brand"><div className="brand-mark"><BookOpen size={18} /></div>{sidebar && <div><strong>Classroom</strong><span>G9 · 2026</span></div>}</div>
      <div className="class-switcher"><div className="avatar">9B</div>{sidebar && <div><span>Current class</span><strong>Class 9B <ChevronRight size={14} /></strong></div>}</div>
      <nav className="side-nav" aria-label="Main navigation"><span className="nav-label">Workspace</span>{navItems.map(({ id, label, icon: Icon }) => <button key={id} className={section === id ? "active" : ""} onClick={() => setSection(id)} title={label}><Icon size={18} /><span>{sidebar && label}</span>{sidebar && id === "tasks" && <b className="nav-count">3</b>}</button>)}</nav>
      <div className="sidebar-bottom">{sidebar && <div className="role-card"><div className="role-icon"><Users size={16} /></div><div><strong>Student view</strong><span>Shared class space</span></div></div>}<button className="settings-button"><Settings size={17} /><span>{sidebar && "Settings"}</span></button><button className="sidebar-toggle" onClick={() => setSidebar(!sidebar)}>{sidebar ? <PanelLeftClose size={17} /> : <Menu size={17} />}<span>{sidebar && "Collapse"}</span></button></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><div className="mobile-brand"><div className="brand-mark"><BookOpen size={17} /></div><strong>Classroom</strong></div><div className="search-wrap"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search classwork..." aria-label="Search classwork" />{search && <button onClick={() => setSearch("")} aria-label="Clear search"><X size={14} /></button>}<kbd>⌘ K</kbd></div><div className="top-actions"><button className="icon-button" aria-label="Notifications"><Bell size={18} /><i /></button><button className="profile" onClick={() => void supabase.auth.signOut()} title="Sign out"><div className="profile-avatar">{(session.user.user_metadata.name ?? session.user.email ?? "U").slice(0, 2).toUpperCase()}</div><span>{session.user.user_metadata.name ?? session.user.email}</span><ChevronRight size={14} /></button></div></header>
      <div className="page-wrap">{section === "home" && <HomeView tasks={filteredTasks} toggleTask={toggleTask} onQuickAdd={() => setQuickAdd(true)} />}{section === "tasks" && <ListView title="Tasks" eyebrow="Classwork" tasks={filteredTasks} toggleTask={toggleTask} onQuickAdd={() => setQuickAdd(true)} />}{section === "tests" && <TestsView />}{section === "calendar" && <CalendarView />}{section === "more" && <MoreView />}</div>
    </main>
    <button className="quick-add" onClick={() => setQuickAdd(true)}><Plus size={19} /><span>Quick add</span></button>
    <nav className="bottom-nav" aria-label="Mobile navigation">{navItems.map(({ id, label, icon: Icon }) => <button key={id} className={section === id ? "active" : ""} onClick={() => setSection(id)}><Icon size={19} /><span>{label}</span></button>)}</nav>
    {quickAdd && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setQuickAdd(false)}><div className="quick-modal"><div className="modal-heading"><div><span className="eyebrow">Create new</span><h2>What would you like to add?</h2></div><button className="icon-button" onClick={() => setQuickAdd(false)} aria-label="Close"><X size={18} /></button></div><div className="add-options"><button onClick={() => document.getElementById("title-input")?.focus()}><ClipboardCheck size={20} /><span><strong>Homework</strong><small>Add a shared class task</small></span><ChevronRight size={16} /></button><button><Target size={20} /><span><strong>Test</strong><small>Keep everyone prepared</small></span><ChevronRight size={16} /></button><button><Bell size={20} /><span><strong>Reminder</strong><small>Bring something or remember a date</small></span><ChevronRight size={16} /></button><button><FileTextIcon /><span><strong>Announcement</strong><small>Share an update with the class</small></span><ChevronRight size={16} /></button></div><div className="mini-form"><label htmlFor="title-input">Homework title</label><input id="title-input" value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder="e.g. Read chapter 5" onKeyDown={(event) => event.key === "Enter" && addTask()} /><button className="primary-button" onClick={addTask}>Add homework <Plus size={16} /></button></div></div></div>}
    {toast && <div className="toast"><span className="toast-check"><Check size={14} /></span>{toast}</div>}
  </div>;
}

function AuthScreen() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true); setMessage("");
    const result = mode === "login"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { name } } });
    setLoading(false);
    if (result.error) setMessage(result.error.message);
    else if (mode === "signup" && !result.data.session) setMessage("Check your email to confirm your account.");
  };
  return <main className="auth-page"><section className="auth-card"><div className="auth-logo"><BookOpen size={22} /></div><span className="eyebrow">Class 9B · Shared classroom</span><h1>{mode === "login" ? "Welcome back" : "Join your class"}</h1><p>{mode === "login" ? "Sign in to see what is happening in Class 9B." : "Create your student account to join Class 9B."}</p><form onSubmit={submit}>{mode === "signup" && <label>Name<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" /></label>}<label>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label><label>Password<input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" /></label>{message && <div className="auth-message">{message}</div>}<button className="primary-button auth-submit" disabled={loading}>{loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}</button></form><button className="auth-switch" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); }}>{mode === "login" ? "Need an account? Create one" : "Already have an account? Sign in"}</button></section></main>;
}

function FileTextIcon() { return <span className="file-icon">▤</span>; }
function Header({ eyebrow, title, sub, action }: { eyebrow: string; title: string; sub?: string; action?: React.ReactNode }) { return <div className="page-header"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{sub && <p>{sub}</p>}</div>{action}</div>; }
function HomeView({ tasks, toggleTask, onQuickAdd }: { tasks: Task[]; toggleTask: (id: number) => void; onQuickAdd: () => void }) { return <><Header eyebrow="Monday, September 22, 2026" title="Good evening, Jamie" sub="Here's what's happening in Class 9B." action={<button className="outline-button" onClick={onQuickAdd}><Plus size={16} /> Add to class</button>} /><section className="tomorrow-banner"><div className="tomorrow-icon"><Sparkles size={22} /></div><div><span className="eyebrow">Tomorrow · Tuesday, Sep 23</span><h2>3 things on your radar</h2></div><div className="tomorrow-items"><span><SubjectDot color="#4f7cff" />Geometry worksheet</span><span><SubjectDot color="#36a269" />Biology · bring materials</span><span><SubjectDot color="#a06bd8" />English essay outline</span></div><ChevronRight className="banner-arrow" size={20} /></section><div className="dashboard-grid"><div className="main-column"><section className="section-block"><div className="section-heading"><div><span className="eyebrow">Stay on track</span><h2>Upcoming work</h2></div><button className="text-button">View all <ChevronRight size={15} /></button></div><div className="task-list">{tasks.map((task) => <TaskRow key={task.id} task={task} onToggle={() => toggleTask(task.id)} />)}</div></section><section className="section-block weekly"><div className="section-heading"><div><span className="eyebrow">The week ahead</span><h2>Weekly overview</h2></div><button className="text-button">Open calendar <ChevronRight size={15} /></button></div><div className="week-strip">{[["MON", "22", "2 items"], ["TUE", "23", "3 items"], ["WED", "24", "Biology test"], ["THU", "25", "1 item"], ["FRI", "26", "School event"]].map(([day, date, note], index) => <div className={`day-cell ${index === 0 ? "today" : ""}`} key={day}><span>{day}</span><strong>{date}</strong><small>{note}</small></div>)}</div></section></div><aside className="right-column"><section className="notice-card"><div className="card-topline"><span className="notice-badge"><Bell size={13} /> Class notice</span><span className="muted">Pinned</span></div><h3>Bring your PE uniform tomorrow.</h3><p>We'll have practice during the last period. Please remember your indoor shoes too.</p><div className="notice-footer"><div className="mini-avatar">MS</div><span>Ms. Santos · 2 hours ago</span></div></section><section className="dday-card"><div className="dday-label"><Target size={15} /> Next test</div><div className="dday-content"><div><span className="subject-label"><SubjectDot color="#36a269" /> Biology</span><h3>Chapters 6–7</h3><p>Thursday, September 24 · Room 204</p></div><strong className="dday-number">D<span>−</span>2</strong></div></section><section className="updates-card"><div className="section-heading"><h3>Recently updated</h3><button className="icon-button"><MoreHorizontal size={17} /></button></div>{["Biology test · range updated", "Geometry homework · deadline changed", "New class announcement"].map((item, index) => <div className="update-row" key={item}><span className={`update-dot dot-${index}`} /><div><strong>{item}</strong><small>{["10 min ago", "1 hr ago", "2 hrs ago"][index]}</small></div></div>)}</section></aside></div></>; }
function TaskRow({ task, onToggle }: { task: Task; onToggle: () => void }) { return <div className={`task-row ${task.completed ? "done" : ""}`}><button className="check-button" onClick={onToggle} aria-label={`${task.title} ${task.completed ? "completed" : "mark completed"}`}>{task.completed && <Check size={14} />}</button><SubjectDot color={task.color} /><div className="task-info"><strong>{task.title}</strong><span>{task.subject} <b>·</b> Due {task.due} at {task.time}</span></div><span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span><button className="row-more" aria-label="More options"><MoreHorizontal size={17} /></button></div>; }
function ListView({ title, eyebrow, tasks, toggleTask, onQuickAdd }: { title: string; eyebrow: string; tasks: Task[]; toggleTask: (id: number) => void; onQuickAdd: () => void }) { return <><Header eyebrow={eyebrow} title={title} sub="Everything shared with Class 9B, in one place." action={<button className="primary-button" onClick={onQuickAdd}><Plus size={16} /> Add homework</button>} /><div className="filter-bar"><button className="filter-active">All tasks <span>{tasks.length}</span></button><button>Due soon</button><button>Completed</button><div className="filter-spacer" /><button className="outline-button"><Archive size={15} /> Archive</button></div><section className="full-list">{tasks.length ? tasks.map((task) => <TaskRow key={task.id} task={task} onToggle={() => toggleTask(task.id)} />) : <EmptyState text="No homework matches your search." />}</section></>; }
function TestsView() { return <><Header eyebrow="Assessment calendar" title="Tests" sub="Plan ahead for what's coming up." action={<button className="primary-button"><Plus size={16} /> Add test</button>} /><div className="test-grid">{[{ subject: "Biology", title: "Chapters 6–7", date: "Sep 24", day: "D−2", color: "#36a269", range: "Cells, genetics, and evolution", room: "Room 204" }, { subject: "Geometry", title: "Unit 2 · Similarity", date: "Oct 01", day: "D−9", color: "#4f7cff", range: "Triangle similarity proofs", room: "Room 112" }, { subject: "Spanish", title: "Vocabulary quiz", date: "Oct 06", day: "D−14", color: "#d99527", range: "La escuela · 30 words", room: "Room 306" }].map((test) => <div className="test-card" key={test.title}><div className="test-card-top"><span className="subject-label"><SubjectDot color={test.color} />{test.subject}</span><strong>{test.day}</strong></div><h2>{test.title}</h2><div className="test-date"><CalendarDays size={15} /> {test.date}, 2026</div><div className="test-detail"><span>Coverage</span><strong>{test.range}</strong></div><div className="test-detail"><span>Location</span><strong>{test.room}</strong></div></div>)}</div></>; }
function CalendarView() { return <><Header eyebrow="Class schedule" title="Calendar" sub="A clear view of every deadline and event." action={<div className="view-toggle"><button className="active">Month</button><button>Week</button><button>Day</button></div>} /><section className="calendar-card"><div className="calendar-toolbar"><button className="icon-button"><ChevronRight size={17} className="rotate-180" /></button><h2>September 2026</h2><button className="icon-button"><ChevronRight size={17} /></button><button className="today-button">Today</button></div><div className="calendar-grid">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div className="calendar-weekday" key={d}>{d}</div>)}{Array.from({ length: 30 }, (_, i) => <div className={`calendar-day ${i + 1 === 22 ? "selected" : ""}`} key={i}><span>{i + 1}</span>{[22, 23, 24, 25].includes(i + 1) && <div className={`calendar-event event-${(i + 1) % 3}`}>{i + 1 === 24 ? "Biology test" : i + 1 === 23 ? "English essay" : "Geometry"}</div>}</div>)}</div></section></>; }
function MoreView() { return <><Header eyebrow="Classroom tools" title="More" sub="Questions, announcements, and class resources." /><div className="more-grid"><div className="tool-panel"><div className="tool-icon purple"><CircleHelp size={20} /></div><h2>Anonymous questions</h2><p>Ask the class team without sharing your name.</p><button className="outline-button">Ask a question <ChevronRight size={15} /></button></div><div className="tool-panel"><div className="tool-icon amber"><Bell size={20} /></div><h2>Announcements</h2><p>Important notes from teachers and class presidents.</p><div className="announcement-mini"><strong>PE uniform tomorrow</strong><span>Posted 2 hours ago</span></div></div><div className="tool-panel"><div className="tool-icon green"><Archive size={20} /></div><h2>Archive</h2><p>Browse past classwork organized by month.</p><button className="outline-button">Open archive <ChevronRight size={15} /></button></div></div></>; }
function EmptyState({ text }: { text: string }) { return <div className="empty-state"><Sparkles size={22} /><strong>{text}</strong><span>Try a different search or check back later.</span></div>; }
