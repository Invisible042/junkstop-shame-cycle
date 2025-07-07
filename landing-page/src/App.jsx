import React, { useState } from 'react';
import './App.css';

const avatarUrl = 'https://ui-avatars.com/api/?name=JunkStop&background=2ecc71&color=fff&size=128';
const journeyAvatars = [
  { day: 0, label: 'Rock Bottom', locked: false },
  { day: 1, label: 'Day 1', locked: false },
  { day: 2, label: 'Day 2', locked: true },
  { day: 3, label: 'Day 3', locked: true },
  { day: 4, label: 'Day 4', locked: true },
  { day: 5, label: 'Thriving', locked: true },
];
const features = [
  { icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2ecc71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>, title: 'AI Coach', desc: 'Personalized, motivational insights every day.' },
  { icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>, title: 'Anonymous Support', desc: 'Share and connect without fear of judgment.' },
  { icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f1c40f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z" /></svg>, title: 'Guilt & Regret Tracking', desc: 'Reflect, learn, and grow from every slip.' },
];
const testimonials = [
  { name: 'Anonymous', text: 'JunkStop helped me break the cycle. The AI coach feels like a real friend!', icon: '🧑‍💻' },
  { name: 'User42', text: 'Seeing my streak grow is so motivating. The community is super supportive.', icon: '👩‍🎤' },
  { name: 'M.', text: 'Logging my cravings and getting instant feedback changed everything.', icon: '🧑‍🎨' },
];

function App() {
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const nextTestimonial = () => setTestimonialIdx((testimonialIdx + 1) % testimonials.length);
  const prevTestimonial = () => setTestimonialIdx((testimonialIdx - 1 + testimonials.length) % testimonials.length);

  return (
    <div className="modern-bg">
      {/* Animated Gradient Background */}
      <div className="animated-gradient" />
      {/* Hero Section */}
      <section className="modern-hero">
        <div className="modern-hero-left">
          <div className="modern-avatar-glass">
            <img src={avatarUrl} alt="Motivational Avatar" className="modern-hero-avatar" />
            <div className="modern-avatar-glow" />
          </div>
        </div>
        <div className="modern-hero-right">
          <div className="modern-cta-card glassy-float">
            <h1 className="modern-hero-title animate-gradient-text">Start Your Journey Today</h1>
            <p className="modern-hero-subtext">Let your reflection guide you toward healthier choices.</p>
            <button className="modern-cta-btn">Get the App</button>
          </div>
        </div>
      </section>

      {/* Journey Preview */}
      <section className="modern-journey">
        <h2 className="modern-section-title">Your Journey</h2>
        <div className="modern-journey-scroll">
          {journeyAvatars.map((a, i) => (
            <div key={i} className={`modern-journey-card glassy-float ${a.locked ? 'locked' : ''}`}>
              <img src={avatarUrl} alt={a.label} className="modern-journey-avatar" />
              <div className="modern-journey-label">{a.label}</div>
              <div className="modern-journey-progress">
                <div className="modern-journey-bar" style={{ width: `${(i / (journeyAvatars.length - 1)) * 100}%`, background: a.locked ? '#8884' : '#2ecc71' }} />
              </div>
              {a.locked && <div className="modern-lock-shimmer">🔒</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="modern-features">
        <div className="modern-features-row">
          {features.map((f, i) => (
            <div key={i} className="modern-feature-card glassy-float">
              <div className="modern-feature-icon">{f.icon}</div>
              <div className="modern-feature-title">{f.title}</div>
              <div className="modern-feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="modern-testimonials">
        <h2 className="modern-section-title">What Users Say</h2>
        <div className="modern-testimonial-carousel">
          <button className="modern-carousel-btn" onClick={prevTestimonial}>&lt;</button>
          <div className="modern-testimonial-card glassy-float">
            <div className="modern-testimonial-avatar" aria-label="user icon">{testimonials[testimonialIdx].icon}</div>
            <div className="modern-testimonial-bubble">“{testimonials[testimonialIdx].text}”</div>
            <div className="modern-testimonial-name">- {testimonials[testimonialIdx].name}</div>
          </div>
          <button className="modern-carousel-btn" onClick={nextTestimonial}>&gt;</button>
        </div>
      </section>

      {/* How it Works */}
      <section className="modern-how">
        <h2 className="modern-section-title">How it Works</h2>
        <div className="modern-how-steps">
          <div className="modern-how-step glassy-float">
            <div className="modern-how-icon">📸</div>
            <div className="modern-how-title">Log Junk Food</div>
          </div>
          <div className="modern-how-step glassy-float">
            <div className="modern-how-icon">💡</div>
            <div className="modern-how-title">Get AI Reflection</div>
          </div>
          <div className="modern-how-step glassy-float">
            <div className="modern-how-icon">🔥</div>
            <div className="modern-how-title">Track Progress</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="modern-footer glassy-float">
        <div className="modern-footer-logo">JunkStop</div>
        <div className="modern-footer-social">
          <a href="#"><span role="img" aria-label="twitter">🐦</span></a>
          <a href="#"><span role="img" aria-label="instagram">📸</span></a>
          <a href="#"><span role="img" aria-label="mail">✉️</span></a>
        </div>
        <div className="modern-footer-apps">
          <button className="modern-app-btn">App Store</button>
          <button className="modern-app-btn">Google Play</button>
        </div>
      </footer>

      {/* Floating Emojis/Particles */}
      <div className="modern-floating-emoji" style={{ left: '10%', top: '20%' }}>🍕</div>
      <div className="modern-floating-emoji" style={{ right: '15%', top: '30%' }}>🧁</div>
      <div className="modern-floating-emoji" style={{ left: '20%', bottom: '10%' }}>🥦</div>
      <div className="modern-floating-emoji" style={{ right: '10%', bottom: '15%' }}>💧</div>
    </div>
  );
}

export default App;
