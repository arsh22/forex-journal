const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Create necessary directories if they don't exist
const publicDir = path.join(__dirname, 'public');
const imagesDir = path.join(publicDir, 'images');
const tradesDir = path.join(publicDir, 'trades');

[publicDir, imagesDir, tradesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(publicDir));

// Set view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

// Routes
app.get('/', (req, res) => {
  res.render('index.html');
});

app.get('/add-trade', (req, res) => {
  res.render('add-trade.html');
});

app.get('/view-trades', (req, res) => {
  try {
    const tradeFiles = fs.readdirSync(tradesDir)
      .filter(file => file.endsWith('.json'))
      .sort((a, b) => {
        // Sort by week number descending (newest first)
        const weekA = parseInt(a.match(/\d+/)[0]);
        const weekB = parseInt(b.match(/\d+/)[0]);
        return weekB - weekA;
      });

    const tradesByWeek = {};
    
    tradeFiles.forEach(file => {
      const weekNumber = file.replace('trades-week-', '').replace('.json', '');
      const trades = JSON.parse(fs.readFileSync(path.join(tradesDir, file), 'utf8'));
      tradesByWeek[weekNumber] = trades;
    });
    
    res.render('view-trades.html', { tradesByWeek });
  } catch (error) {
    console.error('Error reading trades:', error);
    res.render('view-trades.html', { tradesByWeek: {} });
  }
});

app.post('/save-trade', upload.single('screenshot'), (req, res) => {
  try {
    const tradeData = {
      currency: req.body.currency,
      tradeType: req.body.tradeType,
      timeframe: req.body.timeframe,
      description: req.body.description,
      goodThings: req.body.goodThings,
      improvements: req.body.improvements,
      date: req.body.date,
      entryTime: req.body.entryTime,
      exitTime: req.body.exitTime,
      screenshot: req.file ? `/images/${req.file.filename}` : null,
      createdAt: new Date().toISOString()
    };

    // Get current week number
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil((((now - startOfYear) / 86400000) + startOfYear.getDay() + 1) / 7);

    // File path for weekly trades
    const filePath = path.join(tradesDir, `trades-week-${weekNumber}.json`);
    
    // Read existing trades or create new array
    let trades = [];
    if (fs.existsSync(filePath)) {
      trades = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    
    // Add new trade
    trades.push(tradeData);
    
    // Save back to file
    fs.writeFileSync(filePath, JSON.stringify(trades, null, 2));
    
    res.redirect('/view-trades');
  } catch (error) {
    console.error('Error saving trade:', error);
    res.status(500).send('Error saving trade');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Access on your tablet: http://[your-computer-ip]:${PORT}`);
});