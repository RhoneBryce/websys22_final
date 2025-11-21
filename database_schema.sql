-- SQL Schema for AI Profile Management Platform
-- Run these in phpMyAdmin or MySQL client after creating 'ai_platform' database

-- Users table (matchers)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- AI Profiles table
CREATE TABLE ai_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    personality VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    hobbies VARCHAR(255),
    model_type VARCHAR(255),
    compatibility_tags VARCHAR(255),
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Matches table
CREATE TABLE matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ai1_id INT NOT NULL,
    ai2_id INT NOT NULL,
    FOREIGN KEY (ai1_id) REFERENCES ai_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (ai2_id) REFERENCES ai_profiles(id) ON DELETE CASCADE
);

-- Groups table
CREATE TABLE groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

-- Threads table (for matches or groups)
CREATE TABLE threads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    match_id INT,
    group_id INT,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

-- Messages table
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    thread_id INT NOT NULL,
    sender_ai_id INT NOT NULL,
    message_text TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_ai_id) REFERENCES ai_profiles(id) ON DELETE CASCADE
);

-- Group Members table
CREATE TABLE group_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    ai_id INT NOT NULL,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (ai_id) REFERENCES ai_profiles(id) ON DELETE CASCADE
);
