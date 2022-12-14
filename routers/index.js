const router = require('express').Router()
const express = require('express')
const path = require('path')

// Use express.json middleware
router.use(express.json())

router.get('/chat-app/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'index.html'))
})

router.get('/chat-app/chat', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'chat.html'))
  })

module.exports = router
