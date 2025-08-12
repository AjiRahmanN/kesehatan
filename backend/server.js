// server.js
const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
app.use(bodyParser.json());

// Config via env
const {
  DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME, PORT = 3000
} = process.env;

if(!DB_HOST) console.warn('Warning: DB_HOST not set (for local dev set env vars)');

// Sequelize connect
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT || 3306,
  dialect: 'mysql',
  logging: false
});

// Model modular
const Measurement = require('./models/measurements')(sequelize);

// util BMI
function calcBMI(height_cm, weight_kg) {
  const m = height_cm/100;
  const bmi = weight_kg / (m*m);
  let cat = 'Normal';
  if(bmi < 18.5) cat = 'Underweight';
  else if(bmi >= 25) cat = 'Overweight';
  else cat = 'Normal';
  return {bmi, category: cat};
}

app.post('/api/bmi', async (req, res) => {
  try{
    const {height, weight, age} = req.body;
    if(!height || !weight) return res.status(400).json({error:'height and weight required'});

    const {bmi, category} = calcBMI(Number(height), Number(weight));
    const m = await Measurement.create({
      height_cm: height, weight_kg: weight, age: age||null, bmi, category
    });
    res.json({bmi, category, message: `Saved id ${m.id}`});
  }catch(err){
    console.error(err);
    res.status(500).json({error:'server error'});
  }
});

// healthcheck
app.get('/health', (req,res)=>res.send('ok'));

async function start(){
  await sequelize.authenticate();
  await sequelize.sync(); // production: use migrations
  app.listen(PORT, ()=>console.log(`Server running on ${PORT}`));
}
start().catch(e=>{console.error('Failed start', e); process.exit(1)});

// Export for testing