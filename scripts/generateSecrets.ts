import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const envPath = path.join(__dirname, '../.env');
const examplePath = path.join(__dirname, '../.env.example');

const generateSecureSecret = () => crypto.randomBytes(64).toString('hex');

const initEnv = () => {
    let envContent = '';

    // .env가 없으면 .env.example을 복사하거나 새로 생성
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    } else if (fs.existsSync(examplePath)) {
        console.log('.env file not found. Copying from .env.example...');
        envContent = fs.readFileSync(examplePath, 'utf8');
    } else {
        console.log('.env and .env.example not found. Creating a new one...');
    }

    const secrets = {
        JWT_SECRET: generateSecureSecret(),
        COOKIE_SECRET: generateSecureSecret(),
    };

    let updatedContent = envContent;

    Object.entries(secrets).forEach(([key, value]) => {
        const regex = new RegExp(`^${key}=.*`, 'm');
        if (updatedContent.match(regex)) {
            // 이미 키가 있으면 업데이트
            updatedContent = updatedContent.replace(regex, `${key}=${value}`);
        } else {
            // 키가 없으면 끝에 추가
            updatedContent += `\n${key}=${value}`;
        }
    });

    fs.writeFileSync(envPath, updatedContent.trim() + '\n');
    console.log('Successfully generated and updated secure secrets in .env file.');
};

initEnv();
