const express = require('express');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(express.static(path.join(__dirname, 'mobile')));

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>JunkStop Mobile App</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0;
                padding: 20px;
                background: linear-gradient(135deg, #7C3AED, #3B82F6, #1E40AF);
                min-height: 100vh;
                color: white;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                text-align: center;
            }
            .title {
                font-size: 3em;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .subtitle {
                font-size: 1.2em;
                opacity: 0.9;
                margin-bottom: 40px;
            }
            .status {
                background: rgba(34, 197, 94, 0.2);
                border: 1px solid rgba(34, 197, 94, 0.4);
                border-radius: 10px;
                padding: 20px;
                margin: 30px 0;
                font-size: 1.1em;
            }
            .features {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                padding: 30px;
                margin: 30px 0;
                backdrop-filter: blur(10px);
            }
            .feature-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-top: 20px;
            }
            .feature-card {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 15px;
                padding: 20px;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            .code-block {
                background: rgba(0, 0, 0, 0.3);
                border-radius: 8px;
                padding: 15px;
                font-family: 'Courier New', monospace;
                margin: 10px 0;
                text-align: left;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="title">🛑 JunkStop</div>
            <div class="subtitle">Complete Mobile Habit Tracking App</div>
            
            <div class="status">
                ✅ Production-Ready MVP Complete<br>
                Pure React Native + Expo mobile application with all features implemented
            </div>
            
            <div class="features">
                <h2>Complete Feature Set</h2>
                <div class="feature-grid">
                    <div class="feature-card">
                        <h4>📱 Mobile-First Design</h4>
                        <p>React Native + Expo</p>
                    </div>
                    <div class="feature-card">
                        <h4>📸 Photo Logging</h4>
                        <p>Camera with rating system</p>
                    </div>
                    <div class="feature-card">
                        <h4>🔥 Streak Tracking</h4>
                        <p>Automatic calculation</p>
                    </div>
                    <div class="feature-card">
                        <h4>🤖 AI Coaching</h4>
                        <p>Smart motivational messages</p>
                    </div>
                    <div class="feature-card">
                        <h4>📊 Progress Charts</h4>
                        <p>Visual trend analysis</p>
                    </div>
                    <div class="feature-card">
                        <h4>👥 Community</h4>
                        <p>Confessions & achievements</p>
                    </div>
                    <div class="feature-card">
                        <h4>🔔 Notifications</h4>
                        <p>Daily reminders</p>
                    </div>
                    <div class="feature-card">
                        <h4>⚙️ Settings</h4>
                        <p>Full data management</p>
                    </div>
                </div>
            </div>
            
            <div class="features">
                <h2>🚀 Ready for Deployment</h2>
                <div class="code-block">
cd mobile<br>
npm start          # Start development server<br>
npx eas build      # Build for production<br>
npx eas submit     # Submit to app stores
                </div>
                
                <h3>Production Features</h3>
                <ul style="text-align: left;">
                    <li>Firebase Authentication & Cloud Storage</li>
                    <li>PostgreSQL Database with REST API</li>
                    <li>OpenRouter AI Integration</li>
                    <li>Push Notification System</li>
                    <li>Offline Functionality with Cloud Sync</li>
                    <li>EAS Build Configuration</li>
                </ul>
            </div>
        </div>
    </body>
    </html>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('JunkStop Mobile App showcase running on port 5000');
  console.log('Complete React Native + Expo application ready for deployment');
});