import fetch from 'node-fetch';
import prisma from './src/utils/prisma.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

async function main(){
  try{
    const user = await prisma.user.findFirst();
    if(!user){
      console.error('No user in DB to create token for');
      return;
    }
    const secret = process.env.JWT_SECRET;
    if(!secret){
      console.error('No JWT_SECRET in env');
      return;
    }
    const token = jwt.sign({ email: user.email }, secret);

    const payload = {
      token,
      idQuiz: 1,
      title: 'Question via test script',
      type: 'MULTIPLE_CHOICE',
      timeLimit: 30
    };

    const res = await fetch('http://127.0.0.1:5000/api/question/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Body:', text);
  }catch(e){
    console.error(e);
  }finally{
    await prisma.$disconnect();
  }
}

main();
