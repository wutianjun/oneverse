const express = require('express');
const router = express.Router();
const controller = require('./controller');

// 普通问答接口
router.post('/chat', controller.handleChat);

// 流式问答接口 (SSE)
router.get('/chat/stream', controller.handleStreamChat);

module.exports = router;
