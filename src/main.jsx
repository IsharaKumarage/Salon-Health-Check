import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Clock, MessageCircle, Wallet, PackageCheck, BarChart3, Sparkles, AlertTriangle, CheckCircle2, ArrowRight, ArrowLeft, PhoneCall, Heart, CalendarCheck, UserRound, FileText, Users } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import './styles.css';

const questions = [
  {
    id: 'bookingMethod',
    category: 'Booking Confusion',
    icon: CalendarDays,
    scenario: 'Double Booking Disaster',
    eyebrow: 'Scenario 01 of 05',
    title: 'It is Saturday. Your salon is busy. One client books through WhatsApp. Another calls for the same stylist.',
    question: 'What usually happens next?',
    emotionalLine: 'Manual booking feels simple until two clients want the same chair.',
    options: [
      { label: 'Customer waits angrily', score: 25, loss: 35000 },
      { label: 'Staff panic and try to manage', score: 38, loss: 30000 },
      { label: 'Appointment gets delayed', score: 55, loss: 18000 },
      { label: 'We use a live scheduler', score: 92, loss: 3000 }
    ],
    solution: 'Beautech prevents this with live appointment scheduling, employee-wise calendars, and clear booking visibility.'
  },
  {
    id: 'noShows',
    category: 'No-show Losses',
    icon: Clock,
    scenario: 'Empty Chair Problem',
    eyebrow: 'Scenario 02 of 05',
    title: 'A client confirmed yesterday, but today they did not come. The chair stays empty during peak hours.',
    question: 'How many no-shows happen per week?',
    emotionalLine: 'Every forgotten appointment is an empty chair that could have earned money.',
    type: 'range',
    min: 0,
    max: 20,
    default: 4,
    getScore: (v) => Math.max(10, 100 - v * 4),
    getLoss: (v) => v * 3500 * 4,
    solution: 'Beautech automated reminders help reduce forgotten appointments and protect daily revenue.'
  },
  {
    id: 'followups',
    category: 'Missed Follow-ups',
    icon: MessageCircle,
    scenario: 'Client Never Returns',
    eyebrow: 'Scenario 03 of 05',
    title: 'A customer loved the service. Two months pass. Nobody reminds them to rebook.',
    question: 'How do you usually bring clients back?',
    emotionalLine: 'Many salons lose clients not because service is bad, but because no one follows up.',
    options: [
      { label: 'We do not follow up', score: 25, loss: 48000 },
      { label: 'Staff remember manually', score: 45, loss: 30000 },
      { label: 'WhatsApp sometimes', score: 65, loss: 16000 },
      { label: 'Automated reminders', score: 95, loss: 3000 }
    ],
    solution: 'Beautech supports customer history, loyalty tracking, and bulk messages to improve repeat visits.'
  },
  {
    id: 'inventory',
    category: 'Inventory Leakage',
    icon: PackageCheck,
    scenario: 'Product Finished Suddenly',
    eyebrow: 'Scenario 04 of 05',
    title: 'A client arrives for a treatment. Staff realizes the required product is finished or missing.',
    question: 'How often does product stock become unclear?',
    emotionalLine: 'Small product losses become a silent cost every month.',
    options: [
      { label: 'Very often', score: 25, loss: 30000 },
      { label: 'Sometimes', score: 55, loss: 16000 },
      { label: 'Rarely', score: 75, loss: 7000 },
      { label: 'We track stock properly', score: 95, loss: 1500 }
    ],
    solution: 'Beautech inventory, product usage, purchases, and stock reports help control every product movement.'
  },
  {
    id: 'staffLoad',
    category: 'Staff Imbalance',
    icon: BarChart3,
    scenario: 'One Stylist Overloaded',
    eyebrow: 'Scenario 05 of 05',
    title: 'One stylist is fully packed. Another stylist is free. Customers are waiting and staff are stressed.',
    question: 'Can you instantly see staff workload?',
    emotionalLine: 'When staff time is not balanced, clients wait and chairs stay unused.',
    options: [
      { label: 'No', score: 30, loss: 26000 },
      { label: 'Only by asking staff', score: 48, loss: 17000 },
      { label: 'Sometimes', score: 70, loss: 8500 },
      { label: 'Yes, from dashboard', score: 95, loss: 2000 }
    ],
    solution: 'Beautech employee schedules and appointment views help owners manage workload clearly.'
  }
];

const fmt = (n) => `Rs. ${Math.round(n).toLocaleString()}`;

function App() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ noShows: 4 });
  const [lead, setLead] = useState({ name: '', salon: '', phone: '' });
  const current = questions[step];
  const isResult = step >= questions.length;

  const analysis = useMemo(() => {
    const categories = [];
    const pains = [];
    let totalScore = 0;
    let totalLoss = 0;
    questions.forEach((q) => {
      let score;
      let loss;
      if (q.type === 'range') {
        const v = answers[q.id] ?? q.default;
        score = q.getScore(v);
        loss = q.getLoss(v);
      } else {
        const selected = q.options[answers[q.id] ?? 0];
        score = selected.score;
        loss = selected.loss;
      }
      totalScore += score;
      totalLoss += loss;
      categories.push({ name: q.category, score: Math.round(score), loss });
      if (score < 75) pains.push(q);
    });
    return {
      score: Math.round(totalScore / questions.length),
      monthlyLoss: totalLoss,
      recovery: totalLoss * 0.65,
      categories,
      pains
    };
  }, [answers]);

  const progress = !started ? 0 : isResult ? 100 : Math.round(((step + 1) / questions.length) * 100);

  return (
    <main>
      <Sidebar progress={progress} active={started ? (isResult ? 6 : step + 1) : 0} />
      <section className="page-shell">
        <TopSummary recovery={analysis.recovery} />
        <AnimatePresence mode="wait">
          {!started && <Welcome key="welcome" onStart={() => setStarted(true)} />}
          {started && !isResult && (
            <Scenario
              key={current.id}
              current={current}
              step={step}
              answers={answers}
              setAnswers={setAnswers}
              analysis={analysis}
              onBack={() => setStep(Math.max(0, step - 1))}
              onNext={() => setStep(step + 1)}
            />
          )}
          {isResult && <Result key="result" analysis={analysis} lead={lead} setLead={setLead} setStep={setStep} />}
        </AnimatePresence>
      </section>
    </main>
  );
}

function Sidebar({ active }) {
  const items = ['Welcome', 'Booking Chaos', 'No-shows', 'Lost Customers', 'Inventory Issues', 'Staff & Schedule', 'Your Results'];
  return <aside className="sidebar">
    <div className="logo"><div className="lotus">✦</div><h2>BEAUTECH</h2><span>Salon Software</span></div>
    <nav>{items.map((item, idx) => <div className={`nav-item ${active === idx ? 'active' : ''}`} key={item}><b>{idx + 1}</b><span>{item}</span></div>)}</nav>
    <div className="quote">“Every day without a system is a day of lost revenue and unhappy customers.”<br/><br/>– Beautech</div>
  </aside>
}

function TopSummary({ recovery }) {
  return <header className="top-summary">
    <div><span className="pill">BEAUTECH SALON HEALTH CHECK</span><h1>Your salon may be <em>losing money</em> every single day...</h1><p>Without you even realizing it. Find hidden operational problems and see how Beautech can help fix them.</p></div>
    <div className="chaos-card"><p>Today’s Chaos Level</p><div className="meter"><span>72%</span></div><b>High Chaos</b><small>More stress. More mistakes. More loss.</small></div>
    <div className="recovery-card"><p>Possible Monthly Recovery</p><h3>{fmt(recovery)}</h3><small>After automation</small></div>
  </header>
}

function Welcome({ onStart }) {
  return <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="welcome-grid">
    <div className="hero-card">
      <span className="pill pink">FREE BUSINESS TOOL</span>
      <h2>Your salon looks busy. But is it truly under control?</h2>
      <p>This interactive experience shows common salon problems through real scenarios: double bookings, no-shows, lost clients, product waste, and staff imbalance.</p>
      <div className="problem-grid">{['WhatsApp booking chaos', 'Missed calls', 'No-show alerts', 'Double bookings', 'Empty chairs', 'Staff stress'].map((x, i) => <div className="problem" key={x}><AlertTriangle size={18}/>{x}</div>)}</div>
      <button className="primary-btn" onClick={onStart}>Start My Salon Check <ArrowRight size={18}/></button>
    </div>
    <div className="visual-card">
      <div className="notification n1"><MessageCircle/> WhatsApp Booking<br/><small>New appointment 09:15 AM</small></div>
      <div className="notification n2"><AlertTriangle/> No Show Alert<br/><small>2 clients did not show up</small></div>
      <div className="notification n3"><PhoneCall/> Missed Calls<br/><small>3 missed calls today</small></div>
      <div className="owner-figure">😣</div>
      <h3>When everything depends on memory, the owner carries all the stress.</h3>
    </div>
  </motion.div>
}

function Scenario({ current, step, answers, setAnswers, analysis, onBack, onNext }) {
  const Icon = current.icon;
  const selected = answers[current.id] ?? 0;
  return <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="scenario-grid">
    <div className="scenario-card">
      <span className="eyebrow">{current.eyebrow}</span>
      <h2>{current.scenario}</h2>
      <p className="scenario-title">{current.title}</p>
      <p className="emotional">{current.emotionalLine}</p>
      <h4>{current.question}</h4>
      {current.type === 'range' ? <div className="range-box"><span>{answers[current.id] ?? current.default}</span><input type="range" min={current.min} max={current.max} value={answers[current.id] ?? current.default} onChange={(e) => setAnswers({ ...answers, [current.id]: Number(e.target.value) })}/></div> : <div className="answer-grid">{current.options.map((o, i) => <button className={selected === i ? 'answer active' : 'answer'} key={o.label} onClick={() => setAnswers({ ...answers, [current.id]: i })}><Icon size={22}/>{o.label}</button>)}</div>}
      <div className="actions"><button className="secondary-btn" onClick={onBack} disabled={step === 0}><ArrowLeft size={16}/> Back</button><button className="primary-btn" onClick={onNext}>{step === questions.length - 1 ? 'See My Salon Damage' : 'Next: What is the Damage?'} <ArrowRight size={16}/></button></div>
    </div>
    <div className="impact-card">
      <h3>This issue may cost your salon</h3>
      <h2>{fmt(current.type === 'range' ? current.getLoss(answers[current.id] ?? current.default) : current.options[selected].loss)}</h2>
      <p>Every Month</p>
      <ul><li>Lost customer trust</li><li>Empty time slots</li><li>Staff stress and mistakes</li><li>Bad reviews and reputation risk</li></ul>
      <div className="solution"><Sparkles size={22}/><p>{current.solution}</p></div>
    </div>
    <div className="live-card"><p>Your Salon’s Monthly Revenue Leak</p><h2>{fmt(analysis.monthlyLoss)}</h2><div className="mini-metrics">{analysis.categories.slice(0,4).map(c => <span key={c.name}>{c.name}<b>{fmt(c.loss)}</b></span>)}</div></div>
  </motion.div>
}

function Result({ analysis, lead, setLead, setStep }) {
  return <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="result-grid">
    <div className="final-card dark"><span className="pill">YOUR SALON DIAGNOSIS</span><h2>Your salon is working hard... but your systems are working against you.</h2><p>Your biggest hidden monthly revenue leak is estimated at:</p><h1>{fmt(analysis.monthlyLoss)}+</h1><div className="loss-row">{analysis.categories.slice(0,4).map(c => <div key={c.name}><Clock size={20}/><b>{fmt(c.loss)}</b><span>{c.name}</span></div>)}</div></div>
    <div className="final-card"><h3>Your Biggest Risks</h3>{analysis.categories.map(c => <div className="risk-row" key={c.name}><span>{c.name}</span><div><i style={{width: `${Math.max(8, 100-c.score)}%`}}></i></div><b>{c.score < 50 ? 'High' : c.score < 75 ? 'Medium' : 'Low'}</b></div>)}</div>
    <div className="final-card"><h3>From Chaos to Control ✨</h3><div className="before-after"><div><b>BEFORE</b><p>WhatsApp confusion, notebooks, missed reminders, unclear revenue.</p></div><ArrowRight/><div><b>AFTER BEAUTECH</b><p>Organized bookings, automated reminders, staff visibility, real-time reports.</p></div></div><div className="benefits"><span><CalendarCheck/> Organized bookings</span><span><Heart/> Happy customers</span><span><FileText/> Real-time reports</span><span><Users/> Balanced staff</span></div></div>
    <div className="final-card cta"><Heart size={32}/><h3>Want to see how Beautech would work inside YOUR salon?</h3><p>Get a personalized demo and see the transformation for yourself.</p><input placeholder="Owner name" value={lead.name} onChange={(e) => setLead({...lead, name: e.target.value})}/><input placeholder="Salon name" value={lead.salon} onChange={(e) => setLead({...lead, salon: e.target.value})}/><input placeholder="Phone number" value={lead.phone} onChange={(e) => setLead({...lead, phone: e.target.value})}/><button className="primary-btn full">Book Free Demo</button><button className="secondary-btn full" onClick={() => setStep(0)}>Restart Check</button></div>
    <div className="final-card chart"><h3>Salon Health Breakdown</h3><ResponsiveContainer width="100%" height={260}><BarChart data={analysis.categories}><XAxis dataKey="name" tick={{fontSize: 10}} interval={0}/><YAxis domain={[0,100]}/><Tooltip/><Bar dataKey="score" radius={[12,12,0,0]} fill="#D9828E"/></BarChart></ResponsiveContainer></div>
  </motion.div>
}

createRoot(document.getElementById('root')).render(<App />);
