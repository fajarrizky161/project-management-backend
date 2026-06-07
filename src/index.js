const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/organizations', require('./modules/organizations/organization.routes'));
app.use('/api/users', require('./modules/users/user.routes'));
app.use('/api/roles', require('./modules/roles/role.routes'));
app.use('/api/projects', require('./modules/projects/project.routes'));
app.use('/api/workflows', require('./modules/workflows/workflow.routes'));
app.use('/api/tasks', require('./modules/tasks/task.routes'));
app.use('/api/comments', require('./modules/comments/comment.routes'));
app.use('/api/notifications', require('./modules/notifications/notification.routes'));
app.use('/api/attachments', require('./modules/attachments/attachment.routes'));
app.use('/api/search', require('./modules/search/search.routes'));
app.use('/api/performance', require('./modules/performance/performance.routes'));
app.use('/api/dashboard', require('./modules/dashboard/dashboard.routes'));

// Static files for uploads
app.use('/uploads', express.static(require('path').join(__dirname, '../uploads')));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

module.exports = app;
